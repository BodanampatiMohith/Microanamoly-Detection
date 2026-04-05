---
title: microanomaly-backend
emoji: "🛠️"
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Microanomaly Detection System

Full-stack vibration monitoring system that captures webcam frames in the browser, processes them with a Flask backend, and displays live anomaly metrics in a professional React dashboard.

## Current Status

The project is wired end to end.

- Frontend dev server proxies `/api` to Flask during local development.
- The production build is emitted into `backend/static` so Flask can serve the dashboard and API from one service.
- The backend API was smoke-tested on April 6, 2026 with:
  - `GET /api/health`
  - `GET /api/runtime/evm`
  - `POST /api/process_frame`
- The frontend production build was also verified with `npm run build`.

## Stack

- Frontend: React 18, Vite, Recharts
- Backend: Flask, OpenCV, NumPy, SciPy, scikit-learn
- Deployment: Docker, Gunicorn

## Project Structure

```text
Microanamoly-detection/
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- src/
|   `-- static/
|-- frontend/
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|-- data/
|-- docker-compose.yml
|-- Dockerfile
|-- QUICK_START.md
|-- DEPLOYMENT.md
`-- README.md
```

## Local Development

You need both the backend and frontend running during development.

### 1. Start the backend

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

### 2. Start the frontend

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

### 3. Open the dashboard

Open `http://localhost:3000` and allow webcam access.

The header should show `Backend Connected` once Flask is running.

## Production / Deployment

For the real app, frontend-only deployment is not enough.

Why:

- the React app captures frames
- the Flask backend processes frames and computes anomaly metrics
- without the backend, the dashboard has no processing pipeline

Recommended deployment:

- deploy one service using the root `Dockerfile`
- let that service serve both the API and the built frontend

This is the simplest and most reliable setup because the browser and API share the same origin.

### Build and run with Docker

```bash
docker build -t microanomaly-detection .
docker run -e PORT=5000 -p 5000:5000 microanomaly-detection
```

Open:

```text
http://localhost:5000
```

## Free Hosting (No Credit Card)

Recommended free combo:

- backend: Hugging Face Spaces (Docker)
- frontend: Vercel

Set in Vercel:

```text
VITE_API_BASE_URL=https://<your-space>.hf.space/api
```

Optional strict CORS in backend host:

```text
CORS_ORIGINS=https://<your-vercel-project>.vercel.app
```

If you do not set `CORS_ORIGINS`, backend defaults to allowing all origins.

### Docker Compose

```bash
docker-compose up --build
```

Open:

```text
http://localhost:5000
```

## API Notes

The frontend API client now:

- prefers same-origin `/api`
- falls back to `http://127.0.0.1:5000/api` and `http://localhost:5000/api`
- rejects HTML or other non-JSON responses from bad proxy or hosting setups
- normalizes `VITE_API_BASE_URL` so both `http://host:5000` and `http://host:5000/api` work

## Main API Endpoints

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

## Useful Commands

### Rebuild the production frontend into Flask static files

```powershell
cd frontend
npm install
npm run build
```

### Run a quick backend smoke test

```powershell
cd backend
.\venv\Scripts\python.exe -c "from app import app; client=app.test_client(); print(client.get('/api/health').get_json())"
```

## Troubleshooting

### Frontend shows `Backend Disconnected`

- Make sure Flask is running on port `5000`
- Refresh the page after the backend starts
- Confirm `http://127.0.0.1:5000/api/health` returns JSON

### Frontend loads but charts do not update

- Allow camera permission in the browser
- Start monitoring from the control panel
- Check Flask logs for `/api/process_frame` errors

### Production deployment shows the UI but API does not work

- deploy the whole project with the root `Dockerfile`
- do not deploy only the frontend unless you intentionally point it at a separate public backend with `VITE_API_BASE_URL`

## GitHub Update Workflow

After reviewing the changes locally:

```bash
git status
git add README.md QUICK_START.md QUICKSTART.md DEPLOYMENT.md SYSTEM_STATUS.md SETUP_COMPLETE.md PROJECT_SUMMARY.md setup.bat setup.sh frontend/src/services/api.js
git commit -m "Fix backend/frontend integration and refresh docs"
git push origin main
```

If you want to include the freshly built production assets too:

```bash
git add backend/static
git commit -m "Update production build assets"
git push origin main
```

## Docs

- [QUICK_START.md](./QUICK_START.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SYSTEM_STATUS.md](./SYSTEM_STATUS.md)
