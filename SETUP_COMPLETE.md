# Microanomalies Detection System - Setup Complete ✓

## Project Status
**The Microanomalies Detection System is fully completed and ready to use!**

All components have been successfully integrated:
- ✅ Backend Flask REST API (running on port 5000)
- ✅ Frontend React Dashboard (running on port 3000)
- ✅ Eulerian Video Magnification (EVM) pipeline
- ✅ Real-time anomaly detection
- ✅ Full system integration test passing

## Quick Start

### Prerequisites
- Python 3.13+
- Node.js 16+ (npm 11+)
- Webcam access
- Windows/Linux/macOS

### Terminal 1: Start Backend
```powershell
cd backend
.\venv\Scripts\activate  # or `source venv/bin/activate` on Linux/Mac
python app.py
```
Backend will start on `http://localhost:5000`

### Terminal 2: Start Frontend
```powershell
cd frontend
npm run dev
```
Frontend will start on `http://localhost:3000`

### Terminal 3 (Optional): Run Integration Tests
```powershell
python test_integration.py
```

## What's Working

### Backend API Endpoints
- `GET /api/health` - Health check
- `GET /api/config` - System configuration
- `GET /api/roi` - Get Region of Interest
- `POST /api/roi` - Update Region of Interest
- `POST /api/process_frame` - Process single frame
- `GET /api/statistics` - Pipeline statistics
- `POST /api/reset` - Reset pipeline state

### Frontend Features
- **Live Webcam Feed** - Real-time video capture with optional frame processing
- **ROI Selection** - Drag-and-drop region of interest adjustment
- **Magnified Feed** - Eulerian Video Magnification output
- **Real-time Dashboard** - Displays 16+ analyzed features
- **Anomaly Status** - Visual indicator (Normal/Abnormal) with stability index
- **Spectral Analysis** - Frequency domain visualization

## How It Works

1. **Frame Capture**: Webcam frames are captured at ~10 FPS
2. **EVM Processing**: Laplacian pyramids amplify subtle motions (3-30 Hz)
3. **Feature Extraction**: Temporal and frequency domain features extracted
4. **Anomaly Detection**: Rule-based detector computes stability index
5. **Visualization**: Dashboard displays results in real-time

## Key Technologies

- **Backend**: Flask, OpenCV, NumPy, SciPy, scikit-learn
- **Frontend**: React 18, Vite, Axios
- **Signal Processing**: Butterworth band-pass filters, FFT
- **Computer Vision**: Laplacian pyramids, optical flow

## Architecture

```
Webcam
  ↓
VideoCapture (Frontend)
  ↓
Flask Backend
  ├─ EVM Pipeline
  │  ├─ Laplacian Pyramids (spatial decomposition)
  │  └─ Temporal Filtering (band-pass 3-30 Hz)
  ├─ Motion Signal Extraction
  ├─ Feature Extraction
  │  └─ RMS, Variance, Dominant Frequency, Entropy
  └─ Anomaly Detection (Rule-based)
  ↓
Dashboard (Frontend)
  └─ Real-time metrics visualization
```

## Testing

### Automated Test
```bash
python test_integration.py
```

Expected output:
```
1. Testing backend health... ✓
2. Testing configuration endpoint... ✓
3. Testing ROI endpoint... ✓
4. Testing frame processing... ✓
5. Testing statistics endpoint... ✓
```

### Manual Testing
1. Open `http://localhost:3000` in browser
2. Allow webcam access
3. Observe real-time video and metrics
4. Drag ROI rectangle to select region of interest
5. Use controls to adjust parameters

## Configuration

Edit `backend/src/utils/config.py` to customize:
- EVM pyramid levels (default: 4)
- Amplification factor (default: 20x)
- Frequency range (default: 3-30 Hz)
- Anomaly thresholds

Edit `backend/src/utils/config.py` to customize:
- RMS reference baseline
- Frequency reference
- Normal/Abnormal threshold
- Detection sensitivity

## Project Structure

```
Microanomalies-Detection/
├── backend/
│   ├── app.py                  # Flask REST API
│   ├── requirements.txt         # Python dependencies
│   └── src/
│       ├── evm/               # Eulerian Video Magnification
│       ├── signal/            # Feature extraction
│       ├── anomaly/           # Anomaly detection
│       └── utils/             # Configuration & ROI utilities
├── frontend/
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── index.html            # HTML entry point
│   └── src/
│       ├── components/       # React components
│       ├── services/         # API client
│       ├── styles/           # CSS styling
│       └── pages/            # Page components
├── notebooks/                # Jupyter notebooks for exploration
├── data/
│   ├── models/               # ML models (if trained)
│   └── recordings/           # Video recordings
└── test_integration.py       # Integration tests
```

## Troubleshooting

### Backend won't start
- Ensure Python 3.13+ is installed: `python --version`
- Check dependencies: `pip install -r requirements.txt`
- Port 5000 might be in use: `netstat -ano | findstr 5000`

### Frontend won't start
- Ensure Node.js is installed: `node --version`
- Clear node_modules: `rm -r node_modules && npm install`
- Port 3000 might be in use: `netstat -ano | findstr 3000`

### Webcam not working
- Check browser permissions for webcam
- Try different browser
- Ensure `/dev/video0` exists on Linux
- Restart browser

### Backend health check fails
- Ensure Flask server is running
- Check for port conflicts
- Verify firewall settings

## Performance Notes

- Processing ~10 FPS on standard hardware
- Optimal for 320x240 frame size (configured)
- EVM amplification can be tuned for sensitivity
- 60-frame temporal buffer for stable feature extraction

## Next Steps

### For Production
1. Use production WSGI server (gunicorn/waitress) instead of Flask dev server
2. Build React frontend: `npm run build`
3. Serve static files from Flask
4. Add HTTPS/TLS support
5. Implement proper authentication

### For Enhancement
1. Train ML anomaly detector on domain data
2. Add multi-ROI support
3. Export video recordings with annotations
4. Add real-time alerting system
5. Implement data logging and analytics

## Documentation

- `README.md` - Full project documentation
- `QUICKSTART.md` - Operator's guide with examples
- `DEV_GUIDE.md` - Developer documentation
- `PROJECT_SUMMARY.md` - Project overview

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in Flask server output
3. Check browser console for frontend errors
4. Run `test_integration.py` to diagnose API issues

---

**System Status**: ✅ **FULLY OPERATIONAL**

Both backend and frontend services are running and integrated successfully!
