# Technology Stack & Architecture Documentation

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT STRUCTURE                         │
└─────────────────────────────────────────────────────────────────┘

    User Browser (Client)
           │
           │ HTTPS / HTTP
           │
    ┌──────────────────────────────────────────────┐
    │           VERCEL CDN (Frontend)              │
    ├──────────────────────────────────────────────┤
    │  • React 18 + Vite                           │
    │  • Recharts Dashboard                        │
    │  • Real-time WebCanvas Streaming             │
    │  • REST API Client                           │
    │  • Responsive UI Components                  │
    │  • Performance Monitoring                    │
    └──────────────────────────────────────────────┘
           │
           │ REST API (JSON)
           │
    ┌──────────────────────────────────────────────┐
    │  HUGGING FACE SPACES (Backend)               │
    ├──────────────────────────────────────────────┤
    │  • Flask REST Server                         │
    │  • CORS-enabled                              │
    │  • Authentication-ready                      │
    │  • Runs in Docker Container                  │
    │  • Auto-restart on failure                   │
    └──────────────────────────────────────────────┘
           │
           └──────────────────────────┐
                                      │
                    ┌─────────────────┴──────────────────┐
                    │                                    │
            ┌───────────────────┐            ┌──────────────────┐
            │  EVM Pipeline     │            │  ML Detector     │
            │  (Processing)     │            │  (Inference)     │
            └───────────────────┘            └──────────────────┘
                    │
            ┌───────┴───────────────────────┐
            │                               │
    ┌──────────────────┐          ┌─────────────────┐
    │  Rule Detector   │          │ Data Pipeline   │
    │  (Thresholds)    │          │ (Telemetry)     │
    └──────────────────┘          └─────────────────┘
```

---

## 📦 Complete Technology Stack

### Frontend Stack

#### Core Framework
| Component | Tech | Version | Purpose |
|-----------|------|---------|---------|
| View Layer | React | 18.2.0 | Component-based UI |
| Build Tool | Vite | 5.0.0 | Lightning-fast dev server & bundler |
| Styling | CSS3 + Modules | Latest | Responsive design, component styles |
| HTTP Client | Axios | 1.6.0 | API requests with interceptors |
| Charts | Recharts | 2.10.0 | Real-time data visualization |
| Icons | React Icons | Latest (optional) | UI icons and symbols |

#### Development Tools
- **Node.js**: 18+ (runtime)
- **npm**: 9+ (package manager)
- **Vite Config**: React plugin, dev proxy, build optimization
- **ESLint**: Code quality (optional)
- **Prettier**: Code formatting (optional)

#### Build Output
```
dist/
├── index.html           # Main entry point
├── assets/
│   ├── index-[hash].js  # Main bundle
│   └── index-[hash].css # Stylesheet
└── manifest.json        # Vite manifest
```

#### Key Frontend Features
- ✅ Responsive dashboard (desktop, tablet optimized)
- ✅ Real-time video stream rendering
- ✅ Live data visualization (waveforms, spectrograms)
- ✅ Interactive ROI selector
- ✅ Performance monitoring (FPS, latency)
- ✅ Error boundaries and fallback UI
- ✅ Graceful backend disconnect handling

---

### Backend Stack

#### Web Framework
| Component | Tech | Version | Purpose |
|-----------|------|---------|---------|
| Web Server | Flask | 3.0.0+ | REST API framework |
| CORS | Flask-CORS | 4.0.0+ | Cross-origin request handling |
| WSGI | Gunicorn | 23.0.0+ | Production application server |
| Python | Python | 3.10+ | Runtime environment |

#### Data Processing
| Component | Tech | Version | Purpose |
|-----------|------|---------|---------|
| Image Processing | OpenCV | 4.8.0+ | Video frame handling |
| Numerical Computing | NumPy | 1.26.0+ | Array operations, math |
| Signal Processing | SciPy | 1.14.0+ | Temporal filtering, FFT |
| Machine Learning | scikit-learn | 1.4.0+ | Model training/inference |
| Image IO | Pillow | 10.0.0+ | Image encoding/decoding |
| Config Management | python-dotenv | 1.0.0+ | Environment variables |

#### API Endpoints (13 total)

**Health & Configuration**
```
GET  /api/health           # Health check, returns {"status": "healthy"}
GET  /api/config           # Full system configuration
```

**ROI Management**
```
GET  /api/roi              # Get current Region of Interest
POST /api/roi              # Update ROI (x, y, width, height)
```

**Frame Processing**
```
POST /api/process_frame    # Process single base64 frame
POST /api/reset            # Reset pipeline state
```

**Runtime Parameters**
```
GET  /api/runtime/evm      # Get EVM parameters
POST /api/runtime/evm      # Update EVM settings
```

**Monitoring & Statistics**
```
GET  /api/statistics       # Frame-level statistics
GET  /api/monitoring/summary    # Overall monitoring stats
GET  /api/monitoring/history    # Historical data points
GET  /api/monitoring/window     # Time-windowed aggregate
GET  /api/monitoring/aggregate  # Long-term aggregate stats
```

#### Core Python Modules

```
backend/
├── app.py                      # Main Flask application
├── src/
│   ├── anomaly/
│   │   ├── model.py           # ML-based detector
│   │   ├── rules.py           # Rule-based detector
│   │   └── train_model.py     # Training pipeline
│   ├── evm/
│   │   ├── evm_pipeline.py    # Euler Video Magnification
│   │   ├── pyramid.py         # Laplacian/Gaussian pyramids
│   │   └── temporal_filter.py # Butterworth filters
│   ├── signal/
│   │   ├── motion_signal.py   # Signal extraction
│   │   └── features.py        # Feature engineering
│   ├── monitoring/
│   │   └── telemetry.py       # Data collection/storage
│   └── utils/
│       ├── config.py          # Configuration loading
│       ├── advanced_config.py # Advanced config management
│       ├── error_handlers.py  # Logging & error handling
│       └── roi.py             # ROI manipulation
└── requirements.txt           # Dependency list
```

---

## 🔄 Data Flow & Processing Pipeline

### Request-Response Cycle
```
Browser                          Backend
   │                               │
   ├─ POST /api/process_frame ───► │
   │  [Frame as base64 JPEG]        │
   │                                ├─► Decode frame
   │                                ├─► Apply ROI
   │                                ├─► EVM processing
   │                                ├─► Feature extraction
   │                                ├─► Anomaly detection
   │                                ├─► Store telemetry
   │◄─ Response JSON ───────────────┤
   │ {                              │
   │   "roi_frame": "base64",      │
   │   "magnified_frame": "base64",│
   │   "features": {...},          │
   │   "anomaly_detection": {...}, │
   │   "motion_signal": [...],     │
   │   "processing_time_ms": N     │
   │ }                              │
   │                                │
   └─ Render/Update UI ────────────►│
