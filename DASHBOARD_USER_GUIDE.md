# Professional Industrial Monitoring Dashboard - User Guide

## Overview

The **Webcam-Based Motion Magnification for Vibration Anomaly Detection** dashboard is a professional-grade interface designed for real-time predictive maintenance and condition monitoring. It provides industrial-grade visualization and analysis tools for detecting vibration anomalies through motion magnification technology.

---

## Dashboard Layout

### 1. **Header Section**
- **System Title**: Clear identification of the system with descriptive subtitle
- **Status Badge**: Real-time backend connection indicator (green when connected, red when disconnected)
- **Reset Button**: Clears all data and resets the monitoring system

### 2. **Top Section - Video Panels** (Side-by-Side)

#### **Left Panel: Raw Video Feed**
- Displays unprocessed webcam input at 30 FPS
- **ROI Overlay**: Subtle cyan dashed bounding box showing Region of Interest
- **Status Indicator**: "LIVE" badge showing real-time streaming
- **Frame Rate**: Displays current FPS

#### **Right Panel: Motion Magnified Output**
- Shows processed video with motion magnification applied
- **Amplification Badge**: Displays current magnification factor (1× to 100×)
- **Status Indicator**: "PROCESSING" badge with amber pulse
- **Active Band Display**: Shows current frequency band being analyzed

---

### 3. **Middle Section - Signal Analysis**

#### **Left Chart: Time-Domain Vibration Waveform**
- **Visualization**: Thin cyan line on dark grid background
- **Grid Lines**: Subtle light grid for reference
- **Interactive Elements**:
  - Hover to see exact amplitude values and sample numbers
  - X-axis: Sample count
  - Y-axis: Amplitude range
- **Metrics Displayed**:
  - Number of samples being analyzed
  - Maximum amplitude value
  - RMS (Root Mean Square) value
  - Peak-to-Peak measurement

#### **Right Chart: FFT Spectrum Analysis**
- **Visualization**: Bar chart showing frequency spectrum distributed across Hz bands
- **Dominant Peak**: Automatically highlighted for the largest frequency component
- **Interactive Elements**:
  - Hover to see frequency and magnitude values
  - Color gradient: Cyan base with intensity based on magnitude
  - Subtle glow effect for visual clarity
- **Frequency Bands Display**:
  - Low (0-5 Hz): Low-frequency vibrations
  - Mid (5-20 Hz): Mid-range vibrations
  - High (20+ Hz): High-frequency components
- **Dominant Frequency**: Highlighted in the header with precise Hz value

---

### 4. **Right Side Panel - Metrics & Controls**

#### **Stability Index Gauge**
The centerpiece of the right panel, displaying system stability on a scale of 0-100:

**Visual Design:**
- Semi-circular gauge with fluid gradient
- Needle indicator pointing to current stability value
- Color-coded zones:
  - **Green (75-100)**: NORMAL - System operating optimally
  - **Amber (50-75)**: WARNING - Increased vibration detected, investigate
  - **Red (0-50)**: FAULT - Critical vibration detected, intervention needed
- Digital numeric display of exact stability percentage
- Status legend explaining each zone

#### **Key Metrics Grid** (6-card layout)
Each metric card displays:

1. **Dominant Frequency (Hz)**
   - Primary vibration frequency detected
   - Range: 0-150 Hz
   - Precision: 2 decimal places

2. **RMS Acceleration (g)**
   - Root Mean Square of vibration
   - Measures overall vibration energy
   - Precision: 3 decimal places

3. **Variance (σ²)**
   - Statistical spread of vibration data
   - Higher values indicate more unstable behavior
   - Precision: 4 decimal places

4. **Peak-to-Peak (mm)**
   - Distance from minimum to maximum displacement
   - Important for structural assessment
   - Precision: 3 decimal places

5. **Spectral Energy (dB)**
   - Total energy in the frequency spectrum
   - Indicates cumulative vibration intensity
   - Precision: 2 decimal places

6. **System Status**
   - Current operational status (NORMAL, WARNING, FAULT, WAITING)
   - Updates in real-time based on analysis

#### **Monitoring Controls Panel**

**Amplification Factor Slider**
- Range: 1× to 100×
- Current value displayed in real-time
- Controls motion magnification intensity
- Useful for visualizing subtle vibrations
- Labels: 1×, 50×, 100× for reference

