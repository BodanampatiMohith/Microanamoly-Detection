---
title: microanomaly-backend
emoji: "🛠️"
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Microanomaly Detection System

A full-stack real-time vibration monitoring project using a webcam feed, Eulerian Video Magnification (EVM), feature extraction, and anomaly detection.

The system has two parts:
- Frontend dashboard (React + Vite) for camera capture, controls, and graphs.
- Backend API (Flask + OpenCV + SciPy + scikit-learn) for signal processing and anomaly scoring.

## What This Project Does

1. Captures webcam frames in real time.
2. Applies ROI-based processing and motion magnification.
3. Extracts vibration features (time + frequency domain).
4. Computes anomaly status (`Normal` or `Abnormal`).
5. Visualizes live waveform, FFT spectrum, and system metrics.

## Tech Stack

- Frontend: React 18, Vite 5, Recharts
- Backend: Flask, Flask-CORS, OpenCV, NumPy, SciPy, scikit-learn
- Runtime server: Gunicorn
- Deployment: Docker, Hugging Face Spaces, Vercel

## Repository Structure

```text
Microanamoly-detection/
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- src/
|   |-- static/
|-- frontend/
|   |-- src/
|   |-- package.json
|   |-- vite.config.js
|   `-- vercel.json
|-- data/
|-- Dockerfile
|-- docker-compose.yml
|-- vercel.json
`-- README.md
```

## UI Guide (Buttons and Controls)

### Top Header Buttons

- `Backend Connected / Backend Disconnected`
  - Live connectivity indicator from `/api/health`.
- `RESET SYSTEM`
  - Calls backend reset endpoint and clears local dashboard history/state.
- `PERFORMANCE`
  - Toggles performance monitor panel (FPS, frame time, memory, dropped frames).

### Main Control Panel

- `Start Monitoring / Stop Monitoring`
  - Starts or stops sending captured webcam frames to backend processing.
- `Motion Amplification Factor` slider
  - Updates runtime EVM amplification.
- `Frequency Band Selection` (`Low`, `High`)
  - Updates runtime EVM band-pass frequencies.
- `Region of Interest (ROI)` inputs (`X`, `Y`, `Width`, `Height`)
  - Selects the frame region used for analysis.

### Visual Panels

- `RAW VIDEO FEED`
  - Current camera frame with ROI overlay returned by backend.
- `MOTION MAGNIFIED OUTPUT`
  - EVM-amplified output.
- `TIME-DOMAIN VIBRATION WAVEFORM`
  - Recent motion signal trend.
- `FFT SPECTRUM ANALYSIS`
  - Frequency-domain magnitude chart.

## How Processing Works (End-to-End)

1. Frontend captures frame as base64 JPEG.
2. Frame + ROI are posted to `POST /api/process_frame`.
3. Backend decodes frame and extracts ROI.
4. EVM pipeline magnifies subtle motion.
5. Motion signal is extracted and buffered.
6. Features are computed (`rms`, `variance`, `dominant_frequency`, `spectral_entropy`, etc.).
7. Rule-based detector computes anomaly index and status.
8. Optional ML detector is used if trained model exists.
9. Backend returns processed frames + metrics for dashboard rendering.

## Local Development

### 1) Start backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

### 2) Start frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

### 3) Run app

- Open `http://localhost:3000`
- Allow camera permission
- Confirm header shows `Backend Connected`
- Click `Start Monitoring`

## Deployment Modes

## A) Single service (recommended for easiest demo)

Use root Dockerfile so backend serves both API and frontend.

```bash
docker build -t microanomaly-detection .
docker run -e PORT=5000 -p 5000:5000 microanomaly-detection
```

Open:

```text
http://localhost:5000
```

## B) Split deployment (Vercel frontend + Hugging Face backend)

Current repo is configured for this.

- Vercel frontend uses `/api/*` rewrites to:
  - `https://mohith0108-microanomaly-backend.hf.space/api/:path*`
- Backend CORS should include Vercel domain when strict mode is used.

### Required Vercel settings

If project root is `frontend`:
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

If project root is repository root:
- root `vercel.json` already defines build/output for `frontend`.

## Environment Variables

### Frontend (`frontend/.env.local`)

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_BUILD_OUT_DIR=dist
```

Notes:
- In production, frontend now prefers same-origin `/api` first.
- You can still set `VITE_API_BASE_URL` for custom backends.

### Backend (`backend/.env`)

```bash
PORT=5000
CORS_ORIGINS=*
```

For stricter production CORS:

```bash
CORS_ORIGINS=https://your-project.vercel.app
```

## API Endpoints

- `GET /api/health`
- `GET /api/config`
- `GET /api/roi`
- `POST /api/roi`
- `POST /api/process_frame`
- `GET /api/statistics`
- `GET /api/monitoring/summary`
- `GET /api/monitoring/history`
- `GET /api/monitoring/window`
- `GET /api/monitoring/aggregate`
- `GET /api/runtime/evm`
- `POST /api/runtime/evm`
- `POST /api/reset`

## Quick Verification Commands

Backend health check:

```powershell
curl http://127.0.0.1:5000/api/health
```

Hugging Face backend health check:

```powershell
curl https://mohith0108-microanomaly-backend.hf.space/api/health
```

Production frontend build test:

```powershell
cd frontend
npm run build
```

## Troubleshooting

### Vercel shows `404 NOT_FOUND`

- Check Vercel Root Directory (`frontend` not `Frontend`).
- Ensure latest commit has updated `vercel.json` config.

### Vercel UI loads but `Backend Disconnected`

- Ensure `/api/*` rewrite is present in Vercel config.
- Confirm HF backend health endpoint returns JSON.
- Confirm backend CORS allows Vercel domain (if strict CORS enabled).

### Camera works but graphs do not update

- Click `Start Monitoring`.
- Check browser console/network for `/api/process_frame` errors.
- Verify ROI dimensions are valid and not outside frame bounds.

## Notes on ML

Rule-based anomaly detection is always available.
Optional ML detection is used only when model file exists:

```text
data/models/anomaly_model.pkl
```

Training utilities are in:

```text
backend/src/anomaly/train_model.py
```

## License / Academic Use

This project is suitable for academic demonstration of computer vision + signal processing + anomaly detection in predictive maintenance workflows.
