"""
Feature extraction from motion signals (time and frequency domain).
"""
import numpy as np
from scipy import signal as sp_signal, fft as sp_fft
from typing import Dict, List
from src.utils.config import SIGNAL_CONFIG, FEATURES_CONFIG


class FeatureExtractor:
    """Extract time and frequency domain features from motion signal."""

    def __init__(self, sampling_rate: float = 30.0):
        """Initialize feature extractor.

        Args:
            sampling_rate: Sampling rate in Hz (FPS)
        """
        self.sampling_rate = sampling_rate

    def extract_features(self, motion_signal: np.ndarray) -> Dict:
        """Extract all features from motion signal.

        Args:
            motion_signal: 1D motion signal array

        Returns:
            Dictionary of extracted features
        """
        if len(motion_signal) < 3:
            return self._zero_features()

        features = {}

        # Time domain features
        time_features = self._extract_time_features(motion_signal)
        features.update(time_features)

        # Frequency domain features
        freq_features = self._extract_frequency_features(motion_signal)
        features.update(freq_features)

        return features

    def _extract_time_features(self, signal: np.ndarray) -> Dict[str, float]:
        """Extract time domain features.

        Args:
            signal: Input signal

        Returns:
            Dictionary of time domain features
        """
        return {
            "mean": float(np.mean(signal)),
            "variance": float(np.var(signal)),
            "std_dev": float(np.std(signal)),
            "rms": float(np.sqrt(np.mean(signal**2))),
            "peak_to_peak": float(np.max(signal) - np.min(signal)),
            "max_value": float(np.max(signal)),
            "min_value": float(np.min(signal)),
        }

    def _extract_frequency_features(self, signal: np.ndarray) -> Dict[str, float]:
        """Extract frequency domain features.

        Args:
            signal: Input signal

        Returns:
            Dictionary of frequency domain features
        """
        # Apply window to reduce spectral leakage
        windowed = signal * sp_signal.windows.hann(len(signal))

        # Compute FFT
        fft_result = sp_fft.rfft(windowed)
        freqs = sp_fft.rfftfreq(len(signal), 1.0 / self.sampling_rate)
        magnitude = np.abs(fft_result)

        # Dominant frequency
        dominant_idx = np.argmax(magnitude)
        dominant_freq = float(freqs[dominant_idx]) if dominant_idx > 0 else 0.0

        # Spectral energy in bands
        energy_features = {}
        total_energy = np.sum(magnitude**2)
        spectrum_points = [
            {
                "frequency": float(freq),
                "magnitude": float(mag),
            }
            for freq, mag in zip(freqs[1:65], magnitude[1:65])
        ]

        for band in FEATURES_CONFIG["energy_bands"]:
            name = band["name"]
            freq_min = band["min"]
            freq_max = band["max"]

            mask = (freqs >= freq_min) & (freqs <= freq_max)
            band_energy = np.sum(magnitude[mask] ** 2)
            band_ratio = band_energy / total_energy if total_energy > 0 else 0

            energy_features[f"energy_{name}"] = float(band_energy)
            energy_features[f"energy_ratio_{name}"] = float(band_ratio)

        return {
            "dominant_frequency": dominant_freq,
            "spectral_centroid": float(np.average(freqs, weights=magnitude)),
            "spectral_entropy": float(self._spectral_entropy(magnitude)),
            "spectrum_points": spectrum_points,
            **energy_features,
        }

    def _spectral_entropy(self, magnitude: np.ndarray) -> float:
        """Compute spectral entropy.

        Args:
            magnitude: FFT magnitude spectrum

        Returns:
            Spectral entropy value
        """
        # Normalize to probability distribution
        s = magnitude ** 2
        s_norm = s / np.sum(s) if np.sum(s) > 0 else s

        # Remove zeros to avoid log(0)
        s_norm = s_norm[s_norm > 0]

        # Calculate entropy
        entropy = -np.sum(s_norm * np.log2(s_norm))
        return float(entropy)

    def _zero_features(self) -> Dict[str, float]:
        """Return zero/default features.

        Returns:
            Dictionary with zero values
        """
        features = {
            "mean": 0.0,
            "variance": 0.0,
            "std_dev": 0.0,
            "rms": 0.0,
            "peak_to_peak": 0.0,
            "max_value": 0.0,
            "min_value": 0.0,
            "dominant_frequency": 0.0,
            "spectral_centroid": 0.0,
            "spectral_entropy": 0.0,
            "spectrum_points": [],
        }

        for band in FEATURES_CONFIG["energy_bands"]:
            name = band["name"]
            features[f"energy_{name}"] = 0.0
            features[f"energy_ratio_{name}"] = 0.0

        return features
