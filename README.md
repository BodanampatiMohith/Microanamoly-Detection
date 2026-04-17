# Microanomaly Detection Platform

Production-ready, full-stack system for webcam-based vibration monitoring using Eulerian Video Magnification (EVM), real-time signal processing, and anomaly detection.

## Overview

This platform captures live webcam frames, applies motion magnification on a region of interest (ROI), extracts vibration features, and classifies operating condition in real time.

Primary use case:
- predictive maintenance and vibration anomaly monitoring

Core capabilities:
- live camera ingestion from browser
- ROI-based EVM motion magnification
- time-domain + frequency-domain feature extraction
- rule-based anomaly scoring with optional ML model inference
- operator dashboard with waveform, FFT spectrum, KPIs, and runtime controls
- telemetry endpoints for long-running trend monitoring

## Architecture

High-level architecture and data flow are documented in:
- [architecture.md](./architecture.md)
- [DASHBOARD_ARCHITECTURE.md](./DASHBOARD_ARCHITECTURE.md)

These files include Mermaid diagrams for:
- system context
- frontend component architecture
- backend processing pipeline
- live sequence flow
- validation and state lifecycle

## Tech Stack

Frontend:
- React 18
- Vite 5
- Recharts

Backend:
- Python 3.10+
- Flask + Flask-CORS
- OpenCV
- NumPy, SciPy
- scikit-learn
- h5py
- Gunicorn

Deployment:
- Docker (unified full-stack service)
- Vercel (frontend)
- Hugging Face Spaces (backend)

## Repository Structure

```text
Microanamoly-detection/
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- src/
|   |   |-- anomaly/
|   |   |-- evm/
|   |   |-- monitoring/
|   |   |-- signal/
|   |   `-- utils/
|   `-- static/
|-- frontend/
|   |-- src/
|   |-- package.json
|   |-- vite.config.js
|   `-- vercel.json
|-- data/
|-- Dockerfile
|-- docker-compose.yml
|-- architecture.md
`-- README.md
```

## Production Features

- real-time monitoring start/stop controls
- validated runtime parameter updates (amplification, frequency band, ROI)
- strict API input checks with clear 400 error responses
- output quality and anomaly KPI cards in dashboard
- explicit empty states (no synthetic chart data)
- telemetry summary/history/window/aggregate endpoints

## Prerequisites

- Python 3.10+ installed and available in `PATH`
- Node.js 18+ and npm
- Webcam access in browser

## Local Development

Run from repository root: `C:\Users\mohit\Downloads\Microanamoly-detection`

### 1) Start backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend URL:
- `http://127.0.0.1:5000`

### 2) Start frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:
- `http://localhost:3000`

### 3) Run monitoring

1. Open `http://localhost:3000`
2. Allow camera permission
3. Confirm header shows `Backend Connected`
4. Click `Start Monitoring`

## Runtime Controls and Validation

Runtime updates are validated both in UI and API.

Validated ranges:
- amplification factor: `1..100`
- cutoff low frequency: `0.1..120 Hz`
- cutoff high frequency: `0.2..150 Hz` and `high > low`
- ROI: `x >= 0`, `y >= 0`, `50 <= width <= 640`, `50 <= height <= 480`

## API Endpoints

Base path: `/api`

System:
- `GET /health`
- `GET /config`
- `POST /reset`

ROI:
- `GET /roi`
- `POST /roi`

Frame processing:
- `POST /process_frame`

Runtime EVM parameters:
- `GET /runtime/evm`
- `POST /runtime/evm`

Monitoring telemetry:
- `GET /statistics`
- `GET /monitoring/summary`
- `GET /monitoring/history?points=500`
- `GET /monitoring/window?minutes=60`
- `GET /monitoring/aggregate?hours=24`

## Process Frame Contract

`POST /api/process_frame`

Request body:

```json
{
  "image": "data:image/jpeg;base64,...",
  "roi": { "x": 100, "y": 100, "width": 300, "height": 200 }
}
```

Response includes:
- `magnified_frame` (base64 JPEG)
- `roi_frame` (base64 JPEG with ROI box)
- `anomaly_detection` status/index
- `features` (RMS, variance, dominant frequency, entropy, spectrum points)
- `motion_signal` and `evm_meta`
- timing and frame index

## Model Training (Optional)

If you want ML inference in addition to rule-based detection, train and save a model:

```powershell
python backend/src/anomaly/train_model.py --normal-data data/FeatureEntire.mat --mat --model-type svm --output data/models/anomaly_model.pkl
```

Then restart backend.

Model file location expected by backend:
- `data/models/anomaly_model.pkl`

## Build and Deployment

### Option A: Unified Docker deployment (recommended)

Build and run full stack (frontend + backend in one container):

```bash
docker build -t microanomaly-detection .
docker run -e PORT=5000 -p 5000:5000 microanomaly-detection
```

Access app at:
- `http://localhost:5000`

### Option B: Split deployment (Vercel + Hugging Face)

Current repo includes rewrites for this pattern.

- Frontend: Vercel using `frontend/vercel.json` or root `vercel.json`
- Backend: Hugging Face Space serving `/api/*`

## Environment Variables

### Backend (`backend/.env`)

Use [backend/.env.example](./backend/.env.example) as template.

Common values:

```bash
PORT=5000
DEBUG=False
CORS_ORIGINS=*
```

For stricter production CORS:

```bash
CORS_ORIGINS=https://your-project.vercel.app
```

### Frontend (`frontend/.env.local`)

Use [frontend/.env.example](./frontend/.env.example) as template.

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_BUILD_OUT_DIR=dist
```

## Validation and Build Checks

Frontend production build:

```powershell
cd frontend
npm run build
```

Backend health check:

```powershell
curl http://127.0.0.1:5000/api/health
```

## Troubleshooting

### Backend disconnected in UI

- confirm Flask is running
- check `http://127.0.0.1:5000/api/health`
- ensure frontend dev server proxy is active (`vite.config.js`)

### Camera opens but metrics do not update

- ensure monitoring is started (`Start Monitoring`)
- inspect browser network calls to `/api/process_frame`
- verify ROI dimensions are valid and within frame bounds

### Runtime updates rejected

- check validation ranges in this README
- API returns 400 with descriptive validation message

### PowerShell virtual environment activation issue

If script execution is blocked:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## Security and Operational Notes

- validate and sanitize all runtime inputs in both client and server
- restrict `CORS_ORIGINS` in production
- avoid committing large raw data files or trained artifacts unless intentionally versioned
- run with Gunicorn in production, not Flask debug server

## License

Add your preferred license file (for example MIT/Apache-2.0) and update this section accordingly.
