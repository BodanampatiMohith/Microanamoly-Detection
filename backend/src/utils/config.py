"""
Configuration module for the microanomalies detection system.
"""

# EVM Configuration
EVM_CONFIG = {
    "num_levels": 4,
    "amplification_factor": 20,
    "cutoff_freq_low": 3,  # Hz
    "cutoff_freq_high": 30,  # Hz
    "sampling_rate": 30,  # FPS
    "temporal_buffer_size": 60,  # frames
}

# Signal Processing Configuration
SIGNAL_CONFIG = {
    "window_size": 60,  # Samples
    "hop_size": 15,  # Samples
    "motion_threshold": 1e-6,
}

# Anomaly Detection Configuration (Rule-based)
ANOMALY_CONFIG = {
    "rms_reference": 0.5,  # Normal baseline
    "rms_range": 2.0,  # Detection range
    "frequency_reference": 10.0,  # Hz, expected normal freq
    "frequency_range": 5.0,  # Hz, detection range
    "normal_threshold": 0.6,  # Stability index threshold
    "default_x": 100,  # Default ROI X coordinate
    "default_y": 100,  # Default ROI Y coordinate
    "default_width": 300,  # Default ROI width
    "default_height": 200,  # Default ROI height
}

# API Configuration
API_CONFIG = {
    "max_frame_size_mb": 10,  # Maximum frame size in MB
    "supported_formats": ["jpg", "jpeg", "png"],
    "compression_quality": 85,  # JPEG compression quality
    "rate_limit_per_minute": 60,  # API rate limiting
}

# Feature Extraction Configuration
FEATURES_CONFIG = {
    "energy_bands": [
        {"name": "low", "min": 0, "max": 5},
        {"name": "mid", "min": 5, "max": 20},
        {"name": "high", "min": 20, "max": 50},
    ],
}

# API Configuration
API_CONFIG = {
    "max_frame_width": 640,
    "max_frame_height": 480,
    "jpeg_quality": 85,
    "frame_timeout_ms": 5000,
}

# ROI Configuration
ROI_CONFIG = {
    "default_x": 100,
    "default_y": 100,
    "default_width": 300,
    "default_height": 200,
    "min_width": 50,
    "min_height": 50,
}

# Logging Configuration
LOG_CONFIG = {
    "level": "INFO",
    "file": "logs/app.log",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
}