**Frequency Band Selector**
- **Low Frequency Input** (Hz): Minimum frequency to analyze (0-100 Hz)
- **High Frequency Input** (Hz): Maximum frequency to analyze (0-150 Hz)
- **Band Display**: Shows selected frequency range and span
- Common presets:
  - Small machinery: 0.4-50 Hz
  - Large machinery: 0.4-20 Hz
  - Bearing analysis: 5-100 Hz

**Action Buttons**
- **Start/Stop Monitoring**: Toggle real-time analysis
  - Green when idle
  - Red with "Stop" label when monitoring active
  - Disabled when system not ready

**System Information**
- **Processing Status**: Active or Idle
- **Frame Count**: Total frames processed in current session
- **Timestamp**: Current time of last measurement

---

## Color Scheme

The dashboard uses a professional engineering lab aesthetic:

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Background | Deep Navy | #0B0F1A | Main background |
| Secondary BG | Dark Navy | #111827 | Panel backgrounds |
| Primary Accent | Cyan | #00E5FF | Graphs, highlights, accents |
| Secondary Accent | Electric Blue | #1E90FF | Gradients, secondary highlights |
| Normal Status | Soft Green | #2ECC71 | Good operating condition |
| Warning Status | Amber | #FFB300 | Caution, investigate |
| Fault Status | Red | #FF3B30 | Critical, intervention needed |
| Text Primary | Light Gray | #E4E6EB | Main text |
| Text Secondary | Medium Gray | #A0A9B8 | Secondary text |
| Text Tertiary | Dark Gray | #7A8A9A | Tertiary text, labels |
| Border | Cyan (10% opacity) | rgba(0,229,255,0.1) | Panel borders |

---

## Real-Time Data Flow

### Waveform History
- Displays last 500 samples of vibration signal
- Updates as new frames arrive
- Shows fluctuations in real-time motion

### Spectral History
- FFT spectrum updated with each frame
- 64-point frequency resolution (2 Hz per bin)
- Shows dominant frequency and harmonics

### Stability Index Calculation
```
Stability = (1 - AnomalyScore) × 100
- Anomaly Score comes from machine learning model
- Higher stability = healthier system
- Updates every frame
```

---

## Interpretation Guide

### Normal Operation (Green Zone: 75-100)
- Vibration within expected parameters
- No anomalies detected
- Safe to continue operation
- **Action**: Monitor periodically

### Warning Zone (Amber: 50-75)
- Elevated vibration or anomaly score increasing
- Possible emerging issues
- Recommend increased monitoring frequency
- **Action**: Schedule maintenance inspection

### Fault Zone (Red: 0-50)
- Critical anomaly detected
- Vibration levels exceeding safe thresholds
- Possible imminent failure
- **Action**: Stop operation and inspect immediately

---

## Operating Instructions

### Starting Monitoring
1. Ensure backend is connected (green status badge)
2. Position camera to capture Region of Interest (ROI)
3. Adjust **Amplification Factor** to 20-30× for typical machinery
4. Set **Frequency Band** according to equipment specifications
5. Click **Start Monitoring** button
6. Observe stability gauge and waveform chart

### Adjusting Parameters
- **Amplification Too Low**: Subtle vibrations invisible → increase to 50×+
- **Amplification Too High**: Excessive noise visible → decrease to 10×
- **Frequency Band Too Wide**: Multiple frequencies confusing signal → narrow band
- **Frequency Band Too Narrow**: Missing important components → widen band

### Interpreting Results
- **Dominant Frequency**: Compare with equipment spec sheet
  - Should match expected resonance frequencies
  - New peaks indicate emerging issues
- **Spectral Energy**: Higher values = more vibration overall
- **Peak-to-Peak**: Physical displacement magnitude
  - Critical for bearing life estimation

### Resetting System
- Click **Reset System** to clear all data
- Useful between monitoring sessions
- Clears waveform and spectral history

---

## Technical Specifications

### Analysis Parameters
- **FFT Resolution**: 2 Hz per frequency bin
- **Sample Rate**: 30 FPS (from video)
- **Waveform History**: 500 samples (≈17 seconds)
- **Spectral Bins**: 64 frequency bands (0-128 Hz)
- **Update Rate**: Real-time (per frame)

