"""
Main Flask application for Microanomalies Detection System.
"""
import os
import logging
import base64
import cv2
import numpy as np
from datetime import datetime
from typing import Tuple, Dict

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Import from src modules
from src.evm.evm_pipeline import EVMPipeline
from src.signal.motion_signal import MotionSignalExtractor
from src.signal.features import FeatureExtractor
from src.anomaly.rules import RuleBasedDetector
from src.anomaly.model import MLAnomalyDetector
from src.monitoring.telemetry import TelemetryStore
from src.utils.roi import ROI, draw_roi_on_frame
from src.utils.config import EVM_CONFIG, SIGNAL_CONFIG, ANOMALY_CONFIG, API_CONFIG, MONITORING_CONFIG
from src.utils.error_handlers import enhanced_logger, validate_frame_data, timing_decorator, create_api_response

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

# Global state
class PipelineState:
    """Global pipeline state."""

    def __init__(self):
        self.evm_pipeline = EVMPipeline()
        self.motion_extractor = MotionSignalExtractor()
        self.feature_extractor = FeatureExtractor()
        self.rule_detector = RuleBasedDetector()
        self.ml_detector = None

        # Try to load ML model
        model_path = os.path.join(
            os.path.dirname(__file__), "../data/models/anomaly_model.pkl"
        )
        if os.path.exists(model_path):
            self.ml_detector = MLAnomalyDetector(model_path)
            logger.info("ML model loaded successfully")

        self.roi = ROI(
            ANOMALY_CONFIG.get("default_x", 100),
            ANOMALY_CONFIG.get("default_y", 100),
            ANOMALY_CONFIG.get("default_width", 300),
            ANOMALY_CONFIG.get("default_height", 200),
        )
        self.frame_count = 0
        self.features_history = []
        self.max_history = 100
        self.telemetry_store = TelemetryStore(
            raw_history_size=MONITORING_CONFIG.get("raw_history_size", 50000),
            aggregate_history_minutes=MONITORING_CONFIG.get("aggregate_history_minutes", 60 * 24 * 7),
        )

    def update_roi(self, roi_dict: Dict) -> None:
        """Update ROI coordinates.

        Args:
            roi_dict: Dictionary with x, y, width, height
        """
        self.roi = ROI.from_dict(roi_dict)

    def reset(self) -> None:
        """Reset pipeline state."""
        self.evm_pipeline.reset()
        self.motion_extractor.clear()
        self.frame_count = 0
        self.features_history = []
        self.telemetry_store.clear()


# Initialize state
pipeline_state = PipelineState()


# ==================== Helper Functions ====================


def decode_base64_frame(frame_data: str) -> np.ndarray:
    """Decode base64 encoded frame.

    Args:
        frame_data: Base64 encoded frame string

    Returns:
        OpenCV format image array
    """
    try:
        # Remove data URL prefix if present
        if "," in frame_data:
            frame_data = frame_data.split(",")[1]

        # Decode base64
        frame_bytes = base64.b64decode(frame_data)
        nparr = np.frombuffer(frame_bytes, np.uint8)

        # Decode image
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            logger.error("Failed to decode image - invalid image data")
            return None
            
        # Validate frame dimensions
        if frame.size == 0:
            logger.error("Empty frame received")
            return None
            
        return frame
    except Exception as e:
        logger.error(f"Error decoding frame: {e}")
        return None


def encode_frame_to_base64(frame: np.ndarray, quality: int = 85) -> str:
    """Encode frame to base64 string.

    Args:
        frame: OpenCV format image
        quality: JPEG quality (1-100)

    Returns:
        Base64 encoded string
    """
    try:
        # Convert to 8-bit uint
        if frame.dtype == np.float32 or frame.dtype == np.float64:
            frame = np.clip(frame, 0, 1)  # Ensure values are in valid range
            frame = (frame * 255).astype(np.uint8)

        # Convert to BGR if grayscale
        if len(frame.shape) == 2:
            frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
        elif len(frame.shape) == 3 and frame.shape[2] == 4:
            # Convert RGBA to BGR
            frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)

        # Validate frame before encoding
        if frame.size == 0:
            logger.error("Empty frame provided for encoding")
            return ""

        # Encode to JPEG
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality, cv2.IMWRITE_JPEG_OPTIMIZE, 1]
        _, buffer = cv2.imencode(".jpg", frame, encode_params)

        if not _:
            logger.error("Failed to encode frame to JPEG")
            return ""

        # Encode to base64
        frame_base64 = base64.b64encode(buffer).decode("utf-8")
        return frame_base64
    except Exception as e:
        logger.error(f"Error encoding frame: {e}")
        return ""


# ==================== API Routes ====================


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify(
        {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
        }
    )


@app.route("/api/config", methods=["GET"])
def get_config():
    """Get current configuration."""
    return jsonify(
        {
            "evm": EVM_CONFIG,
            "signal": SIGNAL_CONFIG,
            "anomaly": ANOMALY_CONFIG,
            "api": API_CONFIG,
            "monitoring": MONITORING_CONFIG,
        }
    )


