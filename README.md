# Microanomaly Detection System

Full-stack application for machine vibration monitoring using webcam video, Eulerian Video Magnification, signal processing, and anomaly detection.

## What This Project Does

- captures webcam frames in the browser
- sends frames to a Flask backend for processing
- extracts vibration features such as RMS, variance, dominant frequency, and spectral entropy
- classifies machine behavior as normal or abnormal
- shows results in a live React dashboard

## Tech Stack

- Frontend: React, Vite
- Backend: Flask, NumPy, SciPy, OpenCV, scikit-learn
- Deployment: Docker, Gunicorn

## Project Structure

```text
Microanamoly-detection/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── src/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── data/
├── Dockerfile
├── docker-compose.yml
├── QUICK_START.md
├── DEPLOYMENT.md
└── README.md
```

## Prerequisites

- Python 3.10 or newer recommended
- Node.js 18 or newer recommended
- npm
- Modern browser with camera access

## Run Locally

Start the backend first.

### Backend

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

### Frontend

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

### Notes

- Keep both terminals running.
- Allow camera permission in the browser.
- The frontend uses `/api` in dev and can also fall back to `http://127.0.0.1:5000/api` and `http://localhost:5000/api`.

## Production-Style Local Run With Docker

This project now supports deploying as one service.

```bash
docker build -t microanomaly-detection .
docker run -p 5000:5000 microanomaly-detection
```

Open:

```text
http://localhost:5000
```

## Docker Compose

```bash
docker-compose up --build
```

Open:

```text
http://localhost:5000
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

## Deployment

Use the root `Dockerfile` for deployment.

Recommended platforms:

- Render
- Railway
- Any Docker-compatible host

Important:

- deploy from the repository root
- use the root `Dockerfile`
- do not deploy frontend and backend as separate apps unless you explicitly set `VITE_API_BASE_URL`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details.

## Troubleshooting

### Frontend shows "Backend Disconnected"

- Make sure `python app.py` is running in `backend`
- Refresh the browser
- Confirm the backend opens at `http://127.0.0.1:5000/api/health`

### `npm run dev` fails

- make sure you are inside the `frontend` folder
- run `npm install` first

### `python app.py` fails

- make sure you are inside the `backend` folder
- activate the virtual environment
- run `pip install -r requirements.txt`

### Deployed app shows 404

- use the root `Dockerfile`
- deploy as one service
- open the deployed root URL, not `/3000` or `/5000`

## Useful Docs

- [QUICK_START.md](./QUICK_START.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [DEV_GUIDE.md](./DEV_GUIDE.md)

## Git Commands

If you changed code and want to update GitHub:

```bash
git status
git add .
git commit -m "Update project"
git push origin main
```

If you only want to push specific files:

```bash
git add README.md
git add backend
git add frontend
git commit -m "Update README and project files"
git push origin main
```
