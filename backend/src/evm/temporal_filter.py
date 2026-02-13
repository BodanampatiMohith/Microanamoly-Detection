"""
Temporal filtering for EVM using band-pass filters.
"""
import numpy as np
from scipy import signal as sp_signal
from typing import Tuple
from src.utils.config import EVM_CONFIG


class TemporalBandPassFilter:
    """Butterworth band-pass filter for temporal signals."""

    def __init__(
        self,
        low_freq: float = None,
        high_freq: float = None,
        sampling_rate: float = None,
        order: int = 4,
    ):
        """Initialize temporal band-pass filter.

        Args:
            low_freq: Low cutoff frequency (Hz)
            high_freq: High cutoff frequency (Hz)
            sampling_rate: Sampling rate (Hz/FPS)
            order: Filter order
        """
        self.low_freq = low_freq or EVM_CONFIG["cutoff_freq_low"]
        self.high_freq = high_freq or EVM_CONFIG["cutoff_freq_high"]
        self.sampling_rate = sampling_rate or EVM_CONFIG["sampling_rate"]
        self.order = order

        # Design filter
        nyquist = self.sampling_rate / 2.0
        low_norm = self.low_freq / nyquist
        high_norm = self.high_freq / nyquist

        # Clamp to valid range
        low_norm = max(0.001, min(0.999, low_norm))
        high_norm = max(0.001, min(0.999, high_norm))

        # Ensure low < high
        if low_norm >= high_norm:
            low_norm, high_norm = high_norm * 0.5, high_norm

        self.b, self.a = sp_signal.butter(
            self.order, [low_norm, high_norm], btype="band"
        )

    def filter_signal(self, signal_data: np.ndarray) -> np.ndarray:
        """Apply band-pass filter to signal.

        Args:
            signal_data: 1D or 2D signal array

        Returns:
            Filtered signal
        """
        if signal_data.size == 0:
            return signal_data

        if signal_data.ndim == 1:
            # 1D signal
            return sp_signal.lfilter(self.b, self.a, signal_data)
        else:
            # 2D array - filter each row
            filtered = np.zeros_like(signal_data)
            for i in range(signal_data.shape[0]):
                filtered[i] = sp_signal.lfilter(self.b, self.a, signal_data[i])
            return filtered

    def filter_spatial_temporal(
        self, spatial_temporal_data: np.ndarray,
    ) -> np.ndarray:
        """Filter spatial-temporal data (H x W x T).

        Args:
            spatial_temporal_data: Array of shape (height, width, time)

        Returns:
            Filtered array of same shape
        """
        h, w, t = spatial_temporal_data.shape
        filtered = np.zeros_like(spatial_temporal_data)

        for y in range(h):
            for x in range(w):
                time_series = spatial_temporal_data[y, x, :]
                if np.any(time_series):
                    filtered[y, x, :] = self.filter_signal(time_series)

        return filtered


class TemporalBuffer:
    """Circular buffer for maintaining temporal history."""

    def __init__(self, max_size: int, shape: Tuple = None):
        """Initialize temporal buffer.

        Args:
            max_size: Maximum buffer size
            shape: Shape of elements to store (optional)
        """
        self.max_size = max_size
        self.shape = shape
        self.buffer = []
        self.is_full = False

    def append(self, data: np.ndarray) -> None:
        """Add data to buffer.

        Args:
            data: Data to append
        """
        if len(self.buffer) < self.max_size:
            self.buffer.append(data.copy())
        else:
            self.buffer.pop(0)
            self.buffer.append(data.copy())
            if len(self.buffer) >= self.max_size:
                self.is_full = True

    def get_array(self) -> np.ndarray:
        """Get buffer contents as array.

        Returns:
            Array of shape (buffer_size, ...)
        """
        if not self.buffer:
            return np.array([])

        return np.array(self.buffer)

    def is_ready(self, min_size: int = None) -> bool:
        """Check if buffer has enough data.

        Args:
            min_size: Minimum size required

        Returns:
            True if buffer size >= min_size
        """
        if min_size is None:
            min_size = self.max_size // 2

        return len(self.buffer) >= min_size

    def clear(self) -> None:
        """Clear buffer."""
        self.buffer = []
        self.is_full = False

    def __len__(self) -> int:
        """Get current buffer size."""
        return len(self.buffer)
