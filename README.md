# Microanomaly Detection System

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-red.svg)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade full-stack web application for real-time machine micro-vibration analysis using **Eulerian Video Magnification (EVM)** and advanced anomaly detection.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📊 System Behavior](#-system-behavior)
- [🎨 UI Features](#-ui-features)
- [🔬 EVM Pipeline](#-evm-pipeline)
- [🤖 Anomaly Detection](#-anomaly-detection)
- [📡 REST API Endpoints](#-rest-api-endpoints)
- [🔧 Configuration](#-configuration)
- [📊 Data Collection & Training](#-data-collection--training)
- [🧪 Testing](#-testing)
- [📦 Deployment](#-deployment)
- [📈 Performance Notes](#-performance-notes)
- [🔍 Troubleshooting](#-troubleshooting)
- [📚 References](#-references)
- [👨‍💻 Tech Stack](#-️-tech-stack)
- [📝 License](#-license)
- [🤝 Contributing](#-contributing)
- [📧 Support](#-support)

## 🎯 Overview

This system amplifies subtle mechanical vibrations invisible to the naked eye using advanced signal processing techniques. It provides:

- **Eulerian Video Magnification**: Magnifies micro-motions (3-30 Hz) using spatial-temporal decomposition
- **Real-time Feature Extraction**: Extracts temporal and frequency-domain features (RMS, dominant frequency, spectral entropy)
- **Intelligent Anomaly Detection**: Rule-based + optional ML models to classify Normal/Abnormal states
- **Interactive Dashboard**: Futuristic 3D glassmorphism UI with real-time metrics and visualization

## 🏗️ Architecture

```
Microanomalies-Detection/
├── backend/                    # Flask REST API
│   ├── src/
│   │   ├── evm/               # Eulerian Video Magnification
│   │   │   ├── pyramid.py      # Gaussian/Laplacian pyramids
│   │   │   ├── temporal_filter.py  # Band-pass filters
│   │   │   └── evm_pipeline.py     # Main EVM pipeline
│   │   ├── signal/            # Signal processing
│   │   │   ├── motion_signal.py    # Motion extraction
│   │   │   └── features.py         # Feature extraction
│   │   ├── anomaly/           # Anomaly detection
│   │   │   ├── rules.py        # Rule-based detector
│   │   │   └── model.py        # ML-based detector
│   │   └── utils/             # Utilities
│   │       ├── config.py       # Configuration
│   │       └── roi.py          # ROI handling
│   ├── app.py                 # Flask application
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── VideoCapture.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── RoiSelector.jsx
│   │   ├── pages/             # Pages
│   │   │   └── Home.jsx
│   │   ├── services/          # API service
│   │   │   └── api.js
│   │   ├── styles/            # Stylesheets
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── data/
│   ├── recordings/            # Video recordings for analysis
│   └── models/                # Trained ML models
│
├── notebooks/
│   ├── exploration_evm.ipynb  # EVM exploration
│   └── feature_analysis.ipynb # Feature analysis
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- Modern web browser with webcam support

### Backend Setup (Start First!)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

✅ Backend runs on **`http://localhost:5000`**

> **IMPORTANT**: Start the backend FIRST before starting the frontend. The frontend cannot connect without it.

### Frontend Setup (Start Second!)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

✅ Frontend runs on **`http://localhost:5173`** (Vite default)

## 📊 System Behavior

### Detection Features

The system analyzes micro-vibrations and extracts features:

#### Time Domain
- **RMS Motion**: Root Mean Square of motion signal
- **Variance**: Signal variability
- **Peak-to-Peak**: Max-Min amplitude
- **Mean**: Average motion value

#### Frequency Domain
- **Dominant Frequency**: Primary vibration frequency (Hz)
- **Spectral Entropy**: Frequency content randomness
- **Energy Distribution**: Power in frequency bands (0-5, 5-20, 20-50 Hz)

### Anomaly Index

Real-time stability index (0.0 to 1.0):
- **1.0**: Perfect stability (Normal)
- **0.6-1.0**: Normal operation
- **0.0-0.6**: Anomalous behavior (Abnormal)

### Expected Responses

The system responds to:
- **Loosened Bolts**: Frequency shift + increased variance
- **Imbalance**: Increased RMS motion + harmonic content
- **Speed Change**: Frequency shift proportional to speed change
- **Bearing Degradation**: Spectral entropy increase + new frequency spikes

## 🎨 UI Features

### Futuristic Glassmorphism Design
- Dark navy and slate color palette (`#0B1020`, `#111827`)
- Electric blue accents (`#2563EB`)
- Neon teal for normal status (`#10B981`)
- Glass effect with backdrop blur and subtle shadows
- Animated grid background
- Responsive layout

### Real-time Dashboard Components

1. **Video Feeds**
   - Original webcam with draggable ROI selection
   - Magnified EVM output visualization

2. **Status Indicators**
   - Large NORMAL/ABNORMAL display with color coding
   - Stability Index gauge (0-100%)

3. **Real-time Metrics**
   - Dominant frequency (Hz)
   - RMS motion value
   - Peak-to-peak amplitude
   - Variance and spectral entropy
   - Motion energy
   - Spectral energy distribution

4. **Controls**
   - ROI coordinates adjustment (drag or manual input)
   - System reset button
   - Health status indicator

## 🔬 EVM Pipeline

### 1. Spatial Decomposition
- Builds Laplacian pyramid (4 levels default)
- Isolates frequency bands at different scales

### 2. Temporal Filtering
- Butterworth band-pass filter (3-30 Hz)
- Filters each pixel's time series independently
- Circular buffer (60 frames) for temporal history

### 3. Amplification & Reconstruction
- Amplifies motion by factor (20x default)
- Reconstructs image from modified pyramid
- Maintains image realism

## 🤖 Anomaly Detection

### Rule-Based Detector (Primary)

```python
# Deviations penalize anomaly index
index = 1.0
- penalty_rms (30%)
- penalty_frequency (30%)
- penalty_variance (20%)
- penalty_entropy (20%)

status = "Normal" if index > 0.6 else "Abnormal"
```

### ML-Based Detector (Optional)

Supports trained models via scikit-learn:
- One-Class SVM for anomaly detection
- Binary classifiers (Normal/Abnormal)
- Model scoring and prediction

## 📡 REST API Endpoints

```
GET /api/health               # Health check
GET /api/config               # Get configuration
GET /api/roi                  # Get current ROI
POST /api/roi                 # Update ROI
POST /api/process_frame       # Process video frame
GET /api/statistics           # Get pipeline stats
POST /api/reset               # Reset pipeline
```

### Frame Processing Request/Response

**Request:**
```json
{
  "image": "base64_encoded_jpeg",
  "roi": {"x": 100, "y": 100, "width": 300, "height": 200}
}
```

**Response:**
```json
{
  "status": "success",
  "frame_index": 42,
  "timestamp": "2024-01-15T10:30:45.123Z",
  "magnified_frame": "base64_jpeg",
  "roi_frame": "base64_jpeg",
  "anomaly_detection": {
    "status": "Normal",
    "anomaly_index": 0.82,
    "is_normal": true
  },
  "features": {
    "rms": 0.456,
    "dominant_frequency": 12.5,
    "variance": 0.234,
    "peak_to_peak": 1.234,
    "spectral_entropy": 4.567
  },
  "motion_signal": {
    "current_value": 0.123,
    "buffer_size": 60,
    "mean": 0.111,
    "std": 0.045
  }
}
```

## 🔧 Configuration

Edit `backend/src/utils/config.py`:

```python
EVM_CONFIG = {
    "num_levels": 4,              # Pyramid levels
    "amplification_factor": 20,   # Magnification amount
    "cutoff_freq_low": 3,         # Hz (low band-pass cutoff)
    "cutoff_freq_high": 30,       # Hz (high band-pass cutoff)
    "sampling_rate": 30,          # FPS
    "temporal_buffer_size": 60,   # frames
}

ANOMALY_CONFIG = {
    "rms_reference": 0.5,         # Normal baseline
    "rms_range": 2.0,
    "frequency_reference": 10.0,  # Hz
    "frequency_range": 5.0,
    "normal_threshold": 0.6,      # Anomaly index threshold
}
```

## 📊 Data Collection & Training

### Jupyter Notebooks

#### `exploration_evm.ipynb`
- Load test video or webcam
- Visualize EVM effects at different amplifications
- Understand pyramid decomposition

#### `feature_analysis.ipynb`
- Extract features from recordings
- Analyze feature distributions for normal/abnormal states
- Design decision thresholds

### ML Model Training

```bash
python backend/src/anomaly/train_model.py \
  --data-dir data/recordings \
  --model-type svm \
  --output data/models/anomaly_model.pkl
```

## 🧪 Testing

### Manual Testing

1. **Terminal 1** - Start backend: `cd backend && python app.py`
   - Wait for: "Running on http://localhost:5000"
2. **Terminal 2** - Start frontend: `cd frontend && npm run dev`
   - Wait for: "Local: http://localhost:5173"
3. **Browser** - Open: `http://localhost:5173`
   - Check green status badge in header = Backend connected ✓
4. Test with:
   - Normal operation (minimal vibration)
   - Artificially induced imbalance
   - Speed variations
   - Loosened components

### Unit Tests

```bash
cd backend
python -m pytest tests/ -v
```

## 📦 Deployment

### Local Machine

```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2: Frontend
cd frontend
npm install
npm run build
npm run preview
```

### Docker (Optional)

```bash
# Build and run with docker-compose
docker-compose up --build
```

### Production Deployment

```bash
# Backend: Use gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app

# Frontend: Build and serve static files
cd frontend
npm run build
# Serve frontend/dist via nginx or Flask static route
```

## 📈 Performance Notes

- **Frame Processing**: ~100-150ms per frame (640x480, 4 EVM levels)
- **Memory**: ~300-500 MB for typical operation
- **CPU**: Moderate (suitable for modern laptops)
- **Network**: ~50-100KB per frame (base64 JPEG)

Optimization tips:
- Reduce EVM levels (num_levels=3)
- Lower video resolution (480x360)
- Increase frame capture interval (200-300ms)
- Use HTTP compression

## 🔍 Troubleshooting

### "Backend Disconnected" Error in Dashboard
```
Error: Cannot connect to backend. Make sure Flask server is running.
```
**Solution**:
1. Start Flask backend FIRST: `cd backend && python app.py`
2. Wait for message: "Running on http://localhost:5000"
3. Then start frontend: `cd frontend && npm run dev`
4. Check green status badge appears in dashboard header

### Webcam not detected
```javascript
// Check browser console for getUserMedia errors
// Ensure HTTPS or localhost for camera access
```

### Backend connection failed
- Verify backend is running on port 5000
- Check: `http://localhost:5000/api/health` in browser
- Should return: `{"status":"healthy"}`
- If not, restart backend: `python backend/app.py`

### Frontend not loading
- Ensure you're on correct port: `http://localhost:5173`
- NOT 3000 or 5000
- Clear browser cache (Ctrl+Shift+Delete)
- Restart frontend: `npm run dev`

### Slow processing
- Reduce image resolution
- Decrease amplification factor
- Lower EVM pyramid levels
- Increase frame skip (process every Nth frame)

### Inaccurate anomaly detection
- Record normal operation samples
- Train ML model: `python -m src.anomaly.model_train`
- Adjust rule thresholds in config.py

## 📚 References

- **EVM**: [Visual Microphone](https://people.csail.mit.edu/mrub/papers/VisualMicrophone_CACM2012.pdf) - MIT CSAIL
- **Signal Processing**: SciPy documentation
- **Anomaly Detection**: Scikit-learn documentation

## 👨‍💻 Tech Stack

### Backend
- **Framework**: Flask
- **Computer Vision**: OpenCV (cv2)
- **Numerical**: NumPy, SciPy
- **ML**: Scikit-learn
- **API**: REST with JSON

### Frontend
- **UI Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3 (Glassmorphism)

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- WebSocket real-time streaming
- Advanced ML models (LSTM, GRU)
- Multi-ROI tracking
- Thermal imaging integration
- 3D visualization
- Mobile app support

## 📧 Support

For issues or questions, create a GitHub issue or contact the development team.

---

**Built with ❤️ for precision micro-vibration analysis**