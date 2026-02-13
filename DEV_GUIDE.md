# Microanomalies Detection - Development Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (Chrome/Firefox)                     │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React Frontend (http://localhost:3000)                  │  │
│  │  ├─ VideoCapture: Canvas-based webcam capture            │  │
│  │  ├─ Dashboard: Real-time metrics visualization           │  │
│  │  └─ RoiSelector: ROI coordinate adjustment              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                    Fetch/POST (JSON)                            │
│                           ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                  HTTP/REST API (Port 5000)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│            Flask Backend (Python)                               │
│  http://localhost:5000                                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ API Routes (REST Endpoints)                             │   │
│  │  ├─ POST /api/process_frame                             │   │
│  │  ├─ GET/POST /api/roi                                  │   │
│  │  ├─ GET /api/statistics                                │   │
│  │  └─ POST /api/reset                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Processing Pipeline                                      │   │
│  │                                                           │   │
│  │  [Frame Input]                                           │   │
│  │       │                                                   │   │
│  │       ├─→ ROI Extraction                                 │   │
│  │       │                                                   │   │
│  │       └─→ EVM Pipeline                                   │   │
│  │            ├─ Laplacian Pyramid (4 levels)              │   │
│  │            ├─ Temporal Band-Pass Filter (3-30 Hz)       │   │
│  │            └─ Amplification & Reconstruction (20x)      │   │
│  │                                                           │   │
│  │       ├─→ Motion Signal Extraction                       │   │
│  │       │    └─ Intensity delta / Optical flow             │   │
│  │       │                                                   │   │
│  │       ├─→ Feature Extraction                             │   │
│  │       │    ├─ Time Domain: RMS, Variance, Peak-Peak     │   │
│  │       │    └─ Frequency: FFT, Spectral Entropy          │   │
│  │       │                                                   │   │
│  │       └─→ Anomaly Detection                              │   │
│  │            ├─ Rule-Based (primary)                       │   │
│  │            │   └─ Compute Stability Index (0-1)          │   │
│  │            └─ ML-Based (optional)                        │   │
│  │                └─ SVM/Isolation Forest score             │   │
│  │                                                           │   │
│  │  [Response: Status + Features + Index]                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Data & Models                                            │   │
│  │  ├─ data/models/anomaly_model.pkl (trained SVM)         │   │
│  │  └─ data/recordings/* (video clips)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Module Structure

### Core Module: `backend/src/evm/`

Implements Eulerian Video Magnification:

```python
EVMPipeline
├─ build_laplacian_pyramid()     # Spatial decomposition
├─ temporal_filtering()           # Band-pass filtering
├─ amplify_signal()              # Motion amplification
└─ reconstruct_image()           # Pyramid collapse
```

**Key Classes:**
- `EVMPipeline`: Main pipeline orchestrator
- `LaplacianPyramid`: Band-pass decomposition
- `GaussianPyramid`: Spatial pyramid
- `TemporalBandPassFilter`: Butterworth IIR filter
- `TemporalBuffer`: Circular frame buffer

### Signal Module: `backend/src/signal/`

Extracts motion and features:

```python
MotionSignalExtractor
├─ extract_signal()              # Frame-to-frame motion
├─ append_signal()               # Buffer management
└─ get_window()                  # Sliding window access

FeatureExtractor
├─ extract_time_features()       # RMS, variance, etc.
└─ extract_frequency_features()  # FFT, spectral analysis
```

### Anomaly Module: `backend/src/anomaly/`

Detects faults:

```python
RuleBasedDetector
├─ compute_anomaly_index()       # Scalar stability index
└─ update_baseline()             # Adapt to machine

MLAnomalyDetector
├─ load_model()                  # Load trained classifier
└─ predict()                     # Anomaly classification
```

## Data Flow

### Request Shape
```json
{
  "image": "base64_jpeg_frame",
  "roi": {
    "x": 100,
    "y": 100,
    "width": 300,
    "height": 200
  }
}
```

### Response Shape
```json
{
  "status": "success",
  "frame_index": 42,
  "timestamp": "2024-01-15T10:30:45.123Z",
  "magnified_frame": "base64_jpeg",
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
    "spectral_entropy": 4.567,
    "energy_low": 0.123,
    "energy_mid": 0.456,
    "energy_high": 0.421
  },
  "motion_signal": {
    "current_value": 0.123,
    "buffer_size": 60,
    "mean": 0.111,
    "std": 0.045
  }
}
```

## Development Workflow

### 1. Backend Development

```bash
cd backend

# Create environment
python -m venv venv
source venv/bin/activate

# Install in editable mode
pip install -e .
pip install -r requirements.txt

# Run with debugging
python app.py --debug

# Test module
pytest tests/test_evm.py -v
```

### 2. Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Testing Pipeline

```bash
# Backend unit tests
cd backend
pytest tests/

# Integration test
curl -X GET http://localhost:5000/api/health

# Frontend tests
cd frontend
npm test
```

## Performance Optimization

### Bottlenecks

1. **Laplacian Pyramid Computation**: O(N²) for image size N
2. **Temporal Filtering**: O(T) where T = buffer size
3. **FFT Computation**: O(T log T) worst case
4. **Base64 Encoding**: Network bandwidth

### Optimization Strategies

```python
# 1. Reduce pyramid levels
evm = EVMPipeline(num_levels=3)  # Default 4

# 2. Reduce amplification
evm = EVMPipeline(amplification=10)  # Default 20

# 3. Downsample input
frame = cv2.resize(frame, (320, 240))

# 4. Increase frame skip
# Process every Nth frame instead of all

# 5. Reduce image quality
quality = 60  # JPEG quality (1-100)

# 6. Use threading
# Process frames in background worker thread
```

### Profiling

```bash
# Profile Flask app
pip install flask-debugtoolbar

# Profile Python code
python -m cProfile -s cumtime app.py

# Monitor resources
python -m memory_profiler app.py
```

## Adding New Features

### Add Custom Anomaly Detector

```python
# backend/src/anomaly/custom_detector.py

class CustomDetector:
    def __init__(self):
        pass
    
    def detect(self, features):
        # Custom logic
        anomaly_index = compute_custom_index(features)
        status = "Normal" if anomaly_index > threshold else "Abnormal"
        return status, anomaly_index

# Update app.py
from src.anomaly.custom_detector import CustomDetector
pipeline_state.custom_detector = CustomDetector()
```

### Add Real-time Streaming (WebSocket)

```python
# backend/app.py
from flask_socketio import SocketIO, emit

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('frame')
def handle_frame(data):
    result = process_frame(data['image'])
    emit('result', result, broadcast=True)

# frontend/src/services/websocket.js
const socket = io('http://localhost:5000');
socket.on('result', (data) => {
  updateDashboard(data);
});
```

### Add Multi-ROI Tracking

```python
# Track multiple regions simultaneously
pipeline_state.rois = [
    {"id": "roi_1", "x": 100, "y": 100, "w": 200, "h": 200},
    {"id": "roi_2", "x": 400, "y": 100, "w": 200, "h": 200},
]

for roi in pipeline_state.rois:
    result = process_roi(frame, roi)
    results[roi['id']] = result
```

## Testing Strategy

### Unit Tests
```python
# test_evm.py
def test_pyramid_construction():
    frame = np.random.randn(256, 256).astype(np.float32)
    pyramid = LaplacianPyramid(levels=4)
    pyramid.build(frame)
    assert len(pyramid) == 4

def test_feature_extraction():
    signal = np.sin(np.linspace(0, 2*np.pi, 100))
    extractor = FeatureExtractor()
    features = extractor.extract_features(signal)
    assert 'rms' in features
```

### Integration Tests
```bash
# Start backend, send frame, verify response
python -m pytest tests/test_integration.py
```

### User Acceptance Tests
1. Visual inspection of magnified output
2. Feature correctness with synthetic signals
3. Anomaly detection accuracy on known faults

## Debugging Tips

### 1. Enable Detailed Logging
```python
# app.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 2. Inspect Intermediate Results
```python
# Print frame statistics
print(f"Frame shape: {roi_frame.shape}")
print(f"Frame range: [{roi_frame.min()}, {roi_frame.max()}]")
print(f"Features: {features}")
```

### 3. Visualize Data
```python
import matplotlib.pyplot as plt

# Plot magnified frame
plt.imshow(magnified_frame, cmap='gray')
plt.title('Magnified Output')
plt.show()

# Plot extracted features
plt.plot(motion_buffer)
plt.title('Motion Signal')
plt.show()
```

### 4. Check API Health
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/config
curl http://localhost:5000/api/statistics
```

## Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| Magnified frame all black | Low motion or wrong ROI | Increase amplification, adjust ROI |
| Slow processing | Large resolution | Reduce frame size, decrease pyramid levels |
| Wrong anomaly detection | Poor baseline | Collect more normal data, retrain |
| Webcam not detected | Browser permissions | Allow camera access in settings |
| Connection refused | Backend not running | `python backend/app.py` |

## Code Style

Follow PEP 8:
```bash
pip install black
black backend/src/
```

Format frontend:
```bash
npm run format
```

## Documentation

- **Code**: Docstrings in Google format
- **API**: OpenAPI/Swagger (optional enhancement)
- **Architecture**: This guide + inline comments
- **User**: QUICKSTART.md + README.md

---

**Happy developing! 🚀**
