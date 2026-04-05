# System Status

## Verified On April 6, 2026

The repo was checked and the current integration path is working.

## Verified Items

- Flask backend responds on `GET /api/health`
- Flask runtime config responds on `GET /api/runtime/evm`
- Frame processing responds on `POST /api/process_frame`
- React production build completes successfully with `npm run build`
- The frontend production build targets `backend/static` for one-service deployment

## Important Integration Notes

- Local development uses:
  - frontend on `http://localhost:3000`
  - backend on `http://127.0.0.1:5000`
- Production should use one deployment with the root `Dockerfile`
- Frontend-only deployment is not sufficient for the live anomaly-detection workflow

## Fix Applied

The frontend API client was hardened so it:

- normalizes `VITE_API_BASE_URL`
- prefers the most recently successful API base
- rejects HTML or other non-JSON responses from `/api`
- falls back cleanly to local Flask URLs when same-origin `/api` is not a valid API

## Current Recommended Commands

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Production Build

```powershell
cd frontend
npm run build
```
