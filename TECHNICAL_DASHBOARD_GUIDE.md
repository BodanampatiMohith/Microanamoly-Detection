# Professional Dashboard - Technical Implementation Guide

## Architecture Overview

### Component Hierarchy

```
App.jsx
└── Home.jsx (Main Page)
    ├── VideoCapture (external)
    └── ProfessionalDashboard.jsx (Main Container)
        ├── Video Panels
        ├── WaveformChart.jsx (Recharts)
        ├── SpectrumAnalyzer.jsx (Recharts)
        └── Right Panel
            ├── StabilityGauge.jsx
            ├── Metrics Grid
            └── Control Panel
```

---

## Component Details

### 1. **ProfessionalDashboard.jsx** (Main Container)
**Location**: `frontend/src/components/ProfessionalDashboard.jsx`

**Purpose**: Orchestrates all dashboard elements and manages data flow

**Props**:
```javascript
{
  rawVideoFrame: string,          // Base64 image of raw video
  magnifiedFrame: string,          // Base64 image of magnified video
  waveformData: number[],          // Array of amplitude samples
  spectralData: number[],          // Array of frequency magnitudes
  processResult: object,           // Full backend response
  isMonitoring: boolean,           // Monitoring status
  onStartMonitoring: () => void,
  onStopMonitoring: () => void,
  onAmplificationChange: (value) => void,
  onFrequencyBandChange: (band) => void,
  currentAmplification: number,    // 1-100
  frequencyBand: {low, high}       // Hz values
}
```

**State Management**:
- Maintains waveform and spectral history locally
- Uses refs for performance-critical history updates
- Limits history to 500 samples for smooth rendering

**Key Methods**:
- `calculateMetrics()`: Derives all displayed metrics from processResult

---

### 2. **StabilityGauge.jsx** (SVG-based Visualization)
**Location**: `frontend/src/components/StabilityGauge.jsx`

**Purpose**: Real-time status visualization with semi-circular gauge

**Props**:
```javascript
{
  value: number,      // 0-100 stability score
  status: string      // "NORMAL" | "WARNING" | "FAULT"
}
```

**Features**:
- SVG-rendered semi-circular gauge
- Gradient arc showing all three zones
- Animated needle pointing to current value
- Color-coded status indicator with glow effect
- Tick marks and legend

**Customization**:
```javascript
// To change gauge colors, modify getStatusColor():
const getStatusColor = () => {
  if (value >= 75) return { bg: "#2ECC71", glow: "..." }; // Normal
  if (value >= 50) return { bg: "#FFB300", glow: "..." }; // Warning
  return { bg: "#FF3B30", glow: "..." };                   // Fault
};
```

---

### 3. **WaveformChart.jsx** (Time-Domain Visualization)
**Location**: `frontend/src/components/WaveformChart.jsx`

**Purpose**: Displays vibration amplitude over time

**Props**:
```javascript
{
  data: number[],                  // Amplitude samples
  title: string = "Time-Domain Waveform"
}
```

**Dependencies**: Recharts (LineChart component)

**Data Processing**:
- Converts raw array to Recharts format: `{time: idx, amplitude: val}`
- Generates synthetic data if none provided (demo mode)
- Keeps last 200 samples for performance

**Calculations**:
- **RMS**: `sqrt(sum(x²) / n)`
- **Peak-to-Peak**: `max(x) - min(x)`

**Customization**:
```css
/* Chart line color (cyan) */
stroke="#00E5FF"

/* Grid color (low opacity) */
stroke="#1a3a4a" opacity="0.3"

/* Gradient glow effect */
<linearGradient id="waveGradient">
  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.8} />
  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.1} />
</linearGradient>
```

---

### 4. **SpectrumAnalyzer.jsx** (Frequency-Domain Visualization)
**Location**: `frontend/src/components/SpectrumAnalyzer.jsx`

**Purpose**: Displays FFT spectrum with dominant frequency highlighting

**Props**:
```javascript
{
  spectralData: number[],          // FFT magnitude values
  dominantFrequency: number        // Hz value for reference
}
```

**Dependencies**: Recharts (BarChart component)

**Features**:
- 64-point FFT visualization (2 Hz resolution)
- Automatic dominant peak identification
- Frequency band energy calculation
- Color intensity based on magnitude

**Band Definitions**:
```javascript
Low (0-5 Hz):      Sub-harmonic and very low frequency
Mid (5-20 Hz):     Primary bearing and shaft frequencies
High (20+ Hz):     High-frequency impacts and noise
```

---

## Styling System

### Color Variables (CSS Custom Properties)
**File**: `frontend/src/styles/dashboard.css`

