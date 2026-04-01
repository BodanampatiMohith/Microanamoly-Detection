# Deployment Guide

## Recommended Approach

Deploy this project as one service, not as separate frontend and backend apps.

The repository now includes a root `Dockerfile` that:

- builds the React frontend
- copies the build into Flask's `static` directory
- serves everything from one web service
- listens on the platform-provided `PORT`

This avoids the 404 and disconnected-backend problems caused by split deployments.

## Docker

Build and run locally:

```bash
docker build -t microanomaly-detection .
docker run -p 5000:5000 microanomaly-detection
```

Then open:

```text
http://localhost:5000
```

## Docker Compose

Run:

```bash
docker-compose up --build
```

Then open:

```text
http://localhost:5000
```

## Render or Railway

Use the root `Dockerfile` from the repository root.

- Root directory: repository root
- Dockerfile path: `Dockerfile`
- Start command: leave empty if the platform uses the Dockerfile command
- Port: let the platform provide `PORT`

## If You Deploy Frontend and Backend Separately

That setup needs an explicit public backend URL during frontend build time. Without that, the frontend will look for `/api` on its own host and usually show disconnected or 404 errors.

For split deployment, build the frontend with a public API base URL, for example:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://your-backend-domain/api \
  --build-arg VITE_BUILD_OUT_DIR=dist \
  -f frontend/Dockerfile \
  frontend
```