@app.route("/api/roi", methods=["GET", "POST"])
def handle_roi():
    """Get or update ROI region."""
    if request.method == "POST":
        roi_data = request.json
        try:
            pipeline_state.update_roi(roi_data)
            return jsonify(
                {
                    "status": "success",
                    "roi": pipeline_state.roi.to_dict(),
                }
            )
        except Exception as e:
            logger.error(f"Error updating ROI: {e}")
            return jsonify({"status": "error", "message": str(e)}), 400

    return jsonify({"roi": pipeline_state.roi.to_dict()})


@app.route("/api/process_frame", methods=["POST"])
@timing_decorator(enhanced_logger)
def process_frame():
    """Process a single video frame through the pipeline with enhanced error handling.

    Expected JSON:
    {
        "image": "base64_encoded_frame",
        "roi": {"x": 100, "y": 100, "width": 300, "height": 200}
    }
    """
    start_time = datetime.now()
    
    try:
        data = request.json
        if not data:
            return create_api_response(False, error="No JSON data provided", status_code=400)

        # Validate and decode input frame
        frame_data = data.get("image")
        if not frame_data:
            return create_api_response(False, error="No image data provided", status_code=400)

        # Enhanced frame validation
        is_valid, error_msg = validate_frame_data(frame_data)
        if not is_valid:
            enhanced_logger.log_error("Frame validation failed", extra={"error": error_msg})
            return create_api_response(False, error=f"Invalid frame data: {error_msg}", status_code=400)

        frame = decode_base64_frame(frame_data)
        if frame is None:
            return create_api_response(False, error="Failed to decode frame - invalid image data", status_code=400)

        # Validate frame dimensions
        if frame.shape[0] < 50 or frame.shape[1] < 50:
            return create_api_response(False, error="Frame too small - minimum 50x50 pixels required", status_code=400)

        # Update ROI if provided
        if "roi" in data:
            pipeline_state.update_roi(data["roi"])

        # Extract ROI region
        roi_frame = pipeline_state.roi.extract(frame)
        if roi_frame is None or roi_frame.size == 0:
            return create_api_response(False, error="ROI is outside frame bounds", status_code=400)

        # Process through EVM pipeline
        magnified_frame, evm_meta = pipeline_state.evm_pipeline.process_frame(roi_frame)

        # Extract motion signal from ROI (use original frame for motion)
        motion_value = pipeline_state.motion_extractor.extract_signal(roi_frame)
        pipeline_state.motion_extractor.append_signal(motion_value)

        # Extract features
        motion_window = pipeline_state.motion_extractor.get_window()
        features = pipeline_state.feature_extractor.extract_features(motion_window)

        # Store in history
        pipeline_state.features_history.append(features)
        if len(pipeline_state.features_history) > pipeline_state.max_history:
            pipeline_state.features_history.pop(0)

        # Detect anomalies (rule-based)
        status, anomaly_index = pipeline_state.rule_detector.detect(features)

        # Try ML detection if available
        ml_status = None
        ml_score = None
        if pipeline_state.ml_detector:
            ml_status, ml_score = pipeline_state.ml_detector.detect(features)

        pipeline_state.frame_count += 1

        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000

        # Prepare response
        response = {
            "status": "success",
            "frame_index": pipeline_state.frame_count,
            "timestamp": datetime.now().isoformat(),
            "processing_time_ms": round(processing_time, 2),
            # Magnified frame
            "magnified_frame": encode_frame_to_base64(
                magnified_frame, quality=API_CONFIG.get("jpeg_quality", 85)
            ),
            # ROI with box drawn
            "roi_frame": encode_frame_to_base64(
                draw_roi_on_frame(frame, pipeline_state.roi),
                quality=API_CONFIG.get("jpeg_quality", 85),
            ),
            # Anomaly detection results
            "anomaly_detection": {
                "status": status,
                "anomaly_index": float(anomaly_index),
                "is_normal": status == "Normal",
            },
            # ML detection (if available)
            "ml_detection": {
                "status": ml_status,
                "score": ml_score,
                "available": pipeline_state.ml_detector is not None,
            },
            # Extracted features
            "features": {
                k: float(v) if isinstance(v, (int, float, np.number)) else v
                for k, v in features.items()
            },
            # EVM metadata
            "evm_meta": evm_meta,
            # Signal statistics
            "motion_signal": {
                "current_value": float(motion_value),
                "buffer_size": len(pipeline_state.motion_extractor.motion_buffer),
                "mean": float(np.mean(motion_window)) if len(motion_window) > 0 else 0.0,
                "std": float(np.std(motion_window)) if len(motion_window) > 0 else 0.0,
            },
        }

        # Persist telemetry for monitoring graphs and long-running summaries.
        pipeline_state.telemetry_store.add_sample(
            {
                "timestamp": response["timestamp"],
                "frame_index": response["frame_index"],
                "status": response["anomaly_detection"]["status"],
                "anomaly_index": response["anomaly_detection"]["anomaly_index"],
                "processing_time_ms": response["processing_time_ms"],
                "dominant_frequency": response["features"].get("dominant_frequency", 0.0),
                "rms": response["features"].get("rms", 0.0),
                "variance": response["features"].get("variance", 0.0),
                "peak_to_peak": response["features"].get("peak_to_peak", 0.0),
                "spectral_entropy": response["features"].get("spectral_entropy", 0.0),
                "motion_value": response["motion_signal"]["current_value"],
                "evm_amplification": response["evm_meta"].get("current_amplification", 0.0),
            }
        )

        # Keep direct fields (legacy clients) and a nested `data` object (new clients).
        compat_response = {"success": True, "data": response}
        compat_response.update(response)
        return jsonify(compat_response)

    except Exception as e:
        enhanced_logger.log_error("Error processing frame", e, {
            "frame_count": pipeline_state.frame_count,
            "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000
        })
        return create_api_response(False, error=str(e), status_code=500)


