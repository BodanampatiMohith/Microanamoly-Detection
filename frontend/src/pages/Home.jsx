import React, { useCallback, useEffect, useRef, useState } from "react";
import VideoCapture from "../components/VideoCapture";
import ProfessionalDashboard from "../components/ProfessionalDashboard";
import PerformanceMonitor from "../components/PerformanceMonitor";
import { apiService } from "../services/api";

const DEFAULT_ROI = {
  x: 100,
  y: 100,
  width: 300,
  height: 200,
};

const DEFAULT_FREQUENCY_BAND = {
  low: 3,
  high: 30,
};

export const Home = () => {
  const [roi, setRoi] = useState(DEFAULT_ROI);
  const [processResult, setProcessResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawVideoFrame, setRawVideoFrame] = useState(null);
  const [magnifiedFrame, setMagnifiedFrame] = useState(null);
  const [backendHealth, setBackendHealth] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentAmplification, setCurrentAmplification] = useState(20);
  const [frequencyBand, setFrequencyBand] = useState(DEFAULT_FREQUENCY_BAND);
  const [waveformData, setWaveformData] = useState([]);
  const [spectralData, setSpectralData] = useState([]);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  const waveformHistoryRef = useRef([]);

  const clampRoi = useCallback((nextRoi) => {
    setRoi({
      x: Math.max(0, Math.round(nextRoi.x || 0)),
      y: Math.max(0, Math.round(nextRoi.y || 0)),
      width: Math.max(50, Math.round(nextRoi.width || 50)),
      height: Math.max(50, Math.round(nextRoi.height || 50)),
    });
  }, []);

  const syncRuntimeState = useCallback(async () => {
    const [roiResult, evmResult] = await Promise.allSettled([
      apiService.getROI(),
      apiService.getRuntimeEvm(),
    ]);

    if (roiResult.status === "fulfilled" && roiResult.value?.roi) {
      clampRoi(roiResult.value.roi);
    }

    if (evmResult.status === "fulfilled") {
      const evm = evmResult.value;
      setCurrentAmplification(evm.amplification_factor ?? 20);
      setFrequencyBand({
        low: evm.cutoff_freq_low ?? DEFAULT_FREQUENCY_BAND.low,
        high: evm.cutoff_freq_high ?? DEFAULT_FREQUENCY_BAND.high,
      });
    }
  }, [clampRoi]);

  const handlePerformanceUpdate = useCallback((performanceMetrics) => {
    if (performanceMetrics.fps < 15) {
      console.warn("Low FPS detected, consider reducing processing load");
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const health = await apiService.health();
        if (!mounted) {
          return;
        }

        const isHealthy = health.status === "healthy";
        setBackendHealth(isHealthy);

        if (isHealthy) {
          setError((currentError) =>
            currentError === "Cannot connect to backend. Make sure Flask server is running."
              ? null
              : currentError
          );
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        setBackendHealth(false);
        setError("Cannot connect to backend. Make sure Flask server is running.");
      }
    };

    const bootstrap = async () => {
      await checkHealth();
      if (mounted) {
        try {
          await syncRuntimeState();
        } catch (err) {
          console.error("Failed to load runtime state:", err);
        }
      }
    };

    bootstrap();
    const interval = setInterval(checkHealth, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [syncRuntimeState]);

  const handleFrameCapture = useCallback(
    async (frameData) => {
      if (typeof frameData === "string") {
        setRawVideoFrame(frameData);
      }

      if (!isMonitoring || !backendHealth || isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await apiService.processFrame(frameData, roi);
        setProcessResult(result);

        const motionValue = result.motion_signal?.current_value;
        if (typeof motionValue === "number") {
          waveformHistoryRef.current = [...waveformHistoryRef.current, motionValue].slice(-500);
          setWaveformData([...waveformHistoryRef.current]);
        }

        if (Array.isArray(result.features?.spectrum_points)) {
          setSpectralData(result.features.spectrum_points);
        }

        if (result.roi_frame) {
          setRawVideoFrame(`data:image/jpeg;base64,${result.roi_frame}`);
        }

        if (result.magnified_frame) {
          setMagnifiedFrame(`data:image/jpeg;base64,${result.magnified_frame}`);
        }
      } catch (err) {
        console.error("Error processing frame:", err);
        setError(err.message || "Failed to process frame");
      } finally {
        setIsLoading(false);
      }
    },
    [backendHealth, isLoading, isMonitoring, roi]
  );

  const handleStartMonitoring = useCallback(() => {
    if (!backendHealth) {
      setError("Start the backend before monitoring.");
      return;
    }

    setError(null);
    setIsMonitoring(true);
  }, [backendHealth]);

  const handleStopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const handleAmplificationChange = useCallback(async (value) => {
    setCurrentAmplification(value);

    try {
      await apiService.updateAmplification(value);
    } catch (err) {
      console.error("Error updating amplification:", err);
      setError("Failed to update amplification factor.");
    }
  }, []);

  const handleFrequencyBandChange = useCallback(async (newBand) => {
    const safeBand = {
      low: Math.max(0.1, Number.isFinite(newBand.low) ? newBand.low : DEFAULT_FREQUENCY_BAND.low),
      high: Math.max(
        (Number.isFinite(newBand.low) ? newBand.low : DEFAULT_FREQUENCY_BAND.low) + 0.1,
        Number.isFinite(newBand.high) ? newBand.high : DEFAULT_FREQUENCY_BAND.high
      ),
    };

    setFrequencyBand(safeBand);

    try {
      await apiService.updateFrequencyBand(safeBand);
    } catch (err) {
      console.error("Error updating frequency band:", err);
      setError("Failed to update frequency band.");
    }
  }, []);

  const handleReset = useCallback(async () => {
    try {
      await apiService.resetPipeline();
      setProcessResult(null);
      setMagnifiedFrame(null);
      setError(null);
      setIsMonitoring(false);
      waveformHistoryRef.current = [];
      setWaveformData([]);
      setSpectralData([]);
    } catch (err) {
      console.error("Error resetting pipeline:", err);
      setError("Failed to reset system.");
    }
  }, []);

  return (
    <div className="professional-app-container">
      <style>
        {`
          .professional-app-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: linear-gradient(135deg, #0b0f1a 0%, #111827 100%);
            color: #e4e6eb;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
          }

          .app-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            padding: 1rem 2rem;
            background: rgba(20, 30, 50, 0.4);
            border-bottom: 1px solid rgba(0, 229, 255, 0.1);
            flex-shrink: 0;
          }

          .app-header-title {
            font-size: 1.3rem;
            font-weight: 700;
            letter-spacing: 1px;
            color: #00e5ff;
          }

          .app-header-subtitle {
            font-size: 0.8rem;
            color: #a0a9b8;
            letter-spacing: 0.5px;
            margin-top: 0.25rem;
          }

          .header-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .status-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(0, 229, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.3);
            border-radius: 0.5rem;
            font-size: 0.8rem;
            color: #a0a9b8;
          }

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2ecc71;
          }

          .status-dot.disconnected {
            background: #ff3b30;
            animation: pulse-fault 1s ease-in-out infinite;
          }

          @keyframes pulse-fault {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .header-btn {
            padding: 0.6rem 1.2rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
            transition: all 300ms ease;
            text-transform: uppercase;
          }

          .reset-btn {
            background: linear-gradient(135deg, #00e5ff, #1e90ff);
            border: 1px solid #00e5ff;
            color: #0b0f1a;
          }

          .performance-btn {
            background: rgba(0, 229, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.35);
            color: #00e5ff;
          }

          .header-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 229, 255, 0.25);
          }

          .header-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          .error-banner {
            padding: 1rem 2rem;
            background: rgba(255, 59, 48, 0.15);
            border-bottom: 2px solid #ff3b30;
            color: #ff9999;
            font-size: 0.9rem;
            letter-spacing: 0.3px;
            flex-shrink: 0;
          }

          .app-content {
            flex: 1;
            overflow: hidden;
          }
        `}
      </style>

      <header className="app-header">
        <div>
          <div className="app-header-title">
            Webcam-Based Motion Magnification for Vibration Anomaly Detection
          </div>
          <div className="app-header-subtitle">Real-time Predictive Maintenance System</div>
        </div>

        <div className="header-controls">
          <div className="status-badge">
            <span className={`status-dot ${backendHealth ? "" : "disconnected"}`} />
            <span>{backendHealth ? "Backend Connected" : "Backend Disconnected"}</span>
          </div>

          <button
            className="header-btn reset-btn"
            onClick={handleReset}
            disabled={!backendHealth}
            title="Reset all systems and clear data"
          >
            Reset System
          </button>

          <button
            className="header-btn performance-btn"
            onClick={() => setShowPerformanceMonitor((current) => !current)}
            title="Toggle performance monitor"
          >
            Performance
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {showPerformanceMonitor && (
        <PerformanceMonitor
          isVisible={showPerformanceMonitor}
          onPerformanceUpdate={handlePerformanceUpdate}
        />
      )}

      <div className="app-content">
        <VideoCapture
          onFrameCapture={handleFrameCapture}
          isMonitoring={isMonitoring}
        />

        <ProfessionalDashboard
          backendConnected={backendHealth}
          rawVideoFrame={rawVideoFrame}
          magnifiedFrame={magnifiedFrame}
          waveformData={waveformData}
          spectralData={spectralData}
          processResult={processResult}
          isMonitoring={isMonitoring}
          isLoading={isLoading}
          roi={roi}
          onRoiChange={clampRoi}
          onStartMonitoring={handleStartMonitoring}
          onStopMonitoring={handleStopMonitoring}
          onAmplificationChange={handleAmplificationChange}
          onFrequencyBandChange={handleFrequencyBandChange}
          currentAmplification={currentAmplification}
          frequencyBand={frequencyBand}
        />
      </div>
    </div>
  );
};

export default Home;
