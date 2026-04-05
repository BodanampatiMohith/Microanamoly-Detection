import React, { useEffect, useMemo, useRef, useState } from "react";
import StabilityGauge from "./StabilityGauge";
import WaveformChart from "./WaveformChart";
import SpectrumAnalyzer from "./SpectrumAnalyzer";

const formatMetric = (value, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : (0).toFixed(digits);

export const ProfessionalDashboard = ({
  backendConnected,
  rawVideoFrame,
  magnifiedFrame,
  waveformData,
  spectralData,
  processResult,
  isMonitoring,
  isLoading,
  roi,
  onRoiChange,
  onStartMonitoring,
  onStopMonitoring,
  onAmplificationChange,
  onFrequencyBandChange,
  currentAmplification = 20,
  frequencyBand = { low: 3, high: 30 },
}) => {
  const [waveHistory, setWaveHistory] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    processingTime: 0,
    frameCount: 0,
  });
  const lastFrameTimestampRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(waveformData) || waveformData.length === 0) {
      return;
    }

    setWaveHistory(waveformData.slice(-500));
  }, [waveformData]);

  useEffect(() => {
    if (!processResult) {
      return;
    }

    const currentTime = Date.now();
    const lastTimestamp = lastFrameTimestampRef.current;
    const fps = lastTimestamp ? 1000 / Math.max(currentTime - lastTimestamp, 1) : 0;

    lastFrameTimestampRef.current = currentTime;

    setPerformanceMetrics({
      fps: Number.isFinite(fps) ? Math.round(fps * 10) / 10 : 0,
      processingTime: processResult.processing_time_ms || 0,
      frameCount: processResult.frame_index || 0,
    });
  }, [processResult]);

  const metrics = useMemo(() => {
    const features = processResult?.features || {};
    const anomalyDetection = processResult?.anomaly_detection || {};
    const stabilityIndex = Math.max(
      0,
      Math.min(100, (anomalyDetection.anomaly_index ?? 0) * 100)
    );

    return {
      stabilityIndex,
      status: anomalyDetection.status || "Idle",
      dominantFrequency: features.dominant_frequency || 0,
      spectralEnergy: features.spectral_entropy || 0,
      variance: features.variance || 0,
      rms: features.rms || 0,
      peakToPeak: features.peak_to_peak || 0,
      mean: features.mean || 0,
      isNormal: anomalyDetection.is_normal ?? false,
      anomalyIndex: anomalyDetection.anomaly_index || 0,
    };
  }, [processResult]);

  const monitoringButtonLabel = isMonitoring ? "Stop Monitoring" : "Start Monitoring";

  return (
    <div className="professional-dashboard">
      <div className="dashboard-section video-section">
        <div className="video-panels">
          <div className="video-panel">
            <div className="panel-header">
              <div className="panel-title">Raw Video Feed</div>
              <div className={`panel-status ${backendConnected ? "live" : ""}`}>
                {backendConnected ? "LIVE" : "OFFLINE"}
              </div>
            </div>
            <div className="video-display">
              {rawVideoFrame ? (
                <img src={rawVideoFrame} alt="Raw feed" className="video-image" />
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-icon">CAM</div>
                  <div className="placeholder-text">Waiting for camera preview...</div>
                </div>
              )}
            </div>
            <div className="panel-footer">
              Live FPS: {formatMetric(performanceMetrics.fps, 1)} | Processing:{" "}
              {formatMetric(performanceMetrics.processingTime, 1)}ms | Frame:{" "}
              {performanceMetrics.frameCount}
            </div>
          </div>

          <div className="video-panel">
            <div className="panel-header">
              <div className="panel-title">Motion Magnified Output</div>
              <div className={`panel-status ${isMonitoring ? "processing" : ""}`}>
                {isMonitoring ? "PROCESSING" : "STANDBY"}
              </div>
            </div>
            <div className="video-display">
              {magnifiedFrame ? (
                <img src={magnifiedFrame} alt="Magnified feed" className="video-image" />
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-icon">EVM</div>
                  <div className="placeholder-text">
                    Start monitoring to render the magnified stream.
                  </div>
                </div>
              )}
              <div className="amplification-badge">
                <span className="badge-label">Amplification:</span>
                <span className="badge-value">{formatMetric(currentAmplification, 0)}x</span>
              </div>
            </div>
            <div className="panel-footer">
              Active band: {formatMetric(frequencyBand.low, 1)}-
              {formatMetric(frequencyBand.high, 1)} Hz
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section charts-section">
        <div className="charts-grid">
          <div className="chart-container">
            <WaveformChart data={waveHistory} title="Time-Domain Vibration Waveform" />
          </div>

          <div className="chart-container">
            <SpectrumAnalyzer
              spectralData={spectralData}
              dominantFrequency={metrics.dominantFrequency}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-section controls-and-metrics">
        <div className="metrics-panel">
          <StabilityGauge value={metrics.stabilityIndex} status={metrics.status} />

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Dominant Frequency</div>
              <div className="metric-value">{formatMetric(metrics.dominantFrequency, 2)}</div>
              <div className="metric-unit">Hz</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">RMS Motion</div>
              <div className="metric-value">{formatMetric(metrics.rms, 3)}</div>
              <div className="metric-unit">g</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Variance</div>
              <div className="metric-value">{formatMetric(metrics.variance, 4)}</div>
              <div className="metric-unit">sigma^2</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Peak-to-Peak</div>
              <div className="metric-value">{formatMetric(metrics.peakToPeak, 3)}</div>
              <div className="metric-unit">mm</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Spectral Entropy</div>
              <div className="metric-value">{formatMetric(metrics.spectralEnergy, 2)}</div>
              <div className="metric-unit">bits</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">System Status</div>
              <div className="metric-value status">{metrics.status}</div>
              <div className="metric-unit">state</div>
            </div>
          </div>
        </div>

        <div className="control-panel">
          <h3 className="control-title">Monitoring Controls</h3>

          <div className="control-group">
            <label className="control-label">Motion Amplification Factor</label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="100"
                value={currentAmplification}
                onChange={(event) => onAmplificationChange?.(parseFloat(event.target.value))}
                className="slider-input"
              />
              <div className="slider-value">{formatMetric(currentAmplification, 0)}x Magnification</div>
              <div className="slider-labels">
                <span>1x</span>
                <span>50x</span>
                <span>100x</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Frequency Band Selection</label>
            <div className="frequency-inputs">
              <div className="freq-input-group">
                <label>Low (Hz)</label>
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={frequencyBand.low}
                  onChange={(event) =>
                    onFrequencyBandChange?.({
                      ...frequencyBand,
                      low: parseFloat(event.target.value),
                    })
                  }
                  className="freq-input"
                />
              </div>

              <div className="freq-input-group">
                <label>High (Hz)</label>
                <input
                  type="number"
                  min="0.2"
                  max="150"
                  step="0.1"
                  value={frequencyBand.high}
                  onChange={(event) =>
                    onFrequencyBandChange?.({
                      ...frequencyBand,
                      high: parseFloat(event.target.value),
                    })
                  }
                  className="freq-input"
                />
              </div>
            </div>
            <div className="band-display">
              <span className="band-info">
                Active Band: {formatMetric(frequencyBand.low, 1)} -{" "}
                {formatMetric(frequencyBand.high, 1)} Hz
              </span>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Region of Interest</label>
            <div className="frequency-inputs">
              <div className="freq-input-group">
                <label>X</label>
                <input
                  type="number"
                  min="0"
                  value={roi.x}
                  onChange={(event) =>
                    onRoiChange?.({
                      ...roi,
                      x: parseInt(event.target.value, 10),
                    })
                  }
                  className="freq-input"
                />
              </div>

              <div className="freq-input-group">
                <label>Y</label>
                <input
                  type="number"
                  min="0"
                  value={roi.y}
                  onChange={(event) =>
                    onRoiChange?.({
                      ...roi,
                      y: parseInt(event.target.value, 10),
                    })
                  }
                  className="freq-input"
                />
              </div>

              <div className="freq-input-group">
                <label>Width</label>
                <input
                  type="number"
                  min="50"
                  value={roi.width}
                  onChange={(event) =>
                    onRoiChange?.({
                      ...roi,
                      width: parseInt(event.target.value, 10),
                    })
                  }
                  className="freq-input"
                />
              </div>

              <div className="freq-input-group">
                <label>Height</label>
                <input
                  type="number"
                  min="50"
                  value={roi.height}
                  onChange={(event) =>
                    onRoiChange?.({
                      ...roi,
                      height: parseInt(event.target.value, 10),
                    })
                  }
                  className="freq-input"
                />
              </div>
            </div>
          </div>

          <div className="control-buttons">
            <button
              className={`btn btn-primary ${isMonitoring ? "active" : ""}`}
              onClick={() => (isMonitoring ? onStopMonitoring?.() : onStartMonitoring?.())}
              disabled={!backendConnected || isLoading}
            >
              <span className="btn-icon">{isMonitoring ? "[]" : ">"}</span>
              <span className="btn-text">{monitoringButtonLabel}</span>
            </button>
          </div>

          <div className="system-info">
            <div className="info-row">
              <span className="info-key">Backend:</span>
              <span className="info-value">{backendConnected ? "Connected" : "Disconnected"}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Processing:</span>
              <span className="info-value">{isMonitoring ? "Active" : "Idle"}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Frame Count:</span>
              <span className="info-value">{processResult?.frame_index || 0}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Timestamp:</span>
              <span className="info-value timestamp">
                {processResult?.timestamp
                  ? new Date(processResult.timestamp).toLocaleTimeString()
                  : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="floating-monitor-action">
        <button
          className={`btn btn-primary ${isMonitoring ? "active" : ""}`}
          onClick={() => (isMonitoring ? onStopMonitoring?.() : onStartMonitoring?.())}
          disabled={!backendConnected || isLoading}
          aria-label={monitoringButtonLabel}
          title={monitoringButtonLabel}
        >
          <span className="btn-icon">{isMonitoring ? "[]" : ">"}</span>
          <span className="btn-text">{monitoringButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
