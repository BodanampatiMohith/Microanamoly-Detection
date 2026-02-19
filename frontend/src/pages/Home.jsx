import React, { useState, useEffect, useCallback, useRef } from "react";
import VideoCapture from "../components/VideoCapture";
import ProfessionalDashboard from "../components/ProfessionalDashboard";
import PerformanceMonitor from "../components/PerformanceMonitor";
import { apiService } from "../services/api";

export const Home = () => {
  const [roi, setRoi] = useState({
    x: 100,
    y: 100,
    width: 300,
    height: 200,
  });

  const [processResult, setProcessResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawVideoFrame, setRawVideoFrame] = useState(null);
  const [magnifiedFrame, setMagnifiedFrame] = useState(null);
  const [backendHealth, setBackendHealth] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentAmplification, setCurrentAmplification] = useState(20);
  const [frequencyBand, setFrequencyBand] = useState({ low: 0.4, high: 100 });
  const [waveformData, setWaveformData] = useState([]);
  const [spectralData, setSpectralData] = useState([]);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  
  const waveformHistoryRef = useRef([]);
  const spectralHistoryRef = useRef([]);

  // Handle performance updates from PerformanceMonitor
  const handlePerformanceUpdate = useCallback((performanceMetrics) => {
    // Could be used to adjust processing parameters based on performance
    if (performanceMetrics.fps < 15) {
      console.warn("Low FPS detected, consider reducing processing load");
    }
  }, []);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiService.health();
        setBackendHealth(health.status === "healthy");
      } catch (err) {
        console.error("Backend health check failed:", err);
        setBackendHealth(false);
        setError("Cannot connect to backend. Make sure Flask server is running.");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle frame capture
  const handleFrameCapture = useCallback(
    async (frameData) => {
      if (!backendHealth || isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        // Set raw frame for display
        if (typeof frameData === "string") {
          setRawVideoFrame(frameData);
        }

        const result = await apiService.processFrame(frameData, roi);

        setProcessResult(result);

        // Update waveform data
        if (result.features?.motion_signal) {
          waveformHistoryRef.current = [
            ...waveformHistoryRef.current,
            ...result.features.motion_signal,
          ].slice(-500);
          setWaveformData([...waveformHistoryRef.current]);
        }

        // Update spectral data
        if (result.features?.spectral_magnitude) {
          spectralHistoryRef.current = result.features.spectral_magnitude;
          setSpectralData([...spectralHistoryRef.current]);
        }

        // Update magnified frame
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
    [roi, backendHealth, isLoading]
  );

  // Handle monitoring start
  const handleStartMonitoring = () => {
    setIsMonitoring(true);
  };

  // Handle monitoring stop
  const handleStopMonitoring = () => {
    setIsMonitoring(false);
  };

  // Handle amplification change
  const handleAmplificationChange = (value) => {
    setCurrentAmplification(value);
    // Optionally send to backend
    apiService.updateAmplification?.(value).catch((err) => {
      console.error("Error updating amplification:", err);
    });
  };

  // Handle frequency band change
  const handleFrequencyBandChange = (newBand) => {
    setFrequencyBand(newBand);
    // Optionally send to backend
    apiService.updateFrequencyBand?.(newBand).catch((err) => {
      console.error("Error updating frequency band:", err);
    });
  };

  // Handle reset
  const handleReset = async () => {
    try {
      await apiService.resetPipeline();
      setProcessResult(null);
      setRawVideoFrame(null);
      setMagnifiedFrame(null);
      setError(null);
      setIsMonitoring(false);
      waveformHistoryRef.current = [];
      spectralHistoryRef.current = [];
      setWaveformData([]);
      setSpectralData([]);
    } catch (err) {
      console.error("Error resetting pipeline:", err);
      setError("Failed to reset system");
    }
  };

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

          .reset-btn {
            padding: 0.6rem 1.2rem;
            background: linear-gradient(135deg, #00e5ff, #1e90ff);
            border: 1px solid #00e5ff;
            border-radius: 0.5rem;
            color: #0b0f1a;
            font-weight: 600;
            cursor: pointer;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
            transition: all 300ms ease;
            text-transform: uppercase;
          }

          .reset-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 229, 255, 0.4);
          }

          .reset-btn:disabled {
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
          }

          .app-content {
            flex: 1;
            overflow: hidden;
          }
        `}
      </style>

      {/* Header */}
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
            className="reset-btn"
            onClick={handleReset}
            disabled={!backendHealth}
            title="Reset all systems and clear data"
          >
            Reset System
          </button>
          <button
            className="performance-btn"
            onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
            title="Toggle performance monitor"
          >
            📊 Performance
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Performance Monitor */}
      {showPerformanceMonitor && (
        <PerformanceMonitor
          isVisible={showPerformanceMonitor}
          onPerformanceUpdate={handlePerformanceUpdate}
        />
      )}

      {/* Main Content */}
      <div className="app-content">
        <VideoCapture
          onFrameCapture={handleFrameCapture}
          rol={roi}
          onRoiChange={setRoi}
          isMonitoring={isMonitoring}
        />

        <ProfessionalDashboard
          rawVideoFrame={rawVideoFrame}
          magnifiedFrame={magnifiedFrame}
          waveformData={waveformData}
          spectralData={spectralData}
          processResult={processResult}
          isMonitoring={isMonitoring}
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
