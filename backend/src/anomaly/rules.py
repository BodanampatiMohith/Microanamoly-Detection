"""
Rule-based anomaly detection module.
"""
import numpy as np
from typing import Dict, Tuple
from src.utils.config import ANOMALY_CONFIG


class RuleBasedDetector:
    """Rule-based anomaly detection using feature thresholds."""

    def __init__(self, config: Dict = None):
        """Initialize rule-based detector.

        Args:
            config: Configuration dictionary
        """
        self.config = config or ANOMALY_CONFIG
        self.rms_ref = self.config["rms_reference"]
        self.rms_range = self.config["rms_range"]
        self.freq_ref = self.config["frequency_reference"]
        self.freq_range = self.config["frequency_range"]
        self.normal_threshold = self.config["normal_threshold"]

    def detect(self, features: Dict) -> Tuple[str, float]:
        """Detect anomaly from features.

        Args:
            features: Dictionary of extracted features

        Returns:
            Tuple of (status, anomaly_index) where:
            - status: "Normal" or "Abnormal"
            - anomaly_index: 0.0 (abnormal) to 1.0 (normal)
        """
        anomaly_index = self._compute_anomaly_index(features)
        status = "Normal" if anomaly_index > self.normal_threshold else "Abnormal"

        return status, anomaly_index

    def _compute_anomaly_index(self, features: Dict) -> float:
        """Compute scalar anomaly index (0=abnormal, 1=normal).

        Args:
            features: Dictionary of extracted features

        Returns:
            Anomaly index value (0.0 to 1.0)
        """
        index = 1.0

        # Penalize RMS deviation
        rms = features.get("rms", 0.0)
        rms_deviation = abs(rms - self.rms_ref)
        rms_penalty = min(1.0, rms_deviation / self.rms_range) * 0.3

        # Penalize frequency deviation
        dom_freq = features.get("dominant_frequency", 0.0)
        if dom_freq > 0:
            freq_deviation = abs(dom_freq - self.freq_ref)
            freq_penalty = min(1.0, freq_deviation / self.freq_range) * 0.3
        else:
            freq_penalty = 0.0

        # Penalize high variance (instability)
        variance = features.get("variance", 0.0)
        variance_penalty = min(0.2, variance / 2.0)

        # Penalize spectral entropy (unexpected frequency content)
        entropy = features.get("spectral_entropy", 0.0)
        entropy_max = 10.0  # Typical max entropy
        entropy_penalty = min(0.2, entropy / entropy_max)

        # Apply penalties
        index -= rms_penalty
        index -= freq_penalty
        index -= variance_penalty
        index -= entropy_penalty

        # Clamp to valid range
        index = max(0.0, min(1.0, index))

        return index

    def update_baseline(self, normal_features_list: list) -> None:
        """Update baseline parameters from normal operating data.

        Args:
            normal_features_list: List of feature dictionaries from normal operation
        """
        if not normal_features_list:
            return

        # Compute statistics
        rms_values = [f.get("rms", 0) for f in normal_features_list]
        freq_values = [f.get("dominant_frequency", 0) for f in normal_features_list]

        if rms_values:
            self.rms_ref = np.mean(rms_values)
            self.rms_range = max(np.std(rms_values) * 3, 0.5)  # 3-sigma rule

        if freq_values:
            self.freq_ref = np.mean(freq_values)
            self.freq_range = max(np.std(freq_values) * 3, 2.0)
