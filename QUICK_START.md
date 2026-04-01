# Quick Start Guide - 5 Minute Setup

## Start Here

This guide gets the dashboard running in 5 minutes.

---

## Step 1: Start Backend (Terminal 1)

```bash
cd backend
python app.py
```

Expected output:

```text
* Running on http://127.0.0.1:5000
```

When you see this, leave it running and move to Step 2.

---

## Step 2: Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Expected output:

```text
VITE v5.x ready
Local: http://localhost:3000/
```

Open `http://localhost:3000` in your browser.

---

## Step 3: Verify Dashboard

You should see:

- Title: "Webcam-Based Motion Magnification for Vibration Anomaly Detection"
- Green status badge: "Backend Connected"
- Video placeholder ready for input
- Charts and controls visible

If you see "Backend Disconnected":

- Make sure Terminal 1 is still running `python app.py`
- Refresh the page after the backend is up
- The frontend now falls back to `http://127.0.0.1:5000/api` and `http://localhost:5000/api` if the dev proxy path is unavailable

---

## Step 4: Grant Camera Permission

1. Allow camera access when the browser prompts you.
2. The video feed should appear in the left panel.
3. Start monitoring from the dashboard.

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Backend Disconnected | Make sure `python app.py` is still running in `backend` |
| Cannot access `localhost:3000` | Start the frontend with `npm run dev` in `frontend` |
| Cannot access `localhost:5000` | Start the backend with `python app.py` in `backend` |
| No video feed | Allow browser camera access |
| Slow or laggy UI | Close extra tabs and lower camera resolution if needed |

---

## System Overview

```text
Terminal 1: Flask backend on port 5000
Terminal 2: Vite frontend on port 3000
Browser:    http://localhost:3000
```
