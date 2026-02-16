# Professional Dashboard - Setup & Installation Guide

## Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Python Flask Backend**: Running and healthy
- **Modern Browser**: Chrome, Edge, or Firefox (latest versions)
- **Camera/Webcam**: USB or IP camera for video capture

---

## Installation Steps

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

This will install:
- `react@18.2.0` - UI framework
- `react-dom@18.2.0` - React DOM rendering
- `axios@1.6.0` - HTTP client
- `recharts@2.10.0` - Charting library
- `vite@5.0.0` - Build tool
- `@vitejs/plugin-react` - Vite React plugin

### 2. Verify Installation

```bash
npm list react react-dom axios recharts vite
```

Expected output:
```
├── axios@1.6.0
├── react@18.2.0
├── react-dom@18.2.0
├── recharts@2.10.0
└── vite@5.0.0
```

### 3. Configure Backend Connection

Edit `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = "http://localhost:5000"; // Change if needed
// OR for remote backend:
const API_BASE_URL = "http://your-server-ip:5000";
```

---

## Running the Dashboard

### Development Mode

```bash
cd frontend
npm run dev
```

Output:
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Visit `http://localhost:5173/` in your browser.

### Production Build

```bash
cd frontend
npm run build
```

Creates optimized build in `dist/` folder:
- Minified JavaScript
- Compressed assets
- Optimized chunks

### Preview Production Build

```bash
npm run preview
```

---

## Troubleshooting Installation

### Issue: Cannot find module 'recharts'

**Solution**:
```bash
npm install recharts@2.10.0 --save
```

### Issue: VITE build error

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Backend connection fails

**Verify**:
1. Flask server is running: `python backend/app.py`
2. Backend URL is correct in `api.js`
3. No CORS errors in browser console
4. Firewall allows connection

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProfessionalDashboard.jsx      (Main container)
│   │   ├── StabilityGauge.jsx             (Status gauge)
│   │   ├── WaveformChart.jsx              (Time-domain chart)
│   │   ├── SpectrumAnalyzer.jsx           (Frequency chart)
│   │   ├── VideoCapture.jsx               (Video input)
│   │   ├── Dashboard.jsx                  (Legacy - can delete)
│   │   ├── RoiSelector.jsx                (Legacy - can delete)
│   │   └── ... other components
│   ├── pages/
│   │   ├── Home.jsx                       (Main page)
│   │   └── ... other pages
│   ├── services/
│   │   └── api.js                         (Backend API calls)
│   ├── styles/
│   │   ├── index.css                      (Global styles)
│   │   ├── dashboard.css                  (Dashboard styles - NEW)
│   │   └── ... other stylesheets
│   ├── App.jsx                            (Main app component)
│   └── main.jsx                           (Entry point)
├── index.html                             (HTML template)
├── vite.config.js                         (Vite configuration)
├── package.json                           (Dependencies)
└── package-lock.json                      (Lock file)
```

---

## File Modifications Summary

### New Files Created
1. ✅ `src/components/ProfessionalDashboard.jsx` - Main dashboard
2. ✅ `src/components/StabilityGauge.jsx` - Status gauge
3. ✅ `src/components/WaveformChart.jsx` - Time-domain chart
4. ✅ `src/components/SpectrumAnalyzer.jsx` - Frequency chart
5. ✅ `src/styles/dashboard.css` - Professional styling
6. ✅ `DASHBOARD_USER_GUIDE.md` - User documentation
7. ✅ `TECHNICAL_DASHBOARD_GUIDE.md` - Technical guide

### Modified Files
1. ✅ `package.json` - Added recharts dependency
2. ✅ `src/App.jsx` - Imported dashboard.css
3. ✅ `src/pages/Home.jsx` - Complete redesign with ProfessionalDashboard

### Files to Remove (Optional)
- `src/components/Dashboard.jsx` - Legacy component
- `src/components/RoiSelector.jsx` - Legacy component

---

## CSS Architecture

### Main Stylesheet: `dashboard.css`
Organized sections:
```css
/* ==================== PROFESSIONAL DASHBOARD ==================== */
.professional-dashboard { }

