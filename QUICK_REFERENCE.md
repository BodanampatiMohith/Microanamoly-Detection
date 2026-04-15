# Quick Reference Commands & Setup Guide

## 🚀 TL;DR - Start Running in 5 Minutes

### Prerequisites Check
```bash
# Verify Node.js (18+)
node --version

# Verify Python (3.10+)
python --version
```

### Fast Local Setup (3 Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 3 - Browser:**
```
Open: http://localhost:3000
Allow camera permission
Click "Start Monitoring"
```

### Expected Result
- Dashboard loads
- "Backend Connected" badge shows
- Charts update in real-time
- FPS counter visible

---

## 📋 Complete Command Reference

### Backend Commands

#### Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

#### Running
```bash
# Development mode (auto-reload enabled)
python app.py

# Should output:
# * Running on http://0.0.0.0:5000
# * Press CTRL+C to quit
```

#### Testing
```bash
# Health check
curl http://localhost:5000/api/health

# PowerShell also works:
Invoke-WebRequest http://localhost:5000/api/health

# Get configuration
curl http://localhost:5000/api/config

# Test frame processing (requires base64 image)
curl -X POST http://localhost:5000/api/process_frame ^
  -H "Content-Type: application/json" ^
  -d "{\"image\": \"base64_encoded_image_here\"}"
```

#### Building & Production
```bash
# Build Docker image (from root directory)
docker build -t microanomaly:latest .

# Run Docker container
docker run -p 5000:5000 microanomaly:latest

# Using Docker Compose (includes frontend)
docker-compose up --build

# Clean up Docker
docker system prune -a
```

### Frontend Commands

#### Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Verify packages
npm list --depth=0
```

#### Development
```bash
# Start development server (auto-reload)
npm run dev

# Should output:
# Local:        http://localhost:3000/
# Press q to quit
```

#### Building
```bash
# Build for production
npm run build

# Creates dist/ folder with optimized files

# Preview production build locally
npm run preview

# Should show: http://localhost:4173
```

#### Environment Variables
```bash
# Create local environment file
cp .env.example .env.local

# Edit if needed:
# VITE_API_BASE_URL=http://localhost:5000
# (defaults work for local dev)
```

#### Troubleshooting
```bash
# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rm -r node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Update packages (carefully!)
npm update
```

---

## 🌐 Deployment Commands

### Vercel Frontend Deployment

#### Prerequisites
```bash
# Install Vercel CLI (optional but helpful)
npm install -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
vercel link
```

#### Deploy to Vercel
```bash
# One-time setup: Import from GitHub at https://vercel.com/new

# Deploy latest code
git push origin main

# Vercel auto-deploys on push

# Manual deployment (if needed)
vercel --prod
```

#### Environment Variables (Vercel Dashboard)
```
VITE_API_BASE_URL=https://your-username-microanomaly-detection.hf.space/api
```

### Hugging Face Backend Deployment

#### Create Space Locally
```bash
# Create temp directory
mkdir hf-deployment
cd hf-deployment

# Clone your HF space template
git clone https://huggingface.co/spaces/your-username/microanomaly-detection

