import React, { useState, useEffect } from "react";
import StabilityGauge from "./StabilityGauge";
import WaveformChart from "./WaveformChart";
import SpectrumAnalyzer from "./SpectrumAnalyzer";

export const ProfessionalDashboard = ({
  rawVideoFrame,
  magnifiedFrame,
  waveformData,
  spectralData,
  processResult,
  isMonitoring,
  onStartMonitoring,
  onStopMonitoring,
  onAmplificationChange,
  onFrequencyBandChange,
  currentAmplification = 20,
  frequencyBand = { low: 0.4, high: 100 },
}) => {
  const [waveHistory, setWaveHistory] = useState([]);
  const [spectralHistory, setSpectralHistory] = useState([]);

  // Update waveform history
  useEffect(() => {
    if (Array.isArray(waveformData)) {
      setWaveHistory((prev) => {
        const updated = [...prev, ...waveformData];
        return updated.slice(-500); // Keep last 500 samples
      });
    }
  }, [waveformData]);

  // Update spectral history
  useEffect(() => {
    if (Array.isArray(spectralData)) {
      setSpectralHistory(spectralData);
    }
  }, [spectralData]);

  // Calculate metrics from data
  const calculateMetrics = () => {
    if (!processResult) return null;

    const metrics = {
      stabilityIndex:
        (1 - (processResult.anomaly_index || 0)) * 100 || 75,
      status: processResult.anomaly_detection?.status || "WAITING",
      dominantFrequency:
        processResult.features?.dominant_frequency || 0,
      spectralEnergy:
        processResult.features?.spectral_entropy || 0,
      variance: processResult.features?.variance || 0,
      rms: processResult.features?.rms || 0,
      peakToPeak:
        processResult.features?.peak_to_peak || 0,
    };

    return metrics;
  };

  const metrics = calculateMetrics();

  return (
    <div className="professional-dashboard">
      {/* ==================== TOP SECTION: VIDEO PANELS ==================== */}
      <div className="dashboard-section video-section">
        <div className="video-panels">
          {/* Raw Video Feed */}
          <div className="video-panel">
            <div className="panel-header">
              <div className="panel-title">Raw Video Feed</div>
              <div className="panel-status live">● LIVE</div>
            </div>
            <div className="video-display">
              {rawVideoFrame ? (
                <img
                  src={rawVideoFrame}
                  alt="Raw Feed"
                  className="video-image"
                />
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-icon">●</div>
                  <div className="placeholder-text">Waiting for video input...</div>
                </div>
              )}
              <div className="roi-overlay">
                {/* ROI bounding box - subtle cyan outline */}
                <svg className="roi-svg">
                  <rect
                    x="20%"
                    y="20%"
                    width="60%"
                    height="60%"
                    className="roi-rect"
                  />
                </svg>
              </div>
            </div>
            <div className="panel-footer">Frame rate: 30 FPS</div>
          </div>

          {/* Motion Magnified Output */}
          <div className="video-panel">
            <div className="panel-header">
              <div className="panel-title">Motion Magnified Output</div>
              <div className="panel-status processing">● PROCESSING</div>
            </div>
            <div className="video-display">
              {magnifiedFrame ? (
                <img
                  src={magnifiedFrame}
                  alt="Magnified Feed"
                  className="video-image"
                />
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-icon">◈</div>
                  <div className="placeholder-text">
                    Motion magnification initializing...
                  </div>
                </div>
              )}
              <div className="amplification-badge">
                <span className="badge-label">Amplification:</span>
                <span className="badge-value">{currentAmplification}×</span>
              </div>
            </div>
            <div className="panel-footer">
              Active band: {frequencyBand.low.toFixed(1)}–
              {frequencyBand.high.toFixed(1)} Hz
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MIDDLE SECTION: WAVEFORM & SPECTRUM ==================== */}
      <div className="dashboard-section charts-section">
        <div className="charts-grid">
          {/* Waveform Chart */}
          <div className="chart-container">
            <WaveformChart
              data={waveHistory}
              title="Time-Domain Vibration Waveform"
            />
          </div>

          {/* Spectrum Chart */}
          <div className="chart-container">
            <SpectrumAnalyzer
              spectralData={spectralHistory}
              dominantFrequency={metrics?.dominantFrequency || 15}
            />
          </div>
        </div>
      </div>

      {/* ==================== RIGHT SIDE PANEL & CONTROLS ==================== */}
      <div className="dashboard-section controls-and-metrics">
        {/* Stability Indicator */}
        <div className="metrics-panel">
          <StabilityGauge
            value={metrics?.stabilityIndex || 75}
            status={metrics?.status || "NORMAL"}
          />

          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Dominant Frequency</div>
              <div className="metric-value">
                {metrics?.dominantFrequency?.toFixed(2) || "0.00"}
              </div>
              <div className="metric-unit">Hz</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">RMS Acceleration</div>
              <div className="metric-value">
                {metrics?.rms?.toFixed(3) || "0.000"}
              </div>
              <div className="metric-unit">g</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Variance</div>
              <div className="metric-value">
                {metrics?.variance?.toFixed(4) || "0.0000"}
              </div>
              <div className="metric-unit">σ²</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Peak-to-Peak</div>
              <div className="metric-value">
                {metrics?.peakToPeak?.toFixed(3) || "0.000"}
              </div>
              <div className="metric-unit">mm</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Spectral Energy</div>
              <div className="metric-value">
                {metrics?.spectralEnergy?.toFixed(2) || "0.00"}
              </div>
              <div className="metric-unit">dB</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">System Status</div>
              <div className="metric-value status">
                {metrics?.status || "PENDING"}
              </div>
              <div className="metric-unit">–</div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="control-panel">
          <h3 className="control-title">Monitoring Controls</h3>

          {/* Amplification Slider */}
          <div className="control-group">
            <label className="control-label">
              Motion Amplification Factor
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="100"
                value={currentAmplification}
                onChange={(e) =>
                  onAmplificationChange?.(parseFloat(e.target.value))
                }
                className="slider-input"
              />
              <div className="slider-value">{currentAmplification}× Magnification</div>
              <div className="slider-labels">
                <span>1×</span>
                <span>50×</span>
                <span>100×</span>
              </div>
            </div>
          </div>

          {/* Frequency Band Selector */}
          <div className="control-group">
            <label className="control-label">Frequency Band Selection</label>
            <div className="frequency-inputs">
              <div className="freq-input-group">
                <label>Low (Hz)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={frequencyBand.low}
                  onChange={(e) =>
                    onFrequencyBandChange?.({
                      ...frequencyBand,
                      low: parseFloat(e.target.value),
                    })
                  }
                  className="freq-input"
                />
              </div>
              <div className="freq-input-group">
                <label>High (Hz)</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={frequencyBand.high}
                  onChange={(e) =>
                    onFrequencyBandChange?.({
                      ...frequencyBand,
                      high: parseFloat(e.target.value),
                    })
                  }
                  className="freq-input"
                />
              </div>
            </div>
            <div className="band-display">
              <span className="band-info">
                Active Band: {frequencyBand.low.toFixed(1)} – {frequencyBand.high.toFixed(1)} Hz
                ({(frequencyBand.high - frequencyBand.low).toFixed(1)} Hz span)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="control-buttons">
            <button
              className={`btn btn-primary ${isMonitoring ? "active" : ""}`}
              onClick={() =>
                isMonitoring ? onStopMonitoring?.() : onStartMonitoring?.()
              }
              disabled={!metrics?.status || metrics.status === "WAITING"}
            >
              <span className="btn-icon">{isMonitoring ? "■" : "▶"}</span>
              <span className="btn-text">
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </span>
            </button>
          </div>

          {/* System Info */}
          <div className="system-info">
            <div className="info-row">
              <span className="info-key">Processing:</span>
              <span className="info-value">{isMonitoring ? "Active" : "Idle"}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Frame Count:</span>
              <span className="info-value">
                {processResult?.frame_index || 0}
              </span>
            </div>
            <div className="info-row">
              <span className="info-key">Timestamp:</span>
              <span className="info-value timestamp">
                {processResult?.timestamp
                  ? new Date(processResult.timestamp).toLocaleTimeString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
