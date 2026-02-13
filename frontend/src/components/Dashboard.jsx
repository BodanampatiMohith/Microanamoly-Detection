import React, { useState, useEffect } from "react";

export const Dashboard = ({ processResult, isLoading }) => {
  const [featureHistory, setFeatureHistory] = useState([]);

  useEffect(() => {
    if (processResult && processResult.features) {
      setFeatureHistory((prev) => {
        const updated = [...prev, processResult.features];
        return updated.slice(-100); // Keep last 100
      });
    }
  }, [processResult]);

  if (!processResult) {
    return (
      <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "var(--text-muted)" }}>Waiting for frame data...</p>
      </div>
    );
  }

  const {
    anomaly_detection,
    features,
    motion_signal,
    timestamp,
    frame_index,
  } = processResult;

  const statusClass = anomaly_detection?.is_normal ? "normal" : "abnormal";
  const statusText = anomaly_detection?.status || "Unknown";
  const anomalyIndex = anomaly_detection?.anomaly_index || 0;

  return (
    <div className="dashboard-section">
      {/* Status Widget */}
      <div className={`status-widget ${statusClass}`}>
        <div className={`status-value ${statusClass}`}>{statusText}</div>
        <div className="status-label">System Status</div>
      </div>

      {/* Stability Index Gauge */}
      <div className="gauge-widget">
        <div className="gauge-label">Stability Index</div>
        <div className="gauge-value">{(anomalyIndex * 100).toFixed(1)}%</div>
        <div className="gauge-container">
          <div className="gauge-bar">
            <div
              className="gauge-fill"
              style={{ width: `${anomalyIndex * 100}%` }}
            >
              {(anomalyIndex * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div style={{ marginTop: "1rem" }}>
        <h4
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "var(--text-muted)",
            marginBottom: "1rem",
          }}
        >
          Real-time Features
        </h4>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-label">Dominant Frequency</div>
            <div className="feature-value">
              {features?.dominant_frequency?.toFixed(2) || "0.00"} Hz
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-label">RMS Motion</div>
            <div className="feature-value">
              {features?.rms?.toFixed(3) || "0.000"}
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-label">Variance</div>
            <div className="feature-value">
              {features?.variance?.toFixed(3) || "0.000"}
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-label">Peak-to-Peak</div>
            <div className="feature-value">
              {features?.peak_to_peak?.toFixed(3) || "0.000"}
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-label">Spectral Entropy</div>
            <div className="feature-value">
              {features?.spectral_entropy?.toFixed(2) || "0.00"}
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-label">Motion Energy</div>
            <div className="feature-value">
              {motion_signal?.mean?.toFixed(4) || "0.0000"}
            </div>
          </div>
        </div>
      </div>

      {/* Energy Distribution */}
      <div style={{ marginTop: "1rem" }}>
        <h4
          style={{
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "var(--text-muted)",
            marginBottom: "1rem",
          }}
        >
          Spectral Energy Distribution
        </h4>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-label">Low (0-5 Hz)</div>
            <div className="feature-value">
              {(features?.energy_ratio_low * 100)?.toFixed(1) || "0.0"}%
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-label">Mid (5-20 Hz)</div>
            <div className="feature-value">
              {(features?.energy_ratio_mid * 100)?.toFixed(1) || "0.0"}%
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-label">High (20-50 Hz)</div>
            <div className="feature-value">
              {(features?.energy_ratio_high * 100)?.toFixed(1) || "0.0"}%
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: "1rem",
          padding: "0.75rem",
          backgroundColor: "var(--glass-bg)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div>Frame #{frame_index}</div>
        <div>{new Date(timestamp).toLocaleTimeString()}</div>
        {isLoading && <div style={{ color: "var(--accent-blue)" }}>Processing...</div>}
      </div>
    </div>
  );
};

export default Dashboard;
