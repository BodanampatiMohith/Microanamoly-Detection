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
  // Generate synthetic FFT spectrum if none provided
  const chartData = useMemo(() => {
    if (!Array.isArray(spectralData) || spectralData.length === 0) {
      // Generate realistic FFT spectrum
      const spectrum = [];
      for (let i = 0; i < 64; i++) {
        const freq = i * 2; // 2Hz resolution
        let magnitude = 0.1;

        // Dominant peak at expected frequency
        if (Math.abs(freq - dominantFrequency) < 3) {
          magnitude = 0.8 + Math.random() * 0.2;
        } else if (Math.abs(freq - dominantFrequency * 2) < 3) {
          magnitude = 0.3 + Math.random() * 0.1; // Harmonic
        } else if (Math.abs(freq - dominantFrequency * 3) < 3) {
          magnitude = 0.15 + Math.random() * 0.08; // 3rd harmonic
        } else {
          magnitude = Math.random() * 0.15; // Noise floor
        }

        spectrum.push({
          frequency: freq,
          magnitude: Math.max(0, magnitude),
          isDominant: Math.abs(freq - dominantFrequency) < 3,
        });
      }
      return spectrum;
    }

    // Use provided data, ensure it has the right format
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

  // Find actual dominant frequency
  const actualDominant =
    chartData.reduce((max, curr) => (curr.magnitude > max.magnitude ? curr : max)) ||
    chartData[0];

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
              interval={Math.floor(chartData.length / 8)}
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
      </div>

      <div className="spectrum-footer">
        <div className="frequency-bands">
          <div className="band">
            <span className="band-label">Low (0-5 Hz):</span>
            <span className="band-value">
              {(
                chartData
                  .filter((d) => d.frequency >= 0 && d.frequency < 5)
                  .reduce((sum, d) => sum + d.magnitude, 0) / 100
              ).toFixed(2)}
            </span>
          </div>
          <div className="band">
            <span className="band-label">Mid (5-20 Hz):</span>
            <span className="band-value">
              {(
                chartData
                  .filter((d) => d.frequency >= 5 && d.frequency < 20)
                  .reduce((sum, d) => sum + d.magnitude, 0) / 100
              ).toFixed(2)}
            </span>
          </div>
          <div className="band">
            <span className="band-label">High (20+ Hz):</span>
            <span className="band-value">
              {(
                chartData
                  .filter((d) => d.frequency >= 20)
                  .reduce((sum, d) => sum + d.magnitude, 0) / 100
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectrumAnalyzer;
