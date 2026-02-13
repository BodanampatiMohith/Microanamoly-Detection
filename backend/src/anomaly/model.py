"""
ML-based anomaly detection module (optional advanced models).
"""
import numpy as np
from typing import Dict, Tuple, Optional
import pickle
import os


class MLAnomalyDetector:
    """Machine Learning based anomaly detection."""

    def __init__(self, model_path: str = None):
        """Initialize ML detector.

        Args:
            model_path: Path to saved sklearn model
        """
        self.model = None
        self.feature_names = []
        self.scaler = None

        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

    def load_model(self, model_path: str) -> None:
        """Load trained model from file.

        Args:
            model_path: Path to saved model file
        """
        try:
            with open(model_path, "rb") as f:
                model_dict = pickle.load(f)
                self.model = model_dict.get("model")
                self.feature_names = model_dict.get("feature_names", [])
                self.scaler = model_dict.get("scaler")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None

    def save_model(self, model_path: str) -> None:
        """Save trained model to file.

        Args:
            model_path: Path to save model
        """
        if self.model is None:
            raise ValueError("No model to save")

        model_dict = {
            "model": self.model,
            "feature_names": self.feature_names,
            "scaler": self.scaler,
        }

        with open(model_path, "wb") as f:
            pickle.dump(model_dict, f)

    def detect(self, features: Dict) -> Tuple[str, float]:
        """Detect anomaly using ML model.

        Args:
            features: Dictionary of extracted features

        Returns:
            Tuple of (status, anomaly_score)
        """
        if self.model is None:
            return "Unknown", 0.5

        try:
            # Extract features in same order
            feature_vector = self._prepare_features(features)

            # Scale if scaler available
            if self.scaler:
                feature_vector = self.scaler.transform([feature_vector])
            else:
                feature_vector = np.array([feature_vector])

            # Predict with model
            prediction = self.model.predict(feature_vector)[0]
            score = self._get_anomaly_score(feature_vector)

            status = "Normal" if prediction == 1 else "Abnormal"
            return status, score

        except Exception as e:
            print(f"Error in ML detection: {e}")
            return "Unknown", 0.5

    def _prepare_features(self, features: Dict) -> np.ndarray:
        """Prepare feature vector in correct order.

        Args:
            features: Dictionary of features

        Returns:
            Feature vector as numpy array
        """
        if not self.feature_names:
            # Use default feature order
            self.feature_names = [
                "rms",
                "variance",
                "dominant_frequency",
                "spectral_entropy",
                "peak_to_peak",
            ]

        feature_vector = []
        for fname in self.feature_names:
            feature_vector.append(features.get(fname, 0.0))

        return np.array(feature_vector)

    def _get_anomaly_score(self, feature_vector: np.ndarray) -> float:
        """Get anomaly score from model.

        Args:
            feature_vector: Prepared feature vector

        Returns:
            Anomaly score (0.0 to 1.0)
        """
        try:
            # Try to get decision function (for SVM)
            if hasattr(self.model, "decision_function"):
                score = self.model.decision_function(feature_vector)[0]
                # Normalize to [0, 1] range
                return max(0.0, min(1.0, (score + 1.0) / 2.0))

            # Try to get predict_proba (for classifiers)
            if hasattr(self.model, "predict_proba"):
                proba = self.model.predict_proba(feature_vector)[0]
                # Return probability of normal class
                return float(proba[1]) if len(proba) > 1 else 0.5

            # Fallback
            return 0.5

        except Exception:
            return 0.5