### Stability Index Zones
- **Zone 1 (0-50)**: FAULT
  - Anomaly index > 0.5
  - Requires immediate attention
  - Likely vibration beyond acceptable limits

- **Zone 2 (50-75)**: WARNING
  - Anomaly index 0.25-0.5
  - Elevated vibration detected
  - Monitor closely, schedule maintenance

- **Zone 3 (75-100)**: NORMAL
  - Anomaly index < 0.25
  - System operating normally
  - Continue regular monitoring

### Video Processing
- **Raw Feed**: 30 FPS, unprocessed video
- **Magnified Feed**: 30 FPS, motion magnification applied
- **ROI Box**: Cyan dashed outline, 4-pixel spacing animation
- **Magnification Range**: 1-100× (configurable)
- **Frequency Filter**: Adaptive based on selected band

---

## Performance Notes

### Optimal Usage
- Monitor for 5-30 minute continuous sessions
- Observe at least 2-3 oscillation cycles
- Stability index becomes more reliable over time
- Watch for pattern changes, not single-point values

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Charts show no data | System just started | Wait 10-20 frames for buffer |
| Stability stuck at 75 | No vibration detected | Increase amplification or check ROI |
| Spiky waveform | Camera shake or noise | Stabilize camera, reduce amplification |
| Many frequency peaks | Broad vibration spectrum | Narrow frequency band to focus |
| Connection error | Backend not running | Start Flask backend server |

---

## Advanced Features

### Motion Magnification
Utilizes Eulerian Video Magnification (EVM) to amplify subtle motion:
- Extracts motion in spatial and temporal domains
- Applies selective amplification to frequency bands
- Reconstructs magnified video frames
- Makes invisible vibrations visible

### Anomaly Detection
Machine learning model continuously evaluates:
- Frequency content changes
- Amplitude distribution
- Spectral entropy
- Vibration pattern deviations
- Historical baseline comparison

---

## Data Export & Logging

### Current Session
- All metrics are displayed in real-time
- Frame count and timestamps available
- Metrics update every frame

### Future Enhancement
- Export waveform data as CSV
- Export spectral analysis as JSON
- Save magnified video clips
- Generate maintenance reports

---

## Maintenance Schedule Recommendation

Based on Stability Index:

| Status | Action | Frequency |
|--------|--------|-----------|
| **NORMAL** (Green) | Regular monitoring | Weekly |
| **WARNING** (Amber) | Increase monitoring | Every 2-3 days |
| **FAULT** (Red) | Emergency inspection | Immediately |

---

## Safety Considerations

1. **Never ignore FAULT status** - It indicates potential failure
2. **Use as supplementary tool** - Combine with vibration meters and thermography
3. **Maintain consistent lighting** - Affects motion detection accuracy
4. **Secure camera position** - Vibration can move camera, affecting readings
5. **Regular calibration** - Compare with reference measurements periodically

---

## System Requirements

- **Browser**: Modern HTML5 capable (Chrome, Edge, Firefox)
- **Backend**: Python Flask server with ML model
- **Camera**: Any USB or IP webcam (30 FPS recommended)
- **Internet**: Local LAN connection to backend
- **Resolution**: Recommended 640×480 or higher

---

## Settings Summary

| Setting | Default | Range | Impact |
|---------|---------|-------|--------|
| Amplification | 20× | 1-100× | Visibility of motion |
| Low Frequency | 0.4 Hz | 0-100 Hz | Analysis lower bound |
| High Frequency | 100 Hz | 0-150 Hz | Analysis upper bound |
| ROI Position | Center | Adjustable | Which part of object monitored |

---

## Version Information

- **Dashboard Version**: 1.0
- **Technology Stack**: React 18, Recharts, CSS3
- **Styling**: Professional dark theme with cyan accents
- **Target Users**: Maintenance engineers, operations, R&D teams
- **Use Cases**: Predictive maintenance, condition monitoring, bearing life estimation

---

## Support & Documentation

For issues or questions:
1. Check backend connection status (green badge)
2. Verify Camera ROI covers target area
3. Review Technical Specifications section
4. Check Performance Notes for common issues

---

**Last Updated**: January 2026
**System**: Webcam-Based Motion Magnification for Vibration Anomaly Detection
