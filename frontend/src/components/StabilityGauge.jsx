export const StabilityGauge = ({ value = 75, status = "NORMAL" }) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Determine status colors
  const getStatusColor = () => {
    if (clampedValue >= 75) return { bg: "#2ECC71", glow: "rgba(46, 204, 113, 0.5)" };
    if (clampedValue >= 50) return { bg: "#FFB300", glow: "rgba(255, 179, 0, 0.5)" };
    return { bg: "#FF3B30", glow: "rgba(255, 59, 48, 0.5)" };
  };

  const colors = getStatusColor();
  const statusText = status || (clampedValue >= 75 ? "Normal" : clampedValue >= 50 ? "Warning" : "Fault");

  // Create SVG gauge visualization
  const angle = (clampedValue / 100) * 180 - 90; // -90 to 90 degrees
  const radius = 45;
  const cx = 50;
  const cy = 50;
  
  const x = cx + radius * Math.cos((angle * Math.PI) / 180);
  const y = cy + radius * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="stability-gauge-container">
      <div className="gauge-header">
        <div className="gauge-title">Stability Index</div>
        <div className="gauge-numeric-value">{clampedValue.toFixed(0)}</div>
      </div>

      <div className="gauge-visualization">
        <svg viewBox="0 0 100 60" className="gauge-svg">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#1a2332"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Gradient arc - colored segment */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2ECC71" stopOpacity="1" />
              <stop offset="50%" stopColor="#FFB300" stopOpacity="1" />
              <stop offset="100%" stopColor="#FF3B30" stopOpacity="1" />
            </linearGradient>
            <filter id="gaugeShadow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.6" />
              </feComponentTransfer>
            </filter>
          </defs>

          <path
            d={`M 10 50 A 40 40 0 ${clampedValue > 50 ? 1 : 0} 1 ${cx + 40 * Math.cos(((clampedValue / 100) * 180 - 90) * (Math.PI / 180))} ${cy + 40 * Math.sin(((clampedValue / 100) * 180 - 90) * (Math.PI / 180))}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
          />

          {/* Center point */}
          <circle cx={cx} cy={cy} r="3" fill={colors.bg} opacity="0.8" />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={colors.bg}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = (tick / 100) * 180 - 90;
            const x1 = cx + 38 * Math.cos((tickAngle * Math.PI) / 180);
            const y1 = cy + 38 * Math.sin((tickAngle * Math.PI) / 180);
            const x2 = cx + 42 * Math.cos((tickAngle * Math.PI) / 180);
            const y2 = cy + 42 * Math.sin((tickAngle * Math.PI) / 180);
            return (
              <line
                key={`tick-${tick}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4a5a7a"
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}

          {/* Labels */}
          <text x="10" y="58" fontSize="9" fill="#7a8a9a" opacity="0.7">
            0
          </text>
          <text x="82" y="58" fontSize="9" fill="#7a8a9a" opacity="0.7">
            100
          </text>
        </svg>
      </div>

      <div className="gauge-status">
        <div
          className="status-indicator"
          style={{
            backgroundColor: colors.bg,
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        />
        <div className="status-text">{statusText}</div>
      </div>

      <div className="gauge-legend">
        <div className="legend-item good">
          <span className="legend-dot" />
          <span>Normal: 75-100</span>
        </div>
        <div className="legend-item warning">
          <span className="legend-dot" />
          <span>Warning: 50-75</span>
        </div>
        <div className="legend-item fault">
          <span className="legend-dot" />
          <span>Fault: 0-50</span>
        </div>
      </div>
    </div>
  );
};

export default StabilityGauge;
