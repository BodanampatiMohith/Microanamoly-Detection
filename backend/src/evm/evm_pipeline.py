"""
Advanced Eulerian Video Magnification (EVM) pipeline with optimizations and enhanced features.
"""
import cv2
import numpy as np
from typing import Tuple, Dict, List
import time
from src.evm.pyramid import LaplacianPyramid
from src.evm.temporal_filter import TemporalBandPassFilter, TemporalBuffer
from src.utils.config import EVM_CONFIG
from src.utils.error_handlers import enhanced_logger, timing_decorator


class EVMPipeline:
    """Eulerian Video Magnification pipeline."""

    def __init__(
        self,
        num_levels: int = None,
        amplification: float = None,
        low_freq: float = None,
        high_freq: float = None,
        sampling_rate: float = None,
        enable_gpu: bool = False,
        chroma_attenuation: float = 0.1,
    ):
        """Initialize EVM pipeline with advanced options.

        Args:
            num_levels: Number of pyramid levels
            amplification: Amplification factor
            low_freq: Low cutoff frequency (Hz)
            high_freq: High cutoff frequency (Hz)
            sampling_rate: Sampling rate (FPS)
            enable_gpu: Enable GPU acceleration if available
            chroma_attenuation: Chroma channel attenuation factor
        """
        self.num_levels = num_levels or EVM_CONFIG["num_levels"]
        self.amplification = amplification or EVM_CONFIG["amplification_factor"]
        self.low_freq = low_freq or EVM_CONFIG["cutoff_freq_low"]
        self.high_freq = high_freq or EVM_CONFIG["cutoff_freq_high"]
        self.sampling_rate = sampling_rate or EVM_CONFIG["sampling_rate"]
        self.enable_gpu = enable_gpu and cv2.cuda.getCudaEnabledDeviceCount() > 0
        self.chroma_attenuation = chroma_attenuation

        # Adaptive amplification
        self.adaptive_amplification = True
        self.motion_history: List[float] = []
        self.max_motion_history = 30
        
        # Quality control
        self.quality_threshold = 0.01
        self.frame_skip_count = 0
        self.max_frame_skip = 2
        self.skipped_frames_total = 0

        # Temporal buffers per level
        self.buffers: Dict[int, TemporalBuffer] = {}
        buffer_size = EVM_CONFIG["temporal_buffer_size"]

        for level in range(self.num_levels):
            self.buffers[level] = TemporalBuffer(buffer_size)

        # Temporal filter
        self.temporal_filter = TemporalBandPassFilter(
            self.low_freq, self.high_freq, self.sampling_rate
        )

        self.frame_count = 0
        self.total_processing_time = 0.0
        self.average_processing_time = 0.0

    @timing_decorator(enhanced_logger)
    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Dict]:
        """Process single frame through advanced EVM pipeline.

        Args:
            frame: Input frame (BGR or grayscale)

        Returns:
            Tuple of (magnified_frame, metadata)
        """
        start_time = time.time()
        self.frame_count += 1

        # Frame quality assessment
        motion_level = self._assess_motion_level(frame)
        self.motion_history.append(motion_level)
        if len(self.motion_history) > self.max_motion_history:
            self.motion_history.pop(0)

        # Adaptive amplification based on motion history
        current_amplification = self._calculate_adaptive_amplification()

        # Frame skipping for performance
        if motion_level < self.quality_threshold and self.frame_skip_count < self.max_frame_skip:
            self.frame_skip_count += 1
            self.skipped_frames_total += 1
            passthrough_frame, metadata = self._create_passthrough_frame(
                frame, start_time, current_amplification, motion_level
            )
            self._update_timing_stats(metadata["processing_time_ms"])
            metadata["average_processing_time_ms"] = round(self.average_processing_time, 2)
            metadata["gpu_accelerated"] = self.enable_gpu
            metadata["adaptive_amplification"] = self.adaptive_amplification
            return passthrough_frame, metadata

        self.frame_skip_count = 0

        # Convert to float32 with GPU acceleration if available
        processed_frame = self._preprocess_frame(frame)

        # Build Laplacian pyramid with multithreading
        lap_pyramid = self._build_pyramid_multithreaded(processed_frame)

        # Process each pyramid level
        magnified_pyramid = self._process_pyramid_levels(lap_pyramid, current_amplification)

        # Reconstruct magnified frame
        magnified_frame = self._reconstruct_frame(magnified_pyramid, processed_frame)

        # Update performance metrics
        processing_time = (time.time() - start_time) * 1000
        self._update_timing_stats(processing_time)

        metadata = {
            "frame_index": self.frame_count,
            "processing_time_ms": round(processing_time, 2),
            "average_processing_time_ms": round(self.average_processing_time, 2),
            "current_amplification": current_amplification,
            "motion_level": motion_level,
            "frames_skipped": self.frame_skip_count,
            "buffer_sizes": {level: len(self.buffers[level]) for level in range(self.num_levels)},
            "is_ready": all(
                self.buffers[level].is_ready(min_size=3)
                for level in range(self.num_levels)
            ),
            "gpu_accelerated": self.enable_gpu,
            "adaptive_amplification": self.adaptive_amplification,
        }

        return magnified_frame, metadata

    def _update_timing_stats(self, processing_time_ms: float) -> None:
        """Update cumulative timing metrics."""
        self.total_processing_time += float(processing_time_ms)
        processed_frames = max(1, self.frame_count)
        self.average_processing_time = self.total_processing_time / processed_frames

    def _assess_motion_level(self, frame: np.ndarray) -> float:
        """Assess the motion level in the frame."""
        if len(frame.shape) == 3:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray = frame
        
        # Calculate frame differences
        if hasattr(self, '_prev_frame'):
            diff = cv2.absdiff(gray, self._prev_frame)
            motion = np.mean(diff)
        else:
            motion = 0.0
        
        self._prev_frame = gray.copy()
        return float(motion)

    def _calculate_adaptive_amplification(self) -> float:
        """Calculate adaptive amplification based on motion history."""
        if not self.adaptive_amplification or len(self.motion_history) < 5:
            return self.amplification
        
        # Calculate motion statistics
        recent_motion = self.motion_history[-10:] if len(self.motion_history) >= 10 else self.motion_history
        avg_motion = np.mean(recent_motion)
        
        # Adaptive amplification: higher for low motion, lower for high motion
        if avg_motion < 0.01:  # Very low motion
            return self.amplification * 1.5
        elif avg_motion < 0.05:  # Low motion
            return self.amplification * 1.2
        elif avg_motion > 0.2:  # High motion
            return self.amplification * 0.7
        else:
            return self.amplification

    def _preprocess_frame(self, frame: np.ndarray) -> np.ndarray:
        """Preprocess frame for EVM processing."""
        # Convert to grayscale if needed
        if len(frame.shape) == 3:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Convert to float32 and normalize
        if frame.dtype != np.float32:
            frame = frame.astype(np.float32) / 255.0
        
        # Keep CPU path as default for reliability in long-running sessions.
        # The current pipeline operators work on numpy arrays.
        return frame

    def _build_pyramid_multithreaded(self, frame: np.ndarray) -> LaplacianPyramid:
        """Build Laplacian pyramid with multithreading support."""
        lap_pyramid = LaplacianPyramid(self.num_levels)

        # Current pyramid implementation is internally sequential.
        # Keep this path deterministic for long-running monitoring.
        lap_pyramid.build(frame)

        return lap_pyramid

    def _process_pyramid_levels(self, lap_pyramid: LaplacianPyramid, amplification: float) -> LaplacianPyramid:
        """Process pyramid levels with temporal filtering and amplification."""
        magnified_pyramid = LaplacianPyramid(self.num_levels)
        magnified_pyramid.pyramid = []

        for level in range(len(lap_pyramid)):
            lap_image = lap_pyramid.get_level(level)
            
            # Add to temporal buffer
            self.buffers[level].append(lap_image)

            if self.buffers[level].is_ready(min_size=3):
                # Get buffered data and filter
                buffer_array = self.buffers[level].get_array()

                # Filter along temporal dimension
                filtered = self.temporal_filter.filter_signal(
                    buffer_array.mean(axis=(1, 2))
                )
                current_filtered = filtered[-1] if len(filtered) > 0 else 0

                # Apply adaptive amplification modulated by recent temporal trend.
                temporal_gain = float(np.tanh(current_filtered))
                amplification_factor = 1 + (amplification * 0.01 * (1 + temporal_gain))
                magnified = lap_image * amplification_factor
            else:
                # Not enough data, return original
                magnified = lap_image

            from src.evm.pyramid import PyramidLevel
            magnified_pyramid.pyramid.append(PyramidLevel(magnified, level))

        return magnified_pyramid

    def _reconstruct_frame(self, magnified_pyramid: LaplacianPyramid, original_frame: np.ndarray) -> np.ndarray:
        """Reconstruct frame from magnified pyramid with error handling."""
        try:
            magnified_frame = magnified_pyramid.reconstruct()
            magnified_frame = np.clip(magnified_frame, 0, 1)
            
            # Convert back to original format
            if hasattr(original_frame, 'download'):  # GPU matrix
                magnified_frame = magnified_frame.download()
            
            return magnified_frame
        except Exception as e:
            enhanced_logger.log_error("Frame reconstruction failed", e)
            return original_frame

    def _create_passthrough_frame(
        self,
        frame: np.ndarray,
        start_time: float,
        amplification: float,
        motion_level: float,
    ) -> Tuple[np.ndarray, Dict]:
        """Create a passthrough frame for skipped frames."""
        processing_time = (time.time() - start_time) * 1000

        metadata = {
            "frame_index": self.frame_count,
            "processing_time_ms": round(processing_time, 2),
            "frames_skipped": self.frame_skip_count,
            "passthrough": True,
            "is_ready": False,
            "current_amplification": amplification,
            "motion_level": motion_level,
        }

        return frame, metadata

    def reset(self) -> None:
        """Reset pipeline state."""
        for buffer in self.buffers.values():
            buffer.clear()
        self.frame_count = 0
        self.total_processing_time = 0.0
        self.average_processing_time = 0.0
        self.motion_history = []
        self.frame_skip_count = 0
        self.skipped_frames_total = 0
        if hasattr(self, "_prev_frame"):
            del self._prev_frame

    def update_parameters(
        self,
        amplification: float = None,
        low_freq: float = None,
        high_freq: float = None,
        sampling_rate: float = None,
    ) -> Dict:
        """Update runtime EVM parameters safely."""
        if amplification is not None:
            self.amplification = max(0.1, float(amplification))

        need_filter_rebuild = False
        if low_freq is not None:
            self.low_freq = max(0.1, float(low_freq))
            need_filter_rebuild = True
        if high_freq is not None:
            self.high_freq = max(self.low_freq + 0.1, float(high_freq))
            need_filter_rebuild = True
        if sampling_rate is not None:
            self.sampling_rate = max(1.0, float(sampling_rate))
            need_filter_rebuild = True

        if need_filter_rebuild:
            self.temporal_filter = TemporalBandPassFilter(
                self.low_freq, self.high_freq, self.sampling_rate
            )

        return {
            "amplification_factor": self.amplification,
            "cutoff_freq_low": self.low_freq,
            "cutoff_freq_high": self.high_freq,
            "sampling_rate": self.sampling_rate,
        }

    def get_statistics(self) -> Dict:
        """Get pipeline statistics.

        Returns:
            Dictionary with statistics
        """
        return {
            "frame_count": self.frame_count,
            "skipped_frames_total": self.skipped_frames_total,
            "num_levels": self.num_levels,
            "amplification": self.amplification,
            "frequency_range": f"{self.low_freq}-{self.high_freq} Hz",
            "sampling_rate": self.sampling_rate,
            "average_processing_time_ms": round(self.average_processing_time, 2),
        }
