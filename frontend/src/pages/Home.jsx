import React, { useState, useEffect, useCallback } from "react";
import VideoCapture from "../components/VideoCapture";
import Dashboard from "../components/Dashboard";
import RoiSelector from "../components/RoiSelector";
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
  const [magnifiedFrame, setMagnifiedFrame] = useState(null);
  const [backendHealth, setBackendHealth] = useState(false);

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
    const interval = setInterval(checkHealth, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle frame capture
  const handleFrameCapture = useCallback(
    async (frameData) => {
      if (!backendHealth || isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await apiService.processFrame(frameData, roi);

        setProcessResult(result);
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

  // Handle ROI change
  const handleRoiChange = (newRoi) => {
    setRoi(newRoi);
    // Update backend
    apiService.updateROI(newRoi).catch((err) => {
      console.error("Error updating ROI:", err);
    });
  };

  // Handle reset
  const handleReset = async () => {
    try {
      await apiService.resetPipeline();
      setProcessResult(null);
      setMagnifiedFrame(null);
      setError(null);
    } catch (err) {
      console.error("Error resetting pipeline:", err);
    }
  };

  return (
    <div className="app-container">
      <div className="background-grid" />

      {/* Header */}
      <header className="header">
        <div className="header-title">μ-Vibration Anomaly Detector</div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={handleReset}
            disabled={!backendHealth}
          >
            Reset System
          </button>
          <div
            style={{
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: backendHealth ? "var(--accent-teal)" : "var(--accent-red)",
              }}
            />
            {backendHealth ? "Connected" : "Disconnected"}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left: Video Feeds */}
        <div className="video-section">
          {/* Original Webcam Feed */}
          <VideoCapture
            onFrameCapture={handleFrameCapture}
            roi={roi}
            onRoiChange={handleRoiChange}
          />

          {/* Magnified EVM Feed */}
          {magnifiedFrame && (
            <div className="video-container">
              <img
                src={magnifiedFrame}
                alt="Magnified Feed"
                className="video-feed"
              />
              <div className="video-label magnified">Magnified EVM Feed</div>
            </div>
          )}
        </div>

        {/* Right: Dashboard & Controls */}
        <div className="dashboard-section">
          {error && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "var(--radius-md)",
                color: "var(--accent-red)",
                fontSize: "0.9rem",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <Dashboard processResult={processResult} isLoading={isLoading} />

          <RoiSelector roi={roi} onRoiChange={handleRoiChange} />
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-stats">
          <div className="stat">
            <span>🎬</span>
            <span>
              Frame: {processResult?.frame_index || 0}
            </span>
          </div>
          <div className="stat">
            <span>⏱️</span>
            <span>
              {processResult?.timestamp
                ? new Date(processResult.timestamp).toLocaleTimeString()
                : "Ready"}
            </span>
          </div>
        </div>
        <div style={{ fontSize: "0.75rem" }}>
          Microanomalies Detection System v1.0 | Eulerian Video Magnification
        </div>
      </footer>
    </div>
  );
};

export default Home;
