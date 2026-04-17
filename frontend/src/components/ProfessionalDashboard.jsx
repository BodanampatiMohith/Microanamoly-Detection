import React, { useEffect, useMemo, useRef, useState } from "react";
import StabilityGauge from "./StabilityGauge";
import WaveformChart from "./WaveformChart";
import SpectrumAnalyzer from "./SpectrumAnalyzer";

const formatMetric = (value, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : (0).toFixed(digits);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const getAnomalyTone = (status, anomalyIndex) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus.includes("fault") || anomalyIndex >= 0.6) {
    return "fault";
  }
  if (normalizedStatus.includes("warning") || anomalyIndex >= 0.3) {
    return "warning";
  }
  return "normal";
};

const getQualityLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
};

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
  const noticeTimeoutRef = useRef(null);

  const [draftAmplification, setDraftAmplification] = useState(String(currentAmplification));
  const [draftBand, setDraftBand] = useState({
    low: String(frequencyBand.low),
    high: String(frequencyBand.high),
  });
  const [draftRoi, setDraftRoi] = useState({
    x: String(roi.x),
    y: String(roi.y),
    width: String(roi.width),
    height: String(roi.height),
  });
  const [validationMessage, setValidationMessage] = useState("");
  const [controlNotice, setControlNotice] = useState("");
  const [isApplyingSettings, setIsApplyingSettings] = useState(false);

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

  useEffect(() => {
    setDraftAmplification(String(currentAmplification));
  }, [currentAmplification]);

  useEffect(() => {
    setDraftBand({
      low: String(frequencyBand.low),
      high: String(frequencyBand.high),
    });
  }, [frequencyBand.high, frequencyBand.low]);

  useEffect(() => {
    setDraftRoi({
      x: String(roi.x),
      y: String(roi.y),
      width: String(roi.width),
      height: String(roi.height),
    });
  }, [roi.height, roi.width, roi.x, roi.y]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  const metrics = useMemo(() => {
    const features = processResult?.features || {};
    const anomalyDetection = processResult?.anomaly_detection || {};
    const anomalyIndex = Number.isFinite(anomalyDetection.anomaly_index)
      ? anomalyDetection.anomaly_index
      : 0;
    const stabilityIndex = Math.max(0, Math.min(100, (1 - anomalyIndex) * 100));
    const tone = getAnomalyTone(anomalyDetection.status, anomalyIndex);

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
      anomalyIndex,
      tone,
    };
  }, [processResult]);

  const qualityScore = useMemo(() => {
    if (!processResult) {
      return 0;
    }

    const fpsScore = Math.max(0, Math.min(35, (performanceMetrics.fps / 20) * 35));
    const processingScore = Math.max(0, Math.min(25, 25 - Math.max(0, performanceMetrics.processingTime - 80) / 4));
    const signalScore = waveHistory.length >= 40 ? 20 : (waveHistory.length / 40) * 20;
    const spectrumScore = Array.isArray(spectralData) && spectralData.length > 0 ? 20 : 0;

    return Math.round(Math.max(0, Math.min(100, fpsScore + processingScore + signalScore + spectrumScore)));
  }, [performanceMetrics.fps, performanceMetrics.processingTime, processResult, spectralData, waveHistory.length]);

  const monitoringButtonLabel = isMonitoring ? "Stop Monitoring" : "Start Monitoring";
  const qualityLabel = getQualityLabel(qualityScore);

  const parseAndValidateControls = () => {
    const amplification = toNumber(draftAmplification);
    const low = toNumber(draftBand.low);
    const high = toNumber(draftBand.high);
    const x = toNumber(draftRoi.x);
    const y = toNumber(draftRoi.y);
    const width = toNumber(draftRoi.width);
    const height = toNumber(draftRoi.height);

    if (!Number.isFinite(amplification) || amplification < 1 || amplification > 100) {
      throw new Error("Amplification must be between 1 and 100.");
    }
    if (!Number.isFinite(low) || low < 0.1 || low > 120) {
      throw new Error("Low frequency must be between 0.1 and 120 Hz.");
    }
    if (!Number.isFinite(high) || high < 0.2 || high > 150) {
      throw new Error("High frequency must be between 0.2 and 150 Hz.");
    }
    if (high <= low) {
      throw new Error("High frequency must be greater than low frequency.");
    }
    if (!Number.isFinite(x) || x < 0 || !Number.isFinite(y) || y < 0) {
      throw new Error("ROI x/y must be zero or greater.");
    }
    if (!Number.isFinite(width) || width < 50 || width > 640) {
      throw new Error("ROI width must be between 50 and 640.");
    }
    if (!Number.isFinite(height) || height < 50 || height > 480) {
      throw new Error("ROI height must be between 50 and 480.");
    }

    return {
      amplification: Math.round(amplification * 10) / 10,
      frequencyBand: {
        low: Math.round(low * 10) / 10,
        high: Math.round(high * 10) / 10,
      },
      roi: {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      },
    };
  };

  const showTransientNotice = (message) => {
    setControlNotice(message);
    if (noticeTimeoutRef.current) {
      window.clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = window.setTimeout(() => {
      setControlNotice("");
    }, 2200);
  };

  const handleApplySettings = async () => {
    setValidationMessage("");
    setControlNotice("");

    let parsed;
    try {
      parsed = parseAndValidateControls();
    } catch (error) {
      setValidationMessage(error.message || "Please check control values.");
      return;
    }

    const nothingChanged =
      parsed.amplification === currentAmplification &&
      parsed.frequencyBand.low === frequencyBand.low &&
      parsed.frequencyBand.high === frequencyBand.high &&
      parsed.roi.x === roi.x &&
      parsed.roi.y === roi.y &&
      parsed.roi.width === roi.width &&
      parsed.roi.height === roi.height;

    if (nothingChanged) {
      showTransientNotice("No changes to apply.");
      return;
    }

    setIsApplyingSettings(true);
    try {
      if (
        parsed.amplification !== currentAmplification &&
        typeof onAmplificationChange === "function"
      ) {
        await onAmplificationChange(parsed.amplification);
      }
      if (
        (parsed.frequencyBand.low !== frequencyBand.low ||
          parsed.frequencyBand.high !== frequencyBand.high) &&
        typeof onFrequencyBandChange === "function"
      ) {
        await onFrequencyBandChange(parsed.frequencyBand);
      }
      if (
        (parsed.roi.x !== roi.x ||
          parsed.roi.y !== roi.y ||
          parsed.roi.width !== roi.width ||
          parsed.roi.height !== roi.height) &&
        typeof onRoiChange === "function"
      ) {
        await onRoiChange(parsed.roi);
      }

      showTransientNotice("Settings applied.");
    } catch (error) {
      setValidationMessage(error.message || "Failed to apply settings.");
    } finally {
      setIsApplyingSettings(false);
    }
  };

  const handleRevertSettings = () => {
    setDraftAmplification(String(currentAmplification));
    setDraftBand({
      low: String(frequencyBand.low),
      high: String(frequencyBand.high),
    });
    setDraftRoi({
      x: String(roi.x),
      y: String(roi.y),
      width: String(roi.width),
      height: String(roi.height),
    });
    setValidationMessage("");
    showTransientNotice("Reverted to live values.");
  };

  return (
    <div className="professional-dashboard">
      <div className="dashboard-section ops-summary-grid">
        <article className="ops-summary-card">
          <span className="ops-summary-label">Output Quality</span>
          <span className="ops-summary-value">{qualityScore}%</span>
          <span className={`ops-summary-chip tone-${qualityScore >= 60 ? "normal" : qualityScore >= 40 ? "warning" : "fault"}`}>
            {qualityLabel}
          </span>
        </article>
        <article className="ops-summary-card">
          <span className="ops-summary-label">Anomaly Risk</span>
          <span className="ops-summary-value">{formatMetric(metrics.anomalyIndex * 100, 1)}%</span>
          <span className={`ops-summary-chip tone-${metrics.tone}`}>{metrics.status}</span>
        </article>
        <article className="ops-summary-card">
          <span className="ops-summary-label">Pipeline Latency</span>
          <span className="ops-summary-value">{formatMetric(performanceMetrics.processingTime, 1)} ms</span>
          <span className="ops-summary-chip tone-normal">Frame {performanceMetrics.frameCount}</span>
        </article>
        <article className="ops-summary-card">
          <span className="ops-summary-label">Processing Loop</span>
          <span className="ops-summary-value">{formatMetric(performanceMetrics.fps, 1)} FPS</span>
          <span className={`ops-summary-chip tone-${isMonitoring ? "normal" : "warning"}`}>
            {isMonitoring ? "Running" : "Standby"}
          </span>
        </article>
      </div>

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
            <label className="control-label" htmlFor="draft-amplification">
              Motion Amplification Factor
            </label>
            <div className="slider-container">
              <input
                id="draft-amplification"
                type="range"
                min="1"
                max="100"
                step="1"
                value={Number.isFinite(toNumber(draftAmplification)) ? toNumber(draftAmplification) : 1}
                onChange={(event) => setDraftAmplification(event.target.value)}
                className="slider-input"
              />
              <div className="slider-value">{draftAmplification}x Target Magnification</div>
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
                <label htmlFor="freq-low">Low (Hz)</label>
                <input
                  id="freq-low"
                  type="number"
                  min="0.1"
                  max="120"
                  step="0.1"
                  value={draftBand.low}
                  onChange={(event) =>
                    setDraftBand((current) => ({
                      ...current,
                      low: event.target.value,
                    }))
                  }
                  className="freq-input"
                />
              </div>

              <div className="freq-input-group">
                <label htmlFor="freq-high">High (Hz)</label>
                <input
                  id="freq-high"
                  type="number"
                  min="0.2"
                  max="150"
                  step="0.1"
                  value={draftBand.high}
                  onChange={(event) =>
                    setDraftBand((current) => ({
                      ...current,
                      high: event.target.value,
                    }))
                  }
                  className="freq-input"
                />
              </div>
            </div>
            <div className="band-display">
              <span className="band-info">
                Pending Band: {draftBand.low || "--"} - {draftBand.high || "--"} Hz
              </span>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Region of Interest</label>
            <div className="frequency-inputs roi-grid">
              <div className="freq-input-group">
                <label htmlFor="roi-x">X</label>
                <input
                  id="roi-x"
                  type="number"
                  min="0"
                  value={draftRoi.x}
                  onChange={(event) =>
                    setDraftRoi((current) => ({
                      ...current,
                      x: event.target.value,
                    }))
                  }
                  className="freq-input"
                />
              </div>

              <div className="freq-input-group">
                <label htmlFor="roi-y">Y</label>
                <input
                  id="roi-y"
                  type="number"
                  min="0"
                  value={draftRoi.y}
                  onChange={(event) =>
                    setDraftRoi((current) => ({
                      ...current,
                      y: event.target.value,
                    }))
                  }
                  className="freq-input"
                />
              </div>

              <div className="freq-input-group">
                <label htmlFor="roi-width">Width</label>
                <input
                  id="roi-width"
                  type="number"
                  min="50"
                  max="640"
                  value={draftRoi.width}
                  onChange={(event) =>
                    setDraftRoi((current) => ({
                      ...current,
                      width: event.target.value,
                    }))
                  }
                  className="freq-input"
                />
              </div>

              <div className="freq-input-group">
                <label htmlFor="roi-height">Height</label>
                <input
                  id="roi-height"
                  type="number"
                  min="50"
                  max="480"
                  value={draftRoi.height}
                  onChange={(event) =>
                    setDraftRoi((current) => ({
                      ...current,
                      height: event.target.value,
                    }))
                  }
                  className="freq-input"
                />
              </div>
            </div>
          </div>

          {validationMessage && <div className="validation-message validation-error">{validationMessage}</div>}
          {controlNotice && <div className="validation-message validation-success">{controlNotice}</div>}

          <div className="control-buttons control-buttons-secondary">
            <button
              className="btn btn-secondary"
              onClick={handleRevertSettings}
              disabled={isApplyingSettings || isLoading}
              type="button"
            >
              Revert Values
            </button>
            <button
              className="btn btn-apply"
              onClick={handleApplySettings}
              disabled={isApplyingSettings || isLoading || !backendConnected}
              type="button"
            >
              {isApplyingSettings ? "Applying..." : "Apply Settings"}
            </button>
          </div>

          <div className="control-buttons">
            <button
              className={`btn btn-primary ${isMonitoring ? "active" : ""}`}
              onClick={() => (isMonitoring ? onStopMonitoring?.() : onStartMonitoring?.())}
              disabled={!backendConnected || isLoading}
              type="button"
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
          type="button"
        >
          <span className="btn-icon">{isMonitoring ? "[]" : ">"}</span>
          <span className="btn-text">{monitoringButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
