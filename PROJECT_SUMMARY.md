# Project Summary

## What This Project Is

A full-stack machine vibration monitoring application with:

- webcam capture in the browser
- Flask-based signal processing and anomaly detection
- a professional React dashboard for real-time monitoring

## What Was Verified

On April 6, 2026 the following were verified locally:

- `GET /api/health`
- `GET /api/runtime/evm`
- `POST /api/process_frame`
- `npm run build`

## Key Implementation Notes

- The frontend dev server runs on port `3000`
- The backend runs on port `5000`
- The frontend API client now has more reliable backend discovery and rejects invalid non-JSON API responses
- The production build goes into `backend/static` so the backend can serve the dashboard directly

## Deployment Recommendation

Deploy the project as one service with the root `Dockerfile`.

That is the best answer to:

- "Do I need to deploy both?"
- "Is frontend enough?"

Answer:

- for the real live app, both are needed
- the easiest way is one deployment that contains both
- frontend-only is only enough for a static UI demo, not for live anomaly detection

## Main Docs

- [README.md](./README.md)
- [QUICK_START.md](./QUICK_START.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SYSTEM_STATUS.md](./SYSTEM_STATUS.md)
