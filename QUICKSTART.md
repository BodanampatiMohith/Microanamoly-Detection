# Quickstart

This file mirrors [QUICK_START.md](./QUICK_START.md) so older links still work.

## Local run

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

Open `http://localhost:3000`.

## Deployment answer

For the actual anomaly-detection app, deploy both parts together.

- Frontend-only is not enough because frame processing happens in Flask.
- The recommended deployment is one service using the root `Dockerfile`.
- That one service serves the dashboard and the API from the same origin.

For more detail, see [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).
