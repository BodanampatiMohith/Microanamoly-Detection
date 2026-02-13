"""
Motion signal extraction from video frames.
"""
import numpy as np
import cv2
from typing import Tuple, Optional
from src.utils.config import SIGNAL_CONFIG


class MotionSignalExtractor:
    """Extract 1D motion signal from frames."""

    def __init__(self):
        """Initialize motion signal extractor."""
        self.previous_frame: Optional[np.ndarray] = None
        self.motion_buffer = []
        self.max_buffer_size = 300  # 10 seconds at 30 FPS

    def extract_signal(
        self, current_frame: np.ndarray, method: str = "intensity_delta"
    ) -> float:
        """Extract motion amplitude from frame.

        Args:
            current_frame: Current frame
            method: 'intensity_delta' or 'optical_flow'

        Returns:
            Scalar motion signal value
        """
        if current_frame.dtype != np.float32:
            current_frame = current_frame.astype(np.float32)

        if self.previous_frame is None:
            self.previous_frame = current_frame.copy()
            return 0.0

        if method == "intensity_delta":
            signal_value = self._intensity_delta(current_frame)
        elif method == "optical_flow":
            signal_value = self._optical_flow_magnitude(current_frame)
        else:
            signal_value = self._intensity_delta(current_frame)

        self.previous_frame = current_frame.copy()
        return max(0, signal_value)

    def _intensity_delta(self, current_frame: np.ndarray) -> float:
        """Compute mean absolute difference in intensity.

        Args:
            current_frame: Current frame

        Returns:
            Mean absolute intensity difference
        """
        diff = np.abs(current_frame - self.previous_frame)
        return float(np.mean(diff))

    def _optical_flow_magnitude(self, current_frame: np.ndarray) -> float:
        """Compute optical flow magnitude.

        Args:
            current_frame: Current frame

        Returns:
            Mean optical flow magnitude
        """
        # Downsample for speed
        prev_small = cv2.resize(
            self.previous_frame, (100, 100), interpolation=cv2.INTER_LINEAR
        )
        curr_small = cv2.resize(
            current_frame, (100, 100), interpolation=cv2.INTER_LINEAR
        )

        try:
            # Compute dense optical flow
            flow = cv2.calcOpticalFlowFarneback(
                prev_small, curr_small, None, 0.5, 3, 15, 3, 5, 1.2, 0
            )

            # Compute magnitude
            magnitude = np.sqrt(flow[..., 0] ** 2 + flow[..., 1] ** 2)
            return float(np.mean(magnitude))
        except Exception:
            return 0.0

    def append_signal(self, value: float) -> None:
        """Append motion signal value to buffer.

        Args:
            value: Signal value to append
        """
        self.motion_buffer.append(value)

        if len(self.motion_buffer) > self.max_buffer_size:
            self.motion_buffer.pop(0)

    def get_buffer(self) -> np.ndarray:
        """Get motion signal buffer as array.

        Returns:
            Motion signal buffer
        """
        return np.array(self.motion_buffer)

    def get_window(self, window_size: int = None) -> np.ndarray:
        """Get last N samples of motion signal.

        Args:
            window_size: Number of samples

        Returns:
            Last N samples
        """
        if window_size is None:
            window_size = SIGNAL_CONFIG["window_size"]

        if len(self.motion_buffer) < window_size:
            return np.array(self.motion_buffer)

        return np.array(self.motion_buffer[-window_size:])

    def clear(self) -> None:
        """Clear motion signal buffer."""
        self.motion_buffer = []
        self.previous_frame = None