```

### Processing Pipeline (per frame)
```
Input Frame (640x480 JPEG)
    │
    ├─► Decode → CV2 BGR array
    │
    ├─► Apply ROI Crop → extract 300x200 region
    │
    ├─► EVM Pipeline
    │   ├─► Build Laplacian pyramid (4 levels)
    │   ├─► Apply Butterworth filter
    │   ├─► Amplify motion (20x default)
    │   └─► Collapse pyramid → Magnified frame
    │
    ├─► Signal Extraction
    │   ├─► Compute optical flow / motion vectors
    │   ├─► Extract principal motion direction
    │   └─► Generate time-series signal
    │
    ├─► Feature Extraction
    │   ├─► RMS, Peak-to-peak, Mean
    │   ├─► Spectral analysis (FFT)
    │   ├─► Dominant frequency, Spectral entropy
    │   └─► Variance, Energy bands
    │
    ├─► Anomaly Detection (Dual-stage)
    │   ├─► Rule-based:
    │   │   ├─► Check RMS threshold
    │   │   ├─► Check frequency band
    │   │   └─► Check deviation from baseline
    │   │
    │   └─► ML-based (if model loaded):
    │       ├─► Extract feature vector
    │       ├─► Run sklearn model
    │       └─► Get confidence score
    │
    ├─► Telemetry Storage
    │   ├─► Store raw signal (last 50K samples)
    │   ├─► Store aggregates (hourly, daily)
    │   └─► Update statistics
    │
    └─► Output Response
        └─► Base64 encode frames
        └─► JSON package all results
```

---

## 🌐 Deployment Models

### Model 1: Split Deployment (Recommended for Free Tier)
```
VERCEL FRONTEND              HUGGING FACE BACKEND
├─ CDN-accelerated           ├─ Docker container
├─ Static site hosting       ├─ GPU optional
├─ Auto-scaling              ├─ Auto-restart
└─ HTTPS included            └─ HTTPS included

     ↔️ REST API (HTTPS)
     ↔️ Cross-origin calls
     ↔️ JSON payloads
```

**Pros**: Free tier available, scalable frontend, simple
**Cons**: Cold starts on free HF tier (~30s), separate deployments

### Model 2: Single-Server Deployment
```
SINGLE SERVER / CONTAINER
├─ One Docker image
├─ Flask serves both
├─ Static assets in /static
├─ Single origin (no CORS needed)
└─ All services co-located