```css
:root {
  --color-bg-dark: #0b0f1a;              /* Main background */
  --color-bg-secondary: #111827;         /* Panel background */
  --color-bg-tertiary: #1a2332;          /* Hover/active bg */
  --color-accent-cyan: #00e5ff;          /* Primary accent */
  --color-accent-blue: #1e90ff;          /* Secondary accent */
  --color-status-normal: #2ecc71;        /* Green status */
  --color-status-warning: #ffb300;       /* Amber status */
  --color-status-fault: #ff3b30;         /* Red status */
  --color-text-primary: #e4e6eb;         /* Main text */
  --color-text-secondary: #a0a9b8;       /* Secondary text */
  --color-text-tertiary: #7a8a9a;        /* Tertiary text */
}
```

### Responsive Breakpoints

```css
Desktop (1200px+):  Full layout, 2-column charts, 2x3 metrics grid
Tablet (768-1200): Single column panels, 3-column metrics
Mobile (<768px):   Vertical stack, 2-column metrics, smaller fonts
```

---

## Data Flow

### Frame Processing Pipeline

```
VideoCapture Component
    ↓
    Canvas capture
    ↓ (Canvas → Base64)
    ↓
Home.jsx handleFrameCapture()
    ↓
    API Service → Backend
    ↓
    Backend processes: EVM + Anomaly Detection
    ↓
    Returns: {
      features: {
        dominant_frequency,
        rms,
        variance,
        peak_to_peak,
        spectral_entropy,
        motion_signal: [...],
        spectral_magnitude: [...]
      },
      anomaly_detection: {
        anomaly_index,
        status,
        is_normal
      },
      magnified_frame: "base64..."
    }
    ↓
Home.jsx updates state:
  - setRawVideoFrame()
  - setMagnifiedFrame()
  - setProcessResult()
  - setWaveformData() → WaveformChart
  - setSpectralData() → SpectrumAnalyzer
    ↓
ProfessionalDashboard receives props
    ↓
Components render with new data
```

---

## State Management Strategy

### Home.jsx State
```javascript
// Core data
const [processResult, setProcessResult]      // Backend response
const [rawVideoFrame, setRawVideoFrame]      // Current raw frame
const [magnifiedFrame, setMagnifiedFrame]    // Current magnified frame

// Time-series data
const [waveformData, setWaveformData]        // 500 samples
const [spectralData, setSpectralData]        // 64 frequency bins

// Control parameters
const [currentAmplification, setCurrentAmplification]  // 1-100
const [frequencyBand, setFrequencyBand]      // {low, high}
const [isMonitoring, setIsMonitoring]        // Boolean

// System state
const [isLoading, setIsLoading]              // Processing flag
const [backendHealth, setBackendHealth]      // Connection status
const [error, setError]                      // Error message
```

### Data Persistence (Refs)
```javascript
const waveformHistoryRef = useRef([])      // Accumulate 500 samples
const spectralHistoryRef = useRef([])      // Store latest spectrum

// Update refs without triggering re-render
waveformHistoryRef.current = [
  ...waveformHistoryRef.current,
  ...newSamples
].slice(-500);
```

---

## API Integration

### Backend Endpoints Used

**1. Health Check**
```
GET /api/health
Returns: {status: "healthy"}
Called: Every 5 seconds
```

**2. Process Frame**
```
POST /api/process
Body: {
  frame: base64_image,
  roi: {x, y, width, height},
  amplification: 20,
  freq_band: {low: 0.4, high: 100}
}
Returns: {
  features: {...},
  anomaly_detection: {...},
  magnified_frame: "base64..."
}
```

**3. Update ROI** (Optional)
```
POST /api/update-roi
Body: {x, y, width, height}
```

**4. Update Amplification** (Optional)
```
POST /api/update-amplification
Body: {amplification: 20}
```

**5. Update Frequency Band** (Optional)
```
POST /api/update-frequency-band
Body: {low: 0.4, high: 100}
```

---

## Performance Optimization

### Render Efficiency
1. **Memoization**:
   - WaveformChart and SpectrumAnalyzer use `useMemo` for data transformation
   - Prevents unnecessary re-renders

2. **Data Limiting**:
   - Waveform: Keep only 500 samples
   - Spectral: Keep only latest 64-bin spectrum
   - Prevents excessive DOM updates

3. **Chart Optimization**:
   - `isAnimationActive={false}` on all Recharts
   - Reduces CPU usage on continuous updates

4. **Ref-based Updates**:
   - Use useRef for accumulating history
   - Only setWaveformData when state change needed
   - Avoids triggering renders on every sample

### Memory Usage
- Waveform history: ~2KB (500 × 4 bytes)
- Spectral history: ~256 bytes (64 × 4 bytes)
- Video frames: Base64 overhead (~30-50KB per frame)

---

## Customization Guide

### Changing Color Scheme