# Copy backend files
cp -r ../Microanamoly-detection/* .

# Commit and push
git add .
git commit -m "Initial deployment"
git push
```

#### Environment Variables (HF Space UI)
```
PORT=7860
CORS_ORIGINS=https://your-project.vercel.app
DEBUG=False
```

#### Test Deployed Backend
```bash
# Health check
curl https://your-username-microanomaly-detection.hf.space/api/health

# Windows PowerShell:
Invoke-WebRequest https://your-username-microanomaly-detection.hf.space/api/health
```

---

## 🔧 Configuration Files

### Frontend Configuration Files

**vite.config.js** (Already configured)
```javascript
// Dev server runs on port 3000
// Proxies /api requests to http://localhost:5000
// Production build outputs to ../backend/static
```

**vercel.json** (NEW - Created for you)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**.env.local** (Create from template)
```bash
VITE_API_BASE_URL=http://localhost:5000
```

### Backend Configuration Files

**.env** (Optional, create from template)
```bash
PORT=5000
CORS_ORIGINS=*
DEBUG=False
```

---

## 🧹 Cleanup & Maintenance Commands

### Frontend
```bash
# Remove build artifacts
rm -rf dist/
rm -rf node_modules/

# Clear cache
rm -rf .vite/

# Reinstall everything
npm install
npm run build
```

### Backend
```bash
# Remove virtual environment
rm -rf venv/

# Remove Python cache
rm -rf __pycache__/
rm -rf .pytest_cache/
rm -rf *.pyc

# Remove logs
rm -rf logs/*.log

# Recreate environment
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### All
```bash
# Remove build outputs
rm -rf backend/static/

# Rebuild everything
npm run build
python app.py
```

---

## 🐛 Debugging Commands

### Network & API Testing
```bash
# Test backend is running
curl http://localhost:5000/api/health

# All endpoints test
curl http://localhost:5000/api/config
curl http://localhost:5000/api/roi
curl http://localhost:5000/api/runtime/evm

# Real-time tail (Linux/macOS)
tail -f backend/logs/app.log

# Windows - View recent logs
Get-Content backend/logs/app.log -Tail 20
```

### Frontend Debugging
```bash
# View browser console (open in browser: F12 or Cmd+Option+I)

# Check API client active base:
# Open Console and type:
# apiService.getActiveApiBase()

# Monitor network requests:
# Open Network tab in browser DevTools
# Process frames and watch requests
```

### Port Troubleshooting

**Port 3000 in use:**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

**Port 5000 in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

---

## 📦 Dependency Management

### Frontend Dependencies
```bash
# Check outdated packages
npm outdated

# Install specific version
npm install package@version

# Update all packages
npm update

# Remove package
npm uninstall package-name

# View dependency tree
npm ls

# Check for vulnerabilities
npm audit
npm audit fix
```

### Backend Dependencies
```bash
# List installed packages
pip list

# Check for outdated packages
pip list --outdated

# Install specific version
pip install package==version

# Uninstall package
pip uninstall package-name

# Export requirements
pip freeze > requirements.txt

# Check for vulnerabilities
pip install safety
safety check
```

---

## 🚢 Production Checklist

### Before Deploying Frontend
- [ ] `npm run build` completes without errors
- [ ] `dist/` folder created with files
- [ ] Remove any console.log statements
- [ ] Test locally: `npm run preview`
- [ ] VITE_API_BASE_URL set correctly in Vercel
- [ ] CORS_ORIGINS includes Vercel domain in backend
- [ ] No sensitive data in environment files

### Before Deploying Backend
- [ ] All tests pass (if tests exist)
- [ ] `python app.py` runs without errors
- [ ] GET /api/health returns 200 with JSON
- [ ] POST /api/process_frame accepts test image
- [ ] All required Python packages in requirements.txt
- [ ] .env files not committed to Git
- [ ] Debug mode disabled in production

### Post-Deployment Testing
- [ ] Vercel frontend loads
- [ ] "Backend Connected" shows
- [ ] Camera permission dialog appears
- [ ] Start monitoring works
- [ ] Charts update with live data
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Performance acceptable (FPS > 10)

---

## 💾 Git Workflow

### Standard Development
```bash
# Check status
git status

# Stage frontend changes
git add frontend/

# Stage backend changes
git add backend/

# Commit
git commit -m "Feature: Add feature name"

# Push to origin
git push origin main
```

### Before First Deployment
```bash
# Build frontend
cd frontend && npm run build

# Stage all files
git add .

# Commit
git commit -m "Initial setup: Project ready for deployment"

# Push
git push origin main

# Vercel auto-deploys on push!
```

---

## 📞 Support Commands

### Information
```bash
# Node/npm versions
node --version
npm --version

# Python version
python --version

# Check Python packages
pip list | grep -E "flask|opencv|numpy|scipy"

# Check if ports are available
netstat -a | grep LISTEN
```

### Viewing Logs

**Backend logs**
```bash
# Real-time (Linux/macOS)
tail -f backend/logs/app.log

# Windows PowerShell
Get-Content backend/logs/app.log -Wait

# Search logs
grep ERROR backend/logs/app.log
```

**Frontend logs**
```bash
# Browser DevTools (F12):
# Console tab shows JavaScript errors
# Network tab shows API requests
# Application tab shows stored data
```

---

## 🎯 Quick Problem Solving

| Problem | Command | Solution |
|---------|---------|----------|
| Backend won't start | `python app.py` | Check port 5000 not in use, reinstall requirements |
| Frontend won't load | `npm run dev` | Check Node 18+, delete node_modules and reinstall |
| API returns HTML | `curl /api/health` | Backend not running or proxy misconfigured |
| Build error | `npm run build` | Check for syntax errors, update Vite plugins |
| Port already in use | `netstat -ano` | Kill process or change port number |
| Import errors (Python) | `pip install -r requirements.txt` | Recreate venv, reinstall deps |
| CORS error in browser | Check CORS_ORIGINS env | Verify Vercel domain included in backend |

---

## 📚 Copy-Paste Templates

### Create .env.local (Frontend)
```bash
# Command:
echo "VITE_API_BASE_URL=http://localhost:5000" > frontend/.env.local
```

### Create .env (Backend)
```bash
# Command:
echo "PORT=5000" > backend/.env
echo "CORS_ORIGINS=*" >> backend/.env
echo "DEBUG=False" >> backend/.env
```

### Quick Build & Deploy
```bash
# Build everything
cd frontend && npm run build
cd ../backend
docker build -t app .

# Or send to HF Spaces
cd ../
git add .
git commit -m "Production build"
git push origin main
```

---

## 🆘 Emergency Cleanup

**If everything breaks**, start fresh:
```bash
# Backend
rm -rf backend/venv backend/__pycache__ backend/.env
python -m venv backend/venv
source backend/venv/bin/activate  # or .\backend\venv\Scripts\activate
pip install -r backend/requirements.txt

# Frontend
rm -rf frontend/node_modules frontend/dist
cd frontend
npm install
npm run build
```

---

**Last Updated**: April 15, 2026 | Use this as your daily reference guide!
