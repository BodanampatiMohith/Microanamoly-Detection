"""
Utility functions for enhanced error handling and logging.
"""

import logging
import traceback
from datetime import datetime
from typing import Optional, Dict, Any
import functools


class EnhancedLogger:
    """Enhanced logger with structured logging capabilities."""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.setup_logger()
    
    def setup_logger(self):
        """Setup enhanced logging format."""
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - [%(funcName)s:%(lineno)d] - %(message)s"
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def log_error(self, message: str, exception: Optional[Exception] = None, extra: Optional[Dict[str, Any]] = None):
        """Log error with enhanced context."""
        error_data = {
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "exception_type": type(exception).__name__ if exception else None,
            "exception_message": str(exception) if exception else None,
            "traceback": traceback.format_exc() if exception else None,
            **(extra or {})
        }
        
        self.logger.error(f"ERROR: {message} | Details: {error_data}")
    
    def log_performance(self, operation: str, duration_ms: float, extra: Optional[Dict[str, Any]] = None):
        """Log performance metrics."""
        perf_data = {
            "operation": operation,
            "duration_ms": duration_ms,
            "timestamp": datetime.now().isoformat(),
            **(extra or {})
        }
        
        self.logger.info(f"PERFORMANCE: {operation} completed in {duration_ms:.2f}ms | {perf_data}")


def validate_frame_data(frame_data: str) -> tuple[bool, Optional[str]]:
    """
    Validate base64 frame data.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not frame_data:
        return False, "No frame data provided"
    
    # Check approximate size (base64 encoded image should be reasonable)
    if len(frame_data) > 10 * 1024 * 1024:  # 10MB limit
        return False, "Frame data too large (exceeds 10MB)"
    
    if len(frame_data) < 100:  # Minimum reasonable size
        return False, "Frame data too small"
    
    # Check if it looks like base64 data
    if "," in frame_data:
        frame_data = frame_data.split(",")[1]
    
    # Basic base64 validation
    try:
        import base64
        base64.b64decode(frame_data + "==")  # Add padding just in case
        return True, None
    except Exception as e:
        return False, f"Invalid base64 data: {str(e)}"


def timing_decorator(logger: EnhancedLogger):
    """Decorator to measure and log function execution time."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = datetime.now()
            try:
                result = func(*args, **kwargs)
                duration = (datetime.now() - start_time).total_seconds() * 1000
                logger.log_performance(func.__name__, duration)
                return result
            except Exception as e:
                duration = (datetime.now() - start_time).total_seconds() * 1000
                logger.log_error(f"Function {func.__name__} failed", e, {"duration_ms": duration})
                raise
        return wrapper
    return decorator


def safe_float_conversion(value: Any, default: float = 0.0) -> float:
    """Safely convert value to float with fallback."""
    try:
        if value is None:
            return default
        return float(value)
    except (ValueError, TypeError):
        return default


def create_api_response(success: bool, data: Any = None, error: str = None, 
                       status_code: int = 200) -> tuple[Dict[str, Any], int]:
    """Create standardized API response."""
    response = {
        "success": success,
        "timestamp": datetime.now().isoformat(),
    }
    
    if success:
        response["data"] = data
    else:
        response["error"] = error
        response["status_code"] = status_code
    
    return response, status_code if not success else 200


# Global enhanced logger instance
enhanced_logger = EnhancedLogger(__name__)