**Option 1: Full Recolor**
Edit `:root` variables in `dashboard.css`:
```css
:root {
  --color-accent-cyan: #00ff00;    /* Change to green */
  --color-status-normal: #00ff00;  /* Change to bright green */
  --color-status-warning: #ffff00; /* Change to yellow */
  --color-status-fault: #ff0000;   /* Change to bright red */
}
```

**Option 2: Individual Component**
Modify specific component's inline styles:
```javascript
// In StabilityGauge.jsx
const getStatusColor = () => {
  if (clampedValue >= 75) return { bg: "#00ff00", glow: "..." }; // Custom green
  ...
};
```

### Adding New Metrics

**Step 1**: Add calculation in `calculateMetrics()` in ProfessionalDashboard:
```javascript
const calculateMetrics = () => {
  return {
    ...existing,
    customMetric: processResult.features?.custom_value || 0,
  };
};
```

**Step 2**: Add metric card to metrics grid:
```javascript
<div className="metric-card">
  <div className="metric-label">Custom Metric</div>
  <div className="metric-value">{metrics?.customMetric?.toFixed(2)}</div>
  <div className="metric-unit">Unit</div>
</div>
```

### Modifying Gauge Zones

Edit thresholds in `StabilityGauge.jsx`:
```javascript
// Current: 0-50 FAULT, 50-75 WARNING, 75-100 NORMAL
// Change to: 0-40 FAULT, 40-70 WARNING, 70-100 NORMAL

if (clampedValue >= 70) return { bg: "#2ECC71", ... };  // 70-100
if (clampedValue >= 40) return { bg: "#FFB300", ... };  // 40-70
return { bg: "#FF3B30", ... };                           // 0-40
```

### Adjusting Chart Parameters

**Waveform Chart**:
```javascript
// Change sample window (currently 200)
return data.slice(-200).map(...)  // Change to 300, 500, etc.

// Adjust grid styling
stroke="#1a3a4a"    // Change grid color
opacity={0.3}       // Change grid opacity (0-1)
```

**Spectrum Chart**:
```javascript
// Change frequency resolution (currently 2 Hz per bin)
const freq = i * 2;  // Change to i * 1 for 1 Hz, i * 4 for 4 Hz bins

// Change number of bins (currently 64)
for (let i = 0; i < 64; i++)  // Change to 32 or 128
```

---

## Testing & Debugging

### Demo Mode
Components automatically generate synthetic data if none provided:

```javascript
// WaveformChart generates demo waveform
// SpectrumAnalyzer generates demo spectrum

// To use demo data without backend:
<ProfessionalDashboard
  rawVideoFrame={null}           // Shows placeholder
  magnifiedFrame={null}          // Shows placeholder
  waveformData={[]}              // Generates demo data
  spectralData={[]}              // Generates demo spectrum
/>
```

### Chrome DevTools Integration
1. **React DevTools**: Inspect component props and state
2. **Performance tab**: Monitor render times
3. **Network tab**: Check API calls
4. **Console**: Check for warnings/errors

### Common Issues & Solutions

| Issue | Debug Method | Solution |
|-------|---|---|
| Charts not updating | Check waveformData prop | Verify Home state updates |
| Gauge not responsive | Use React DevTools | Check stabilityIndex calculation |
| Slow performance | Performance tab | Reduce animation, limit samples |
| Wrong colors | Inspect computed styles | Check CSS override |

---

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | Full |
| Edge | 90+ | Full |
| Firefox | 88+ | Full |
| Safari | 14+ | Full (requires testing) |
| Mobile browsers | Latest | Limited (small screen) |

---

## Future Enhancement Opportunities

1. **Data Persistence**:
   - Save sessions to local storage
   - Export as CSV/JSON
   - Generate PDF reports

2. **Advanced Analytics**:
   - Trend analysis over time
   - Predictive maintenance scoring
   - Compare multiple monitored items

3. **Real-time Alerts**:
   - Email/SMS notifications
   - Browser notifications
   - Sound alerts for FAULT status

4. **Customization**:
   - User theming preferences
   - Adjustable metric display
   - Custom frequency band presets

5. **Multi-equipment Tracking**:
   - Dashboard for multiple machines
   - Historical comparison view
   - Batch reporting

---

## Deployment Checklist

- [ ] Update API endpoints in `apiService`
- [ ] Set correct backend URL
- [ ] Test with real video feed
- [ ] Verify all metrics display correctly
- [ ] Check responsive layout on target devices
- [ ] Test error handling (backend down)
- [ ] Verify color contrast for accessibility
- [ ] Load test with continuous monitoring
- [ ] Document custom modifications
- [ ] Create user training materials

---

## Support References

- **Recharts Documentation**: https://recharts.org/
- **React Documentation**: https://react.dev/
- **CSS Grid**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
- **SVG in React**: https://react.dev/learn/manipulating-the-dom-with-refs

---

**Version**: 1.0
**Last Updated**: February 2026
**Maintained By**: Engineering Team
