import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const SpectrumAnalyzer = ({ spectralData = [], dominantFrequency = 15 }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(spectralData) || spectralData.length === 0) {
      return [];
    }

    return spectralData.map((val, idx) => {
      const frequency = typeof val === "number" ? idx * 2 : val.frequency ?? idx * 2;
      const magnitude = typeof val === "number" ? val : val.magnitude || 0;

      return {
        frequency,
        magnitude,
        isDominant: Math.abs(frequency - dominantFrequency) < 3,
      };
    });
  }, [spectralData, dominantFrequency]);

  const bandDistribution = useMemo(() => {
    if (!chartData.length) {
      return { low: 0, mid: 0, high: 0 };
    }

    const totalMagnitude = chartData.reduce((sum, point) => sum + point.magnitude, 0) || 1;
    const low = chartData
      .filter((point) => point.frequency >= 0 && point.frequency < 5)
      .reduce((sum, point) => sum + point.magnitude, 0);
    const mid = chartData
      .filter((point) => point.frequency >= 5 && point.frequency < 20)
      .reduce((sum, point) => sum + point.magnitude, 0);
    const high = chartData
      .filter((point) => point.frequency >= 20)
      .reduce((sum, point) => sum + point.magnitude, 0);

    return {
      low: (low / totalMagnitude) * 100,
      mid: (mid / totalMagnitude) * 100,
      high: (high / totalMagnitude) * 100,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-value">{payload[0].payload.frequency.toFixed(1)} Hz</p>
          <p className="tooltip-label">Magnitude: {payload[0].value.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  const actualDominant = chartData.reduce(
    (max, current) => (current.magnitude > max.magnitude ? current : max),
    { frequency: 0, magnitude: 0 }
  );

  return (
    <div className="spectrum-container">
      <div className="spectrum-header">
        <h3 className="spectrum-title">FFT Spectrum Analysis</h3>
        <div className="spectrum-info">
          <div className="info-item">
            <span className="info-label">Dominant Freq:</span>
            <span className="info-value highlight">
              {(actualDominant?.frequency || 0).toFixed(1)} Hz
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Peak Mag:</span>
            <span className="info-value">{(actualDominant?.magnitude || 0).toFixed(3)}</span>
          </div>
        </div>
      </div>

      <div className="spectrum-chart">
        {chartData.length === 0 ? (
          <div className="chart-empty-state">No FFT spectrum yet. Live spectral bins appear during monitoring.</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={1} />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.3} />
                </linearGradient>
                <filter id="spectrumGlow">
                  <feGaussianBlur stdDeviation="1.5" />
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
                dataKey="frequency"
                stroke="#7a8a9a"
                style={{ fontSize: "0.75rem" }}
                label={{ value: "Frequency (Hz)", position: "insideBottomRight", offset: -5 }}
                interval={Math.max(1, Math.floor(chartData.length / 8))}
              />

              <YAxis
                stroke="#7a8a9a"
                style={{ fontSize: "0.75rem" }}
                label={{ value: "Magnitude", angle: -90, position: "insideLeft" }}
                width={35}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="magnitude"
                fill="url(#spectrumGradient)"
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
                filter="url(#spectrumGlow)"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="spectrum-footer">
        <div className="frequency-bands">
          <div className="band">
            <span className="band-label">Low (0-5 Hz):</span>
            <span className="band-value">{bandDistribution.low.toFixed(1)}%</span>
          </div>
          <div className="band">
            <span className="band-label">Mid (5-20 Hz):</span>
            <span className="band-value">{bandDistribution.mid.toFixed(1)}%</span>
          </div>
          <div className="band">
            <span className="band-label">High (20+ Hz):</span>
            <span className="band-value">{bandDistribution.high.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectrumAnalyzer;
