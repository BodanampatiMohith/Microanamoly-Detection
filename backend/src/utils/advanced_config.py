"""
Advanced configuration management with environment-based settings and validation.
"""

import os
import json
from typing import Dict, Any, Optional
from pathlib import Path


class ConfigManager:
    """Advanced configuration manager with validation and environment support."""
    
    def __init__(self, config_dir: Optional[str] = None):
        self.config_dir = Path(config_dir or os.path.dirname(__file__))
        self._config_cache = {}
        self.load_all_configs()
    
    def load_all_configs(self):
        """Load all configuration files with environment overrides."""
        # Base configurations
        self._config_cache['evm'] = self._load_evm_config()
        self._config_cache['signal'] = self._load_signal_config()
        self._config_cache['anomaly'] = self._load_anomaly_config()
        self._config_cache['api'] = self._load_api_config()
        self._config_cache['features'] = self._load_features_config()
        
        # Apply environment overrides
        self._apply_environment_overrides()
        
        # Validate configurations
        self._validate_all_configs()
    
    def _load_evm_config(self) -> Dict[str, Any]:
        """Load EVM configuration with advanced defaults."""
        return {
            "num_levels": int(os.getenv("EVM_LEVELS", 4)),
            "amplification_factor": float(os.getenv("EVM_AMPLIFICATION", 20.0)),
            "cutoff_freq_low": float(os.getenv("EVM_FREQ_LOW", 3.0)),
            "cutoff_freq_high": float(os.getenv("EVM_FREQ_HIGH", 30.0)),
            "sampling_rate": int(os.getenv("EVM_SAMPLING_RATE", 30)),
            "temporal_buffer_size": int(os.getenv("EVM_BUFFER_SIZE", 60)),
            "pyramid_type": os.getenv("EVM_PYRAMID_TYPE", "laplacian"),
            "filter_type": os.getenv("EVM_FILTER_TYPE", "butterworth"),
            "chroma_attenuation": float(os.getenv("EVM_CHROMA_ATTENUATION", 0.1)),
        }
    
    def _load_signal_config(self) -> Dict[str, Any]:
        """Load signal processing configuration."""
        return {
            "window_size": int(os.getenv("SIGNAL_WINDOW_SIZE", 60)),
            "hop_size": int(os.getenv("SIGNAL_HOP_SIZE", 15)),
            "motion_threshold": float(os.getenv("SIGNAL_MOTION_THRESHOLD", 1e-6)),
            "smoothing_factor": float(os.getenv("SIGNAL_SMOOTHING_FACTOR", 0.8)),
            "noise_reduction": os.getenv("SIGNAL_NOISE_REDUCTION", "true").lower() == "true",
        }
    
    def _load_anomaly_config(self) -> Dict[str, Any]:
        """Load anomaly detection configuration."""
        return {
            "rms_reference": float(os.getenv("ANOMALY_RMS_REF", 0.5)),
            "rms_range": float(os.getenv("ANOMALY_RMS_RANGE", 2.0)),
            "frequency_reference": float(os.getenv("ANOMALY_FREQ_REF", 10.0)),
            "frequency_range": float(os.getenv("ANOMALY_FREQ_RANGE", 5.0)),
            "normal_threshold": float(os.getenv("ANOMALY_THRESHOLD", 0.6)),
            "default_x": int(os.getenv("ANOMALY_DEFAULT_X", 100)),
            "default_y": int(os.getenv("ANOMALY_DEFAULT_Y", 100)),
            "default_width": int(os.getenv("ANOMALY_DEFAULT_WIDTH", 300)),
            "default_height": int(os.getenv("ANOMALY_DEFAULT_HEIGHT", 200)),
            "ml_model_enabled": os.getenv("ANOMALY_ML_ENABLED", "false").lower() == "true",
        }
    
    def _load_api_config(self) -> Dict[str, Any]:
        """Load API configuration."""
        return {
            "max_frame_size_mb": int(os.getenv("API_MAX_FRAME_SIZE", 10)),
            "supported_formats": os.getenv("API_SUPPORTED_FORMATS", "jpg,jpeg,png").split(","),
            "compression_quality": int(os.getenv("API_COMPRESSION_QUALITY", 85)),
            "rate_limit_per_minute": int(os.getenv("API_RATE_LIMIT", 60)),
            "cors_enabled": os.getenv("API_CORS_ENABLED", "true").lower() == "true",
            "debug_mode": os.getenv("API_DEBUG", "false").lower() == "true",
        }
    
    def _load_features_config(self) -> Dict[str, Any]:
        """Load feature extraction configuration."""
        return {
            "energy_bands": [
                {"name": "low", "min": 0, "max": 5},
                {"name": "mid", "min": 5, "max": 20},
                {"name": "high", "min": 20, "max": 50},
            ],
            "spectral_resolution": int(os.getenv("FEATURES_SPECTRAL_RESOLUTION", 512)),
            "window_function": os.getenv("FEATURES_WINDOW_FUNCTION", "hann"),
            "overlap_ratio": float(os.getenv("FEATURES_OVERLAP_RATIO", 0.5)),
        }
    
    def _apply_environment_overrides(self):
        """Apply environment variable overrides."""
        # Check for JSON config override
        config_override = os.getenv("CONFIG_OVERRIDE")
        if config_override:
            try:
                override_data = json.loads(config_override)
                for section, values in override_data.items():
                    if section in self._config_cache:
                        self._config_cache[section].update(values)
            except json.JSONDecodeError:
                print(f"Warning: Invalid CONFIG_OVERRIDE JSON: {config_override}")
    
    def _validate_all_configs(self):
        """Validate all configuration values."""
        validators = {
            'evm': self._validate_evm_config,
            'signal': self._validate_signal_config,
            'anomaly': self._validate_anomaly_config,
            'api': self._validate_api_config,
            'features': self._validate_features_config,
        }
        
        for section, validator in validators.items():
            try:
                validator(self._config_cache[section])
            except ValueError as e:
                print(f"Configuration validation error in {section}: {e}")
                # Use safe defaults
                self._load_safe_defaults(section)
    
    def _validate_evm_config(self, config: Dict[str, Any]):
        """Validate EVM configuration."""
        if config["num_levels"] < 1 or config["num_levels"] > 8:
            raise ValueError("EVM levels must be between 1 and 8")
        if config["amplification_factor"] < 0.1 or config["amplification_factor"] > 100:
            raise ValueError("Amplification factor must be between 0.1 and 100")
        if config["cutoff_freq_low"] >= config["cutoff_freq_high"]:
            raise ValueError("Low frequency must be less than high frequency")
        if config["sampling_rate"] < 1 or config["sampling_rate"] > 120:
            raise ValueError("Sampling rate must be between 1 and 120 FPS")
    
    def _validate_signal_config(self, config: Dict[str, Any]):
        """Validate signal processing configuration."""
        if config["window_size"] < 10 or config["window_size"] > 1000:
            raise ValueError("Window size must be between 10 and 1000")
        if config["hop_size"] < 1 or config["hop_size"] >= config["window_size"]:
            raise ValueError("Hop size must be between 1 and window_size-1")
    
    def _validate_anomaly_config(self, config: Dict[str, Any]):
        """Validate anomaly detection configuration."""
        if config["normal_threshold"] < 0 or config["normal_threshold"] > 1:
            raise ValueError("Normal threshold must be between 0 and 1")
        if config["rms_reference"] <= 0:
            raise ValueError("RMS reference must be positive")
    
    def _validate_api_config(self, config: Dict[str, Any]):
        """Validate API configuration."""
        if config["max_frame_size_mb"] < 1 or config["max_frame_size_mb"] > 100:
            raise ValueError("Max frame size must be between 1 and 100 MB")
        if config["compression_quality"] < 1 or config["compression_quality"] > 100:
            raise ValueError("Compression quality must be between 1 and 100")
    
    def _validate_features_config(self, config: Dict[str, Any]):
        """Validate feature extraction configuration."""
        if config["spectral_resolution"] < 64 or config["spectral_resolution"] > 4096:
            raise ValueError("Spectral resolution must be between 64 and 4096")
    
    def _load_safe_defaults(self, section: str):
        """Load safe default values for a section."""
        safe_defaults = {
            'evm': {
                "num_levels": 4,
                "amplification_factor": 20.0,
                "cutoff_freq_low": 3.0,
                "cutoff_freq_high": 30.0,
                "sampling_rate": 30,
                "temporal_buffer_size": 60,
            },
            'signal': {
                "window_size": 60,
                "hop_size": 15,
                "motion_threshold": 1e-6,
            },
            'anomaly': {
                "normal_threshold": 0.6,
                "rms_reference": 0.5,
            },
            'api': {
                "max_frame_size_mb": 10,
                "compression_quality": 85,
            },
            'features': {
                "spectral_resolution": 512,
            },
        }
        
        if section in safe_defaults:
            self._config_cache[section].update(safe_defaults[section])
            print(f"Applied safe defaults for {section} configuration")
    
    def get(self, section: str, key: str = None, default: Any = None) -> Any:
        """Get configuration value."""
        if section not in self._config_cache:
            return default
        
        if key is None:
            return self._config_cache[section]
        
        return self._config_cache[section].get(key, default)
    
    def set(self, section: str, key: str, value: Any):
        """Set configuration value."""
        if section not in self._config_cache:
            self._config_cache[section] = {}
        
        self._config_cache[section][key] = value
    
    def reload(self):
        """Reload all configurations."""
        self._config_cache.clear()
        self.load_all_configs()
    
    def export_config(self) -> Dict[str, Any]:
        """Export all configurations as dictionary."""
        return self._config_cache.copy()


# Global configuration manager instance
config_manager = ConfigManager()

# Convenience functions for backward compatibility
EVM_CONFIG = config_manager.get('evm')
SIGNAL_CONFIG = config_manager.get('signal')
ANOMALY_CONFIG = config_manager.get('anomaly')
API_CONFIG = config_manager.get('api')
FEATURES_CONFIG = config_manager.get('features')