/* ==================== VIDEO SECTION ==================== */
.video-section { }
.video-panels { }
.video-panel { }

/* ==================== CHARTS SECTION ==================== */
.charts-section { }
.chart-container { }

/* ==================== WAVEFORM CHART ==================== */
.waveform-container { }
.waveform-chart { }

/* ==================== SPECTRUM ANALYZER ==================== */
.spectrum-container { }
.spectrum-chart { }

/* ==================== STABILITY GAUGE ==================== */
.stability-gauge-container { }
.gauge-svg { }

/* ==================== METRICS GRID ==================== */
.metrics-grid { }
.metric-card { }

/* ==================== CONTROLS & SETTINGS ==================== */
.control-panel { }
.slider-container { }

/* ==================== RESPONSIVE DESIGN ==================== */
@media (max-width: 1600px) { }
@media (max-width: 1200px) { }
@media (max-width: 768px) { }
```

### CSS Custom Properties Used
```css
:root {
  /* Colors */
  --color-bg-dark: #0b0f1a;
  --color-accent-cyan: #00e5ff;
  --color-status-normal: #2ecc71;
  --color-status-warning: #ffb300;
  --color-status-fault: #ff3b30;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## API Service Configuration

File: `frontend/src/services/api.js`

Currently required methods:
```javascript
apiService.health()                    // Get backend status
apiService.processFrame(frameData, roi) // Process video frame
apiService.resetPipeline()             // Reset all data
apiService.updateROI(roi)              // Update region of interest
apiService.updateAmplification(value)  // Update amplification factor
apiService.updateFrequencyBand(band)   // Update frequency band
```

---

## Development Workflow

### 1. Start Backend
```bash
cd backend
python app.py
# Backend should be running on http://localhost:5000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Frontend should be running on http://localhost:5173
```

### 3. Access Dashboard
Open `http://localhost:5173/` in browser

### 4. Check Browser Console
Monitor for errors and API calls:
```javascript
// Example API call in console
const response = await fetch('http://localhost:5000/api/health');
const data = await response.json();
console.log(data); // Should show {status: "healthy"}
```

---

## Performance Tuning

### Optimize Chart Rendering
```javascript
// In WaveformChart.jsx - Disable animations for real-time data
<Line
  isAnimationActive={false}  // Disable smooth animation
  dot={false}                // Hide individual data points
  strokeWidth={1.5}          // Thin line
/>

// Limit data points
const chartData = data.slice(-200); // Keep only last 200 samples
```

### Reduce Re-renders
```javascript
// Use useMemo to prevent unnecessary transformations
const chartData = useMemo(() => {
  return transformData(data);
}, [data]); // Only recompute when data changes
```

### Memory Management
```javascript
// Keep history bounded
const limited = [...prev, ...new].slice(-500);
// Remove old entries to prevent memory leak
```

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to "Performance" tab
3. Record for 10 seconds while monitoring
4. Check:
   - Main thread usage
   - Frame rate (should be >30 FPS)
   - Memory growth

---

## Testing the Dashboard

### Manual Testing Checklist
- [ ] Backend connection indicator shows green
- [ ] Video panels display video feeds
- [ ] ROI overlay is visible in raw feed
- [ ] Waveform chart updates in real-time
- [ ] Spectrum chart shows frequency peaks
- [ ] Stability gauge needle moves smoothly
- [ ] All metrics display correct values
- [ ] Amplification slider changes magnified output
- [ ] Frequency band inputs adjust spectrum view
- [ ] Start/Stop monitoring button toggles state
- [ ] Reset system clears all data
- [ ] Mobile responsive layout works
- [ ] No console errors

### Automated Testing (Optional)
```bash
# Install testing library
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Create test file: src/components/ProfessionalDashboard.test.jsx
# Run tests:
npm test
```

---

## Common Error Messages & Solutions

### Error: "Cannot GET /"
**Cause**: Frontend not running
**Solution**:
```bash
cd frontend
npm run dev
```

### Error: "Failed to fetch from backend"
**Cause**: Backend not running or wrong URL
**Solution**:
1. Check backend running: `http://localhost:5000/api/health`
2. Verify URL in `api.js`
3. Check CORS headers in backend

### Error: "Recharts is not defined"
**Cause**: Missing dependency
**Solution**:
```bash
npm install recharts@2.10.0 --save
```

### Error: "Module not found: 'dashboard.css'"
**Cause**: CSS file not imported
**Solution**: Check `src/App.jsx` imports both stylesheets:
```javascript
import "./styles/index.css";
import "./styles/dashboard.css";
```

### Error: Blank dashboard with no data
**Cause**: Backend not returning data
**Solution**:
1. Check `processFrame` returns correct structure
2. Verify image encoding (base64 URLs)
3. Check feature extraction working

---

## Deployment Guide

### Local Network Deployment
```bash
# Build frontend
npm run build

# Serve from backend
npm run serve
# or use Python: python -m http.server 8000 -d dist

# Access from other machine
http://your-machine-ip:8000
```

### Docker Deployment (Optional)
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Build and run:
```bash
docker build -t microanomalies-frontend .
docker run -p 3000:3000 microanomalies-frontend
```

---

## Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `DASHBOARD_USER_GUIDE.md` | How to use dashboard | End users, engineers |
| `TECHNICAL_DASHBOARD_GUIDE.md` | Architecture & customization | Developers |
| `SETUP_COMPLETE.md` | Setup checklist | Project managers |
| This file | Installation & troubleshooting | Developers |

---

## Support & Debugging

### Enable Debug Logging
Edit `frontend/src/pages/Home.jsx`:
```javascript
const handleFrameCapture = useCallback(async (frameData) => {
  console.log("Frame captured", frameData.length);
  console.log("Processing with ROI:", roi);
  // ... rest of function
}, [...]);
```

### Network Tab Inspection
1. Open DevTools (F12)
2. Go to Network tab
3. Process frame
4. Look for `/api/process` request
5. Check:
   - Status code (should be 200)
   - Response size
   - Round-trip time
   - Response payload

### React DevTools
1. Install React DevTools extension
2. Browse component tree:
   - Home (state)
   - ProfessionalDashboard (props)
   - WaveformChart (data)
   - SpectrumAnalyzer (data)
   - StabilityGauge (value)

---

## Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Verify backend connection
3. ✅ Start frontend (`npm run dev`)
4. ✅ Test with video feed
5. ✅ Adjust colors/layout as needed
6. ✅ Deploy to production
7. ✅ Monitor performance
8. ✅ Gather user feedback

---

## Quick Reference Commands

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Serve production build
npm run serve

# Check installed packages
npm list

# Update packages
npm update

# Check for vulnerabilities
npm audit
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial professional dashboard release |

---

**Last Updated**: February 2026
**Maintained By**: Development Team
**Support Email**: dev@example.com

---

## Appendix: File Checklist

After installation, verify these files exist:

```
✅ frontend/src/components/ProfessionalDashboard.jsx
✅ frontend/src/components/StabilityGauge.jsx
✅ frontend/src/components/WaveformChart.jsx
✅ frontend/src/components/SpectrumAnalyzer.jsx
✅ frontend/src/styles/dashboard.css
✅ frontend/src/pages/Home.jsx (modified)
✅ frontend/src/App.jsx (modified)
✅ frontend/package.json (modified - recharts added)
✅ DASHBOARD_USER_GUIDE.md
✅ TECHNICAL_DASHBOARD_GUIDE.md
✅ This file
```

If any files are missing, refer to the technical guide or contact support.
