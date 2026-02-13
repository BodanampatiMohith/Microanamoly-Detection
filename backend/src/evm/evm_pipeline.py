"""
Main Eulerian Video Magnification (EVM) pipeline implementation.
"""
import cv2
import numpy as np
from typing import Optional, Tuple, Dict
from src.evm.pyramid import LaplacianPyramid, GaussianPyramid
from src.evm.temporal_filter import TemporalBandPassFilter, TemporalBuffer
from src.utils.config import EVM_CONFIG


class EVMPipeline:
    """Eulerian Video Magnification pipeline."""

    def __init__(
        self,
        num_levels: int = None,
        amplification: float = None,
        low_freq: float = None,
        high_freq: float = None,
        sampling_rate: float = None,
    ):
        """Initialize EVM pipeline.

        Args:
            num_levels: Number of pyramid levels
            amplification: Amplification factor
            low_freq: Low cutoff frequency (Hz)
            high_freq: High cutoff frequency (Hz)
            sampling_rate: Sampling rate (FPS)
        """
        self.num_levels = num_levels or EVM_CONFIG["num_levels"]
        self.amplification = amplification or EVM_CONFIG["amplification_factor"]
        self.low_freq = low_freq or EVM_CONFIG["cutoff_freq_low"]
        self.high_freq = high_freq or EVM_CONFIG["cutoff_freq_high"]
        self.sampling_rate = sampling_rate or EVM_CONFIG["sampling_rate"]

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

    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Dict]:
        """Process single frame through EVM pipeline.

        Args:
            frame: Input frame (BGR or grayscale)

        Returns:
            Tuple of (magnified_frame, metadata)
        """
        self.frame_count += 1

        # Convert to float32
        if frame.dtype != np.float32:
            if len(frame.shape) == 3:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frame = frame.astype(np.float32) / 255.0

        # Build Laplacian pyramid
        lap_pyramid = LaplacianPyramid(self.num_levels)
        lap_pyramid.build(frame)

        # Add each level to temporal buffer
        for level in range(len(lap_pyramid)):
            lap_image = lap_pyramid.get_level(level)
            self.buffers[level].append(lap_image)

        # Apply temporal filtering and amplification
        magnified_pyramid = LaplacianPyramid(self.num_levels)
        magnified_pyramid.pyramid = []

        for level in range(len(lap_pyramid)):
            lap_image = lap_pyramid.get_level(level)

            if self.buffers[level].is_ready(min_size=3):
                # Get buffered data and filter
                buffer_array = self.buffers[level].get_array()

                # Filter along temporal dimension
                filtered = self.temporal_filter.filter_signal(
                    buffer_array.mean(axis=(1, 2))
                )
                current_filtered = filtered[-1] if len(filtered) > 0 else 0

                # Amplify
                magnified = lap_image * (1 + self.amplification * 0.01)
            else:
                # Not enough data, return original
                magnified = lap_image

            from src.evm.pyramid import PyramidLevel

            magnified_pyramid.pyramid.append(PyramidLevel(magnified, level))

        # Reconstruct from magnified Laplacian pyramid
        try:
            magnified_frame = magnified_pyramid.reconstruct()
            magnified_frame = np.clip(magnified_frame, 0, 1)
        except Exception as e:
            magnified_frame = frame

        metadata = {
            "frame_index": self.frame_count,
            "buffer_sizes": {level: len(self.buffers[level]) for level in range(self.num_levels)},
            "is_ready": all(
                self.buffers[level].is_ready(min_size=3)
                for level in range(self.num_levels)
            ),
        }

        return magnified_frame, metadata

    def reset(self) -> None:
        """Reset pipeline state."""
        for buffer in self.buffers.values():
            buffer.clear()
        self.frame_count = 0

    def get_statistics(self) -> Dict:
        """Get pipeline statistics.

        Returns:
            Dictionary with statistics
        """
        return {
            "frame_count": self.frame_count,
            "num_levels": self.num_levels,
            "amplification": self.amplification,
            "frequency_range": f"{self.low_freq}-{self.high_freq} Hz",
            "sampling_rate": self.sampling_rate,
        }