@app.route("/api/statistics", methods=["GET"])
def get_statistics():
    """Get pipeline statistics."""
    try:
        return jsonify(
            {
                "frame_count": pipeline_state.frame_count,
                "motion_buffer_size": len(pipeline_state.motion_extractor.motion_buffer),
                "features_history_size": len(pipeline_state.features_history),
                "evm_stats": pipeline_state.evm_pipeline.get_statistics(),
                "monitoring_summary": pipeline_state.telemetry_store.get_summary(),
            }
        )
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/monitoring/summary", methods=["GET"])
def get_monitoring_summary():
    """Get current long-running monitoring summary."""
    try:
        return jsonify(
            {
                "status": "success",
                "summary": pipeline_state.telemetry_store.get_summary(),
            }
        )
    except Exception as e:
        logger.error(f"Error getting monitoring summary: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/monitoring/history", methods=["GET"])
def get_monitoring_history():
    """Get recent frame-level telemetry points for graph rendering."""
    try:
        points = request.args.get("points", MONITORING_CONFIG.get("default_history_points", 500), type=int)
        history = pipeline_state.telemetry_store.get_recent(points=points)
        return jsonify(
            {
                "status": "success",
                "points": len(history),
                "history": history,
            }
        )
    except Exception as e:
        logger.error(f"Error getting monitoring history: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/monitoring/window", methods=["GET"])
def get_monitoring_window():
    """Get telemetry points for a rolling window in minutes."""
    try:
        minutes = request.args.get("minutes", MONITORING_CONFIG.get("default_window_minutes", 60), type=int)
        window = pipeline_state.telemetry_store.get_window(minutes=minutes)
        return jsonify(
            {
                "status": "success",
                "minutes": minutes,
                "points": len(window),
                "history": window,
            }
        )
    except Exception as e:
        logger.error(f"Error getting monitoring window: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/monitoring/aggregate", methods=["GET"])
def get_monitoring_aggregate():
    """Get minute-level aggregate telemetry for long-range 24/7 trend graphs."""
    try:
        hours = request.args.get("hours", 24, type=int)
        aggregate = pipeline_state.telemetry_store.get_minute_aggregates(hours=hours)
        return jsonify(
            {
                "status": "success",
                "hours": hours,
                "points": len(aggregate),
                "aggregate": aggregate,
            }
        )
    except Exception as e:
        logger.error(f"Error getting monitoring aggregate: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/runtime/evm", methods=["GET", "POST"])
def handle_runtime_evm():
    """Get or update runtime EVM parameters without restarting the backend."""
    try:
        if request.method == "GET":
            return jsonify(
                {
                    "status": "success",
                    "evm": {
                        "amplification_factor": pipeline_state.evm_pipeline.amplification,
                        "cutoff_freq_low": pipeline_state.evm_pipeline.low_freq,
                        "cutoff_freq_high": pipeline_state.evm_pipeline.high_freq,
                        "sampling_rate": pipeline_state.evm_pipeline.sampling_rate,
                    },
                }
            )

        data = request.json or {}
        updated = pipeline_state.evm_pipeline.update_parameters(
            amplification=data.get("amplification_factor"),
            low_freq=data.get("cutoff_freq_low"),
            high_freq=data.get("cutoff_freq_high"),
            sampling_rate=data.get("sampling_rate"),
        )

        return jsonify({"status": "success", "evm": updated})
    except Exception as e:
        logger.error(f"Error handling runtime EVM config: {e}")
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/reset", methods=["POST"])
def reset_pipeline():
    """Reset pipeline state."""
    try:
        pipeline_state.reset()
        return jsonify({"status": "success", "message": "Pipeline reset"})
    except Exception as e:
        logger.error(f"Error resetting pipeline: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/", defaults={"path": ""}, methods=["GET"])
@app.route("/<path:path>", methods=["GET"])
def index(path):
    """Serve the built frontend when available, otherwise return API info."""
    static_root = app.static_folder

    if static_root:
        requested_path = os.path.join(static_root, path)
        index_path = os.path.join(static_root, "index.html")

        if path and os.path.exists(requested_path):
            return send_from_directory(static_root, path)

        if os.path.exists(index_path):
            return send_from_directory(static_root, "index.html")

    return "Microanomalies Detection Backend API. Use React frontend to interact."


if __name__ == "__main__":
    # Note: In production, use gunicorn or waitress
    app.run(
        debug=True,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        use_reloader=False,
    )
