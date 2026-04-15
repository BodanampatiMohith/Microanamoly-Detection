# Complete Project Setup & Deployment Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Full Technology Stack](#full-technology-stack)
3. [Local Development Setup](#local-development-setup)
4. [Deployment Guide](#deployment-guide)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Microanomalies Detection System** is a real-time video-based anomaly detection application that detects vibration anomalies in mechanical systems using Euler Video Magnification (EVM) and machine learning.

### Key Features
- Real-time video capture from webcam
- Euler Video Magnification for motion amplification
- Feature extraction from motion signals
- Rule-based and ML-based anomaly detection
- Professional interactive dashboard
- Live monitoring and statistics

### Architecture
- **Frontend**: React 18 + Vite, deployed on Vercel
- **Backend**: Flask REST API, deployed on Hugging Face Spaces
- **Processing**: OpenCV, NumPy, SciPy, scikit-learn
- **Communication**: CORS-enabled REST API with JSON payloads

---

## Full Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.0 | Build tool & dev server |
| Recharts | 2.10.0 | Data visualization |
| Axios | 1.6.0 | HTTP client |
| CSS3 | Latest | Styling |

### Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Flask | 3.0.0+ | REST API framework |
| Flask-CORS | 4.0.0+ | Cross-origin requests |
| OpenCV | 4.8.0+ | Image processing |
| NumPy | 1.26.0+ | Numerical computing |
| SciPy | 1.14.0+ | Signal processing |
| scikit-learn | 1.4.0+ | Machine learning |
| Pillow | 10.0.0+ | Image handling |
| Gunicorn | 23.0.0+ | Production WSGI server |

### Infrastructure
| Component | Service | Purpose |
|-----------|---------|---------|
| Frontend Hosting | Vercel | CDN-backed frontend deployment |
| Backend Hosting | Hugging Face Spaces | Container-based backend deployment |
| Version Control | GitHub | Source code management |
| Development | VS Code | Code editor |

---

## Local Development Setup

### Prerequisites
- **Node.js** >= 18.0.0 (for frontend)
- **Python** >= 3.10 (for backend)
- **Git** for version control
- **Webcam** for real-time capture

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/Microanamoly-detection.git
cd Microanamoly-detection
```

### Step 2: Backend Setup

#### Create Python Virtual Environment
```powershell
# Windows
cd backend
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment (Optional)
```bash
# Copy template
cp .env.example .env

# Edit .env if needed (local defaults usually work fine)
# For local development, you can leave defaults as-is
```

#### Start Backend Server
```bash
python app.py
```

Expected output:
```
 * Running on http://0.0.0.0:5000
```

Backend will be available at: `http://localhost:5000`

### Step 3: Frontend Setup

#### Open New Terminal/Tab & Navigate to Frontend
```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

#### Create Environment File (Optional)
```bash
# Copy template
cp .env.example .env.local

# For local development, the default settings proxy to http://localhost:5000
# You can leave the defaults as-is
```

#### Start Development Server
```bash
npm run dev
```

Expected output:
```
  Local:        http://localhost:3000/
```

Frontend will be available at: `http://localhost:3000`

### Step 4: Verify End-to-End

1. **Open Dashboard**: Navigate to `http://localhost:3000`
2. **Check Backend Connection**: Look for "Backend Connected" badge in header
3. **Allow Camera Access**: Grant webcam permission when prompted
4. **Start Monitoring**: Click "Start Monitoring" button
5. **Verify Data Flow**: Check if:
   - Raw video frame updates
   - Charts show live data
   - FPS counter updates

---

## Deployment Guide

### Option 1: Free Deployment (Recommended)
**Cost**: Free | **Includes**: 1 GB bandwidth/month + free Hugging Face tier

#### Step A: Deploy Backend to Hugging Face Spaces

1. **Create Hugging Face Account**
   - Go to https://huggingface.co/join
   - Complete signup

2. **Create New Space**
   - Visit https://huggingface.co/spaces
   - Click "Create new Space"
   - Choose:
     - **Space name**: `microanomaly-detection` (or your choice)
     - **License**: Apache 2.0
     - **Space SDK**: Docker
     - **Private**: No (unless you want private)

3. **Push Code to Space**
   ```bash
   # Clone the space locally
   git clone https://huggingface.co/spaces/your-username/microanomaly-detection
   cd microanomaly-detection
   
   # Copy our code
   # Copy all files from our repo's backend/ and root files to this space
   
   git add .
   git commit -m "Initial deployment"
   git push
   ```

4. **Configure Space Variables**
   - Go to Space Settings → Variables and secrets
   - Add environment variables:
     - `PORT=7860`
     - `CORS_ORIGINS=https://your-vercel-project.vercel.app`
   - Save

5. **Wait for Build**
   - Space will automatically build Docker image
   - Build takes 3-10 minutes
   - Space will show "Running" when ready

6. **Test Backend**
   ```bash
   # Should return JSON if working
   curl https://your-username-microanomaly-detection.hf.space/api/health
   ```

#### Step B: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com/signup
   - Sign up using GitHub (recommended)

2. **Import Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your GitHub repo
   - Click "Import"

3. **Configure Project**
   - **Root Directory**: `frontend`
   - **Framework Preset**: "Other"
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variable**
   - Go to Project Settings → Environment Variables
   - Click "Add New"
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-username-microanomaly-detection.hf.space/api`
   - **Environments**: All (Production, Preview, Development)
   - Click "Save"

5. **Deploy**
   - Vercel will auto-deploy
   - Shows deployment progress
   - Deployment complete when status shows "Ready"

6. **Verify**
   - Open your Vercel URL (e.g., `https://your-project.vercel.app`)
   - Check "Backend Connected" badge
   - Allow camera access
   - Start monitoring

### Option 2: Complete Single-Server Deployment
**Cost**: ~$5-10/month | **Includes**: Everything in one container

#### Using Docker Locally
```bash
# Build and run all services together
docker-compose up --build

# Open http://localhost:5000
# Backend and frontend served from same origin
```

#### Deploy to Docker Host (AWS, DigitalOcean, etc.)
```bash
# Build Docker image
docker build -t microanomaly-detection .

# Run container
docker run -p 5000:5000 \
  -e CORS_ORIGINS="https://your-domain.com" \
  microanomaly-detection

# Access at http://your-server:5000
```

#### Deploy to Railway/Render
1. Connect GitHub repo
2. Set root path: `.` (or `backend`)
3. Build command: (auto-detected)
4. Start command: `gunicorn -w 2 -b 0.0.0.0:$PORT app:app`
5. Set `PORT=5000` env variable
6. Deploy

---

## Production Deployment

### Vercel Frontend Deployment Best Practices

#### Configuration File: `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

#### Environment Variables Needed
```
VITE_API_BASE_URL=https://your-backend.hf.space/api
```

#### Deployment Checklist
- [ ] GitHub repository linked to Vercel
- [ ] Environment variables set in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Root directory: `frontend`
- [ ] Auto-deploy from main branch enabled
- [ ] Backend is reachable and CORS-enabled
- [ ] Test with real camera/webcam

### Hugging Face Spaces Backend Deployment Best Practices

#### Space Requirements
- **SDK**: Docker
- **Docker image**: Must include Python 3.10+, OpenCV deps
- **Port**: 7860 (default) or set PORT env variable
- **Startup time**: First load takes 30-60 seconds

#### Environment Variables for Production
```
PORT=7860
DEBUG=False
CORS_ORIGINS=https://your-vercel-project.vercel.app
```

#### Monitoring Health
```bash
# Test health endpoint
curl https://your-space.hf.space/api/health

# Test frame processing
curl -X POST https://your-space.hf.space/api/process_frame \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_encoded_image_here"}'
```

---

## Quick Start Commands

### Local Development (All Operating Systems)

```bash
# 1. Clone and navigate
git clone https://github.com/your-username/Microanamoly-detection.git
cd Microanamoly-detection

# 2. Backend (Terminal 1)
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py

# 3. Frontend (Terminal 2)
cd frontend
npm install
npm run dev

# 4. Open browser to http://localhost:3000
```

### Build for Production

```bash
# Frontend production build
cd frontend
npm run build

# Creates dist/ folder ready for deployment
```

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Configuration
curl http://localhost:5000/api/config

# Test with image (PowerShell)
$base64Image = [Convert]::ToBase64String([IO.File]::ReadAllBytes("test.jpg"))
curl -X POST http://localhost:5000/api/process_frame `
  -H "Content-Type: application/json" `
  -d "{\"image\":\"$base64Image\"}"
```

---

## Troubleshooting

### Frontend Issues

#### "Backend Disconnected" Message
**Problem**: Frontend can't reach backend API

**Solutions**:
1. Verify backend is running: `curl http://localhost:5000/api/health`
2. Check `VITE_API_BASE_URL` environment variable is set correctly
3. Verify CORS is enabled on backend
4. For Vercel: Check that Hugging Face Space is running

#### "Cannot allow camera access"
**Problem**: Browser blocks camera

**Solutions**:
1. Check browser permissions: Settings → Privacy → Camera
2. Ensure HTTPS in production (Vercel is HTTPS by default)
3. Verify site is not in private/incognito mode
4. Try different browser

#### Charts not updating
**Problem**: Data not flowing to dashboard

**Solutions**:
1. Check console for JavaScript errors (F12)
2. Verify `/api/process_frame` returns valid JSON
3. Allow camera permission
4. Click "Start Monitoring"
5. Check network tab for API responses

### Backend Issues

#### "Port 5000 already in use"
**Problem**: Another application using port 5000

**Solutions**:
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

#### Import errors ("No module named cv2")
**Problem**: Missing dependencies

**Solutions**:
```bash
# Ensure virtual environment is activated
# Windows:
.\venv\Scripts\activate

# Reinstall requirements
pip install --upgrade -r requirements.txt
```

#### CORS errors in browser console
**Problem**: Backend not allowing requests from frontend origin

**Solutions**:
1. Check `CORS_ORIGINS` in backend
2. For development: Set `CORS_ORIGINS=*`
3. For production: Set `CORS_ORIGINS=https://your-vercel-domain.vercel.app`

### Deployment Issues

#### Vercel build fails
**Problem**: npm build command errors

**Check**:
1. Root directory set to `frontend` in Vercel settings
2. Build command: `npm run build`
3. Output directory: `dist`
4. All environment variables set

#### Hugging Face Space stuck "Building"
**Problem**: Docker build takes too long or hangs

**Solutions**:
1. Wait up to 15 minutes (first build can be slow)
2. Check build logs in Space for errors
3. Restart space: Settings → Restart

#### API calls fail in deployed version
**Problem**: Frontend can reach backend but requests fail

**Check**:
1. Backend `/api/health` returns JSON (not HTML)
2. Content-Type headers are correct
3. CORS_ORIGINS includes the Vercel domain
4. API endpoints exist and respond correctly

---

## API Endpoints Reference

### Health & Config
- `GET /api/health` - Server status check
- `GET /api/config` - Current configuration

### ROI Management
- `GET /api/roi` - Get Region of Interest
- `POST /api/roi` - Update ROI

### Processing
- `POST /api/process_frame` - Process single frame
- `POST /api/reset` - Reset pipeline state

### Runtime Parameters
- `GET /api/runtime/evm` - Get EVM parameters
- `POST /api/runtime/evm` - Update EVM parameters

### Statistics & Monitoring
- `GET /api/statistics` - Frame statistics
- `GET /api/monitoring/summary` - Monitoring summary
- `GET /api/monitoring/history` - Historical data
- `GET /api/monitoring/window` - Time window data
- `GET /api/monitoring/aggregate` - Aggregated metrics

---

## Support & Resources

- **GitHub Issues**: Report bugs or feature requests
- **Hugging Face Docs**: https://huggingface.co/docs
- **Vercel Docs**: https://vercel.com/docs
- **Flask Documentation**: https://flask.palletsprojects.com/
- **React Documentation**: https://react.dev/

---

## License
Apache 2.0

---

**Last Updated**: April 15, 2026
