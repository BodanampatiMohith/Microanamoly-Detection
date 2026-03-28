"""In-memory telemetry storage for long-running monitoring and graphing."""

from __future__ import annotations

from collections import deque
from datetime import datetime, timedelta, timezone
from typing import Deque, Dict, List, Optional


class TelemetryStore:
    """Stores recent frame-level metrics and minute aggregates."""

    def __init__(self, raw_history_size: int = 50000, aggregate_history_minutes: int = 10080):
        self.raw_history: Deque[Dict] = deque(maxlen=max(100, int(raw_history_size)))
        self.minute_history: Deque[Dict] = deque(maxlen=max(60, int(aggregate_history_minutes)))
        self.started_at = datetime.now(timezone.utc)

        self.total_frames = 0
        self.normal_frames = 0
        self.abnormal_frames = 0
        self.total_processing_time_ms = 0.0
        self.last_sample: Optional[Dict] = None

        self._minute_bucket: Optional[Dict] = None

    def clear(self) -> None:
        """Clear stored telemetry and reset counters."""
        self.raw_history.clear()
        self.minute_history.clear()
        self.started_at = datetime.now(timezone.utc)

        self.total_frames = 0
        self.normal_frames = 0
        self.abnormal_frames = 0
        self.total_processing_time_ms = 0.0
        self.last_sample = None
        self._minute_bucket = None

    def add_sample(self, sample: Dict) -> None:
        """Add a single frame-level telemetry point."""
        timestamp = self._parse_timestamp(sample.get("timestamp"))
        sanitized = self._sanitize_sample(sample, timestamp)

        self.raw_history.append(sanitized)
        self.last_sample = sanitized

        self.total_frames += 1
        self.total_processing_time_ms += sanitized["processing_time_ms"]
        if sanitized["status"] == "Normal":
            self.normal_frames += 1
        else:
            self.abnormal_frames += 1

        self._add_to_minute_bucket(sanitized, timestamp)

    def get_recent(self, points: int = 500) -> List[Dict]:
        """Get the last N telemetry samples."""
        points = max(1, int(points))
        return list(self.raw_history)[-points:]

    def get_window(self, minutes: int = 60) -> List[Dict]:
        """Get telemetry samples inside a rolling window."""
        minutes = max(1, int(minutes))
        window_start = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        return [entry for entry in self.raw_history if self._parse_timestamp(entry["timestamp"]) >= window_start]

    def get_minute_aggregates(self, hours: int = 24) -> List[Dict]:
        """Get minute-level aggregate points for the last N hours."""
        hours = max(1, int(hours))
        window_start = datetime.now(timezone.utc) - timedelta(hours=hours)
        aggregated = [
            entry for entry in self.minute_history if self._parse_timestamp(entry["minute"]) >= window_start
        ]

        if self._minute_bucket and self._minute_bucket.get("count", 0) > 0:
            current = self._finalize_bucket(self._minute_bucket)
            if self._parse_timestamp(current["minute"]) >= window_start:
                aggregated.append(current)

        return aggregated

    def get_summary(self) -> Dict:
        """Get high-level monitoring summary suitable for status panels."""
        uptime_seconds = (datetime.now(timezone.utc) - self.started_at).total_seconds()
        avg_processing_time = (
            self.total_processing_time_ms / self.total_frames if self.total_frames > 0 else 0.0
        )
        fps_estimate = self.total_frames / uptime_seconds if uptime_seconds > 0 else 0.0

        return {
            "uptime_seconds": round(uptime_seconds, 2),
            "frames_processed": self.total_frames,
            "normal_frames": self.normal_frames,
            "abnormal_frames": self.abnormal_frames,
            "abnormal_rate": round(self.abnormal_frames / self.total_frames, 4) if self.total_frames else 0.0,
            "average_processing_time_ms": round(avg_processing_time, 2),
            "estimated_fps": round(fps_estimate, 2),
            "last_status": self.last_sample["status"] if self.last_sample else "Unknown",
            "last_anomaly_index": self.last_sample["anomaly_index"] if self.last_sample else 0.0,
            "last_timestamp": self.last_sample["timestamp"] if self.last_sample else None,
            "raw_history_points": len(self.raw_history),
            "minute_history_points": len(self.minute_history),
        }

    def _sanitize_sample(self, sample: Dict, timestamp: datetime) -> Dict:
        """Normalize optional values and keep only graph-relevant metrics."""
        return {
            "timestamp": timestamp.isoformat(),
            "frame_index": int(sample.get("frame_index", 0)),
            "status": sample.get("status", "Unknown"),
            "anomaly_index": self._safe_float(sample.get("anomaly_index")),
            "processing_time_ms": self._safe_float(sample.get("processing_time_ms")),
            "dominant_frequency": self._safe_float(sample.get("dominant_frequency")),
            "rms": self._safe_float(sample.get("rms")),
            "variance": self._safe_float(sample.get("variance")),
            "peak_to_peak": self._safe_float(sample.get("peak_to_peak")),
            "spectral_entropy": self._safe_float(sample.get("spectral_entropy")),
            "motion_value": self._safe_float(sample.get("motion_value")),
            "evm_amplification": self._safe_float(sample.get("evm_amplification")),
        }

    def _add_to_minute_bucket(self, sample: Dict, timestamp: datetime) -> None:
        """Accumulate one-minute aggregate metrics for long-term graphing."""
        minute_start = timestamp.replace(second=0, microsecond=0)

        if self._minute_bucket is None:
            self._minute_bucket = self._init_bucket(minute_start)
        elif self._minute_bucket["minute"] != minute_start.isoformat():
            self.minute_history.append(self._finalize_bucket(self._minute_bucket))
            self._minute_bucket = self._init_bucket(minute_start)

        bucket = self._minute_bucket
        bucket["count"] += 1
        bucket["abnormal_count"] += 1 if sample["status"] != "Normal" else 0
        bucket["sum_processing_time_ms"] += sample["processing_time_ms"]
        bucket["sum_anomaly_index"] += sample["anomaly_index"]
        bucket["sum_dominant_frequency"] += sample["dominant_frequency"]
        bucket["sum_rms"] += sample["rms"]

    def _init_bucket(self, minute_start: datetime) -> Dict:
        return {
            "minute": minute_start.isoformat(),
            "count": 0,
            "abnormal_count": 0,
            "sum_processing_time_ms": 0.0,
            "sum_anomaly_index": 0.0,
            "sum_dominant_frequency": 0.0,
            "sum_rms": 0.0,
        }

    def _finalize_bucket(self, bucket: Dict) -> Dict:
        count = max(1, bucket["count"])
        return {
            "minute": bucket["minute"],
            "count": bucket["count"],
            "abnormal_count": bucket["abnormal_count"],
            "abnormal_rate": round(bucket["abnormal_count"] / count, 4),
            "avg_processing_time_ms": round(bucket["sum_processing_time_ms"] / count, 2),
            "avg_anomaly_index": round(bucket["sum_anomaly_index"] / count, 4),
            "avg_dominant_frequency": round(bucket["sum_dominant_frequency"] / count, 4),
            "avg_rms": round(bucket["sum_rms"] / count, 6),
        }

    @staticmethod
    def _parse_timestamp(raw_value: Optional[str]) -> datetime:
        if not raw_value:
            return datetime.now(timezone.utc)
        try:
            parsed = datetime.fromisoformat(raw_value.replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            return datetime.now(timezone.utc)

    @staticmethod
    def _safe_float(value) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0
