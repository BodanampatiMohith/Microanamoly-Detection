import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const WaveformChart = ({ data = [], title = "Time-Domain Waveform" }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.slice(-200).map((val, idx) => ({
      time: idx,
      amplitude: typeof val === "number" ? val : val.amplitude || 0,
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (!chartData.length) {
      return {
        sampleCount: 0,
        maxAmplitude: 0,
        rms: 0,
        peakToPeak: 0,
      };
    }

    const amplitudes = chartData.map((point) => point.amplitude);
    const maxAmplitude = amplitudes.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
    const maxValue = amplitudes.reduce((max, value) => Math.max(max, value), Number.NEGATIVE_INFINITY);
    const minValue = amplitudes.reduce((min, value) => Math.min(min, value), Number.POSITIVE_INFINITY);
    const rms = Math.sqrt(
      amplitudes.reduce((sum, value) => sum + value ** 2, 0) / Math.max(amplitudes.length, 1)
    );

    return {
      sampleCount: chartData.length,
      maxAmplitude,
      rms,
      peakToPeak: maxValue - minValue,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-value">{payload[0].value.toFixed(4)}</p>
          <p className="tooltip-label">Sample {payload[0].payload.time}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="waveform-container">
      <div className="waveform-header">
        <h3 className="waveform-title">{title}</h3>
        <div className="waveform-info">
          <div className="info-item">
            <span className="info-label">Samples:</span>
            <span className="info-value">{stats.sampleCount}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Max:</span>
            <span className="info-value">{stats.maxAmplitude.toFixed(3)}</span>
          </div>
        </div>
      </div>

      <div className="waveform-chart">
        {chartData.length === 0 ? (
          <div className="chart-empty-state">No waveform data yet. Start monitoring to populate this chart.</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.1} />
                </linearGradient>
                <filter id="waveGlow">
                  <feGaussianBlur stdDeviation="2" />
                </filter>
              </defs>

              <CartesianGrid
                vertical={true}
                horizontal={true}
                stroke="#1a3a4a"
                strokeDasharray="3 3"
                opacity={0.3}
              />

              <XAxis
                dataKey="time"
                stroke="#7a8a9a"
                style={{ fontSize: "0.75rem" }}
                interval={Math.max(1, Math.floor(chartData.length / 5))}
              />

              <YAxis
                domain={["dataMin - 0.1", "dataMax + 0.1"]}
                stroke="#7a8a9a"
                style={{ fontSize: "0.75rem" }}
                width={35}
              />

              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="amplitude"
                stroke="#00E5FF"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                filter="url(#waveGlow)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="waveform-footer">
        <div className="measurement">
          <span className="measurement-label">RMS:</span>
          <span className="measurement-value">{stats.rms.toFixed(4)}</span>
        </div>
        <div className="measurement">
          <span className="measurement-label">Peak-to-Peak:</span>
          <span className="measurement-value">{stats.peakToPeak.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};

export default WaveformChart;
