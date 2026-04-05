# Deployment Guide

## Short Answer

For this project, deploy both backend and frontend together.

Frontend-only deployment is not enough for the real system because:

- the browser only captures webcam frames
- the backend performs EVM processing, feature extraction, and anomaly detection
- the dashboard depends on `/api/process_frame` and other Flask endpoints

## Recommended Deployment

Use the root `Dockerfile`.

That image:

- builds the React frontend
- copies the production build into `backend/static`
- starts Flask with Gunicorn
- serves the UI and API from one host and one port

## Local Docker Test

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

## Render / Railway / Any Docker Host

Use:

- repository root as the build context
- the root `Dockerfile`
- the container's default command

Do not point the platform at `frontend/` only unless you intentionally want a static-only build.

## If You Intentionally Split Frontend and Backend

This is supported, but it is not the default recommendation.

If you deploy them separately, build the frontend with a public backend URL:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://your-backend-domain/api \
  --build-arg VITE_BUILD_OUT_DIR=dist \
  -f frontend/Dockerfile \
  frontend
```

Notes:

- `VITE_API_BASE_URL` can be `https://your-backend-domain` or `https://your-backend-domain/api`
- the frontend API client now normalizes both forms correctly
- the backend must allow requests from the frontend origin

## Production Checklist

- confirm `GET /api/health` returns JSON
- confirm the dashboard header shows `Backend Connected`
- confirm camera permission is allowed in the browser
- confirm `POST /api/process_frame` works with live frames
- if using the built-in Flask-served frontend, rebuild with `npm run build` before shipping new UI changes

## GitHub / Release Workflow

Before pushing:

```bash
cd frontend
npm install
npm run build
```

Then:

```bash
git status
git add frontend/src/services/api.js README.md QUICK_START.md QUICKSTART.md DEPLOYMENT.md SYSTEM_STATUS.md SETUP_COMPLETE.md PROJECT_SUMMARY.md backend/static setup.bat setup.sh
git commit -m "Fix backend/frontend integration and refresh deployment docs"
git push origin main
```