Deployment options:
├─ AWS EC2 / ECS
├─ DigitalOcean App Platform
├─ Railway
├─ Render
├─ Heroku (Docker)
└─ Azure App Service
```

**Pros**: No CORS complexity, better perf, single deployment
**Cons**: Higher cost ($5-10/month min), scaling more complex

---

## 🔐 Security & CORS

### CORS Configuration

**Backend (Flask)**
```python
CORS(app, resources={r"/api/*": {
    "origins": ["https://your-vercel-endpoint.vercel.app"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"],
}})
```

**Environment Variable**
```bash
# Development
CORS_ORIGINS=*

# Production with Vercel
CORS_ORIGINS=https://your-project.vercel.app

# Multiple domains
CORS_ORIGINS=https://your-project.vercel.app,https://alt-domain.com
```

### Frontend API Client
```javascript
// Intelligent fallback handling
const API_CANDIDATES = [
  "/api",                          // Same-origin (Vite proxy / Flask)
  "http://127.0.0.1:5000/api",    // Local dev fallback
  "http://localhost:5000/api",    // Local alt fallback
  configuredApiBase,              // VITE_API_BASE_URL env var
];

// Automatically tries each until one responds with valid JSON
```

---

## 📊 Data Types & API Contracts

### Frame Processing Request
```json
{
  "image": "base64_encoded_jpeg_string",
  "roi": {
    "x": 100,
    "y": 100,
    "width": 300,
    "height": 200
  }
}
```

### Frame Processing Response
```json
{
  "roi_frame": "base64_encoded_image",
  "magnified_frame": "base64_encoded_image",
  "features": {
    "dominant_frequency": 8.5,
    "spectral_entropy": 2.1,
    "variance": 34.2,
    "rms": 45.6,
    "peak_to_peak": 120.0,
    "mean": 2.3
  },
  "anomaly_detection": {
    "is_normal": true,
    "anomaly_index": 0.3,
    "status": "NORMAL",
    "confidence": 0.95
  },
  "motion_signal": [0.1, 0.2, 0.35, ...],
  "processing_time_ms": 45,
  "frame_index": 1234
}
```

---

## 🚀 Performance Metrics

### Frontend Performance
- **Build size**: ~150 KB (gzipped)
- **Initial load**: 2-3 seconds (Vercel)
- **Dashboard FPS**: 15-20 FPS (depends on backend)
- **API latency**: 200-500 ms per frame

### Backend Performance
- **Frame processing**: 30-100 ms (depending on ROI size)
- **EVM computation**: 20-50 ms
- **Feature extraction**: 5-15 ms
- **API response**: 50-200 ms
- **Throughput**: ~10-30 FPS sustained

### Memory Usage
- **Frontend**: ~50-100 MB (browser)
- **Backend**: ~200-400 MB (Python process)
- **Telemetry storage**: ~50 MB (for 50K samples)

---

## 🔧 Configuration Reference

### Frontend Configuration
```javascript
// vite.config.js
{
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "../backend/static",
    emptyOutDir: true,
  }
}
```

### Backend Configuration
```python
# EVM Settings
EVM_LEVELS = 4                    # Pyramid depth
EVM_AMPLIFICATION = 20.0          # Motion magnification factor
EVM_FREQ_LOW = 3.0                # Hz - lower cutoff
EVM_FREQ_HIGH = 30.0              # Hz - upper cutoff
EVM_SAMPLING_RATE = 30            # FPS input

# API Limits
API_MAX_FRAME_SIZE = 10           # MB
API_COMPRESSION_QUALITY = 85      # JPEG quality (1-100)
API_RATE_LIMIT = 60               # requests per minute
```

---

## 📚 Dependencies by Category

### Image & Video Processing
- `opencv-python` - Computer vision
- `pillow` - Image format handling
- `numpy` - Numerical operations

### Signal & Data Processing
- `scipy` - Advanced signal processing
- `scikit-learn` - ML models

### Web & API
- `flask` - Web framework
- `flask-cors` - Cross-origin support
- `gunicorn` - Production server

### Configuration & Utilities
- `python-dotenv` - Environment variable management

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Backend runs on port 5000
- [ ] Frontend runs on port 3000
- [ ] `/api/health` returns JSON
- [ ] `/api/process_frame` accepts frames
- [ ] Charts update in real-time
- [ ] Camera permission works
- [ ] No console errors
- [ ] Network tab shows valid responses

### Production Testing
- [ ] Vercel build succeeds
- [ ] Hugging Face Space builds successfully
- [ ] VITE_API_BASE_URL environment variable set
- [ ] CORS settings allow Vercel domain
- [ ] Health check endpoint works
- [ ] Frame processing works end-to-end
- [ ] Dashboard renders correctly
- [ ] Performance acceptable (FPS > 10)

---

## 📖 Resource Links

### Documentation
- Flask: https://flask.palletsprojects.com/
- Vite: https://vitejs.dev/
- React: https://react.dev/
- OpenCV: https://docs.opencv.org/
- NumPy: https://numpy.org/doc/
- SciPy: https://docs.scipy.org/

### Deployment
- Vercel: https://vercel.com/docs
- Hugging Face Spaces: https://huggingface.co/docs
- Docker: https://docs.docker.com/

### Tools & Libraries
- Recharts: https://recharts.org/
- Axios: https://axios-http.com/
- scikit-learn: https://scikit-learn.org/

---

**Last Updated**: April 15, 2026 | **Maintained by**: Development Team
