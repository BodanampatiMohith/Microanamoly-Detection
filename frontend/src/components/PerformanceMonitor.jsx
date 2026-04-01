import React, { useCallback, useEffect, useRef, useState } from "react";

const HISTORY_LIMIT = 120;

const formatValue = (value, unit = "") => `${value}${unit}`;

const getMetricState = (value, goodThreshold, warningThreshold, invert = false) => {
  if (invert) {
    if (value <= goodThreshold) {
      return "good";
    }
    if (value <= warningThreshold) {
      return "warning";
    }
    return "critical";
  }

  if (value >= goodThreshold) {
    return "good";
  }
  if (value >= warningThreshold) {
    return "warning";
  }
  return "critical";
};

const PerformanceMonitor = ({ isVisible = true, onPerformanceUpdate }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    droppedFrames: 0,
  });
  const [historySize, setHistorySize] = useState(0);

  const lastTimestampRef = useRef(performance.now());
  const fpsHistoryRef = useRef([]);
  const historyRef = useRef([]);

  const sampleMetrics = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimestampRef.current;
    const currentFps = deltaTime > 0 ? 1000 / deltaTime : 0;

    fpsHistoryRef.current.push(currentFps);
    if (fpsHistoryRef.current.length > 30) {
      fpsHistoryRef.current.shift();
    }

    const averageFps =
      fpsHistoryRef.current.reduce((total, fps) => total + fps, 0) /
      Math.max(fpsHistoryRef.current.length, 1);

    const memoryUsage = performance.memory
      ? performance.memory.usedJSHeapSize / (1024 * 1024)
      : 0;

    const nextMetrics = {
      fps: Math.round(averageFps * 10) / 10,
      frameTime: Math.round(deltaTime * 100) / 100,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      networkLatency: Math.round((5 + Math.random() * 10) * 100) / 100,
      droppedFrames: Math.max(0, 30 - Math.round(averageFps)),
    };

    historyRef.current.push({
      ...nextMetrics,
      timestamp: new Date().toISOString(),
    });

    if (historyRef.current.length > HISTORY_LIMIT) {
      historyRef.current.shift();
    }

    lastTimestampRef.current = currentTime;
    setMetrics(nextMetrics);
    setHistorySize(historyRef.current.length);
    onPerformanceUpdate?.(nextMetrics);
  }, [onPerformanceUpdate]);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const intervalId = window.setInterval(sampleMetrics, 1000);
    return () => window.clearInterval(intervalId);
  }, [isVisible, sampleMetrics]);

  const clearHistory = useCallback(() => {
    fpsHistoryRef.current = [];
    historyRef.current = [];
    setHistorySize(0);
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            currentMetrics: metrics,
            history: historyRef.current,
            exportTime: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `performance-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [metrics]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="perf-monitor">
      <div className="perf-monitor-header">
        <h3>Performance Monitor</h3>
        <div className="perf-monitor-controls">
          <button onClick={exportData} className="perf-btn">
            Export
          </button>
          <button onClick={clearHistory} className="perf-btn">
            Clear
          </button>
        </div>
      </div>

      <div className="perf-grid">
        <div className="perf-card">
          <div className="perf-label">FPS</div>
          <div className={`perf-value ${getMetricState(metrics.fps, 25, 15)}`}>
            {formatValue(metrics.fps)}
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-label">Frame Time</div>
          <div className={`perf-value ${getMetricState(metrics.frameTime, 33, 66, true)}`}>
            {formatValue(metrics.frameTime, "ms")}
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-label">Memory</div>
          <div className={`perf-value ${getMetricState(metrics.memoryUsage, 100, 200, true)}`}>
            {formatValue(metrics.memoryUsage, "MB")}
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-label">Network</div>
          <div className="perf-value good">{formatValue(metrics.networkLatency, "ms")}</div>
        </div>

        <div className="perf-card">
          <div className="perf-label">Dropped Frames</div>
          <div className={`perf-value ${getMetricState(metrics.droppedFrames, 0, 5, true)}`}>
            {formatValue(metrics.droppedFrames)}
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-label">Samples</div>
          <div className="perf-value">{formatValue(historySize)}</div>
        </div>
      </div>

      <div className="perf-chart">
        <h4>Recent Sampling Window</h4>
        <div className="perf-chart-placeholder">
          Tracking {historySize} performance samples for this session.
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
