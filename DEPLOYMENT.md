# Deployment Guide

## Short Answer

For this project, deploy both backend and frontend together.

Frontend-only deployment is not enough for the real system because:

- the browser only captures webcam frames
- the backend performs EVM processing, feature extraction, and anomaly detection
- the dashboard depends on `/api/process_frame` and other Flask endpoints

## Free Option (No Credit Card)

Use this split deployment:

- backend on Hugging Face Spaces (Docker)
- frontend on Vercel

This is the best no-card path for demo and portfolio usage.
Note: free tiers may sleep when idle.

## Hugging Face Backend + Vercel Frontend Steps

### 1. Deploy backend to Hugging Face Space

1. Create a Hugging Face account.
2. Create a new Space and choose `Docker` SDK.
3. Push this repository content to that Space.
4. In Space Variables, set:
   - `PORT=7860`
   - Optional strict CORS:
     - `CORS_ORIGINS=https://<your-vercel-project>.vercel.app`
5. Wait for build to finish, then test:
   - `https://<space-name>.hf.space/api/health`

### 2. Deploy frontend to Vercel

1. Import this GitHub repo into Vercel.
2. Set Root Directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable:
   - `VITE_API_BASE_URL=https://<space-name>.hf.space/api`
6. Deploy.

### 3. Verify end to end

1. Open your Vercel URL.
2. Allow webcam access.
3. Confirm backend badge shows connected.
4. Start monitoring and verify charts update.

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
docker run -e PORT=5000 -p 5000:5000 microanomaly-detection
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
