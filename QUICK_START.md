# ⚡ Quick Start Guide - 5 Minute Setup

## 🚀 Start Here

This guide gets the dashboard running in **5 minutes**.

---

## **Step 1: Start Backend (Terminal 1)**

```bash
cd backend
python app.py
```

**Expected output:**
```
WARNING in app.initapp
Running on http://localhost:5000 (Press CTRL+C to quit)
```

✅ When you see this, **leave it running** and go to Step 2.

---

## **Step 2: Start Frontend (Terminal 2)**

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

**Expected output:**
```
VITE v5.0.0  ready in 234 ms
➜  Local:   http://localhost:5173/
```

✅ Click the link or open `http://localhost:5173` in your browser.

---

## **Step 3: Verify Dashboard**

You should see:
- ✅ Title: "Webcam-Based Motion Magnification for Vibration Anomaly Detection"
- ✅ Green status badge: "Backend Connected"
- ✅ Video placeholder ready for input
- ✅ All charts and controls visible

**If you see red "Backend Disconnected"**:
- Go back to Terminal 1
- Make sure backend is still running
- If not, restart: `python backend/app.py`

---

## **Step 4: Grant Camera Permission**

1. Browser will ask: "localhost wants to access your camera"
2. Click **"Allow"**
3. Video feed appears in left panel
4. System starts processing

---

## **Step 5: Monitor Vibrations**

- **Left Panel**: Raw webcam feed (30 FPS)
- **Waveform Chart**: Time-domain motion
- **Spectrum Chart**: Frequency analysis
- **Gauge**: Stability index (0-100)
- **Metrics**: RMS, frequency, variance, etc.

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| **"Backend Disconnected"** | Restart backend: `python backend/app.py` in Terminal 1 |
| **"Cannot access localhost:5173"** | Frontend not running. Run `npm run dev` in Terminal 2 |
| **"Cannot access localhost:5000"** | Backend not running. Run `python app.py` in Terminal 1 |
| **No video feed** | Click "Allow" when browser asks for camera permission |
| **Slow/laggy** | Close other browser tabs; reduce resolution in settings |

---

## 📚 Next Steps

- **User Guide**: Read [DASHBOARD_USER_GUIDE.md](DASHBOARD_USER_GUIDE.md) (20 min)
- **Setup Guide**: Read [DASHBOARD_SETUP_GUIDE.md](DASHBOARD_SETUP_GUIDE.md) (15 min)
- **Architecture**: Read [DASHBOARD_ARCHITECTURE.md](DASHBOARD_ARCHITECTURE.md) (15 min)

---

## 🎯 System Overview

```
Your Computer
├── Terminal 1: Python Flask Backend (Port 5000)
│   └── Processes video frames + detects anomalies
└── Terminal 2: Node.js Frontend (Port 5173)
    └── Shows dashboard + controls

Browser (localhost:5173)
├── Displays live video feeds
├── Shows real-time charts
├── Displays stability gauge
└── Provides controls (amplification, frequency band)
```

---

## ✅ You're Ready!

The dashboard is now fully operational. Monitor your equipment's vibrations in real-time!

**Questions?** Check the [README.md](README.md) troubleshooting section.

---

**Last Updated**: February 14, 2026
**Status**: Ready to Use ✓
