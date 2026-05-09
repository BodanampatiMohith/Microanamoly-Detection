# Quick Start Guide

This guide will help you get the Microanomalies Detection System running in minutes.

## Prerequisites

- **Python 3.10+** - Download from [python.org](https://python.org)
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **Git** - Download from [git-scm.com](https://git-scm.com)

## 🚀 One-Click Setup

### Option 1: Automated Setup (Recommended)

**Linux/macOS:**
```bash
git clone https://github.com/BodanampatiMohith/Microanamoly-Detection.git
cd Microanamoly-Detection
bash setup.sh
```

**Windows:**
```cmd
git clone https://github.com/BodanampatiMohith/Microanamoly-Detection.git
cd Microanamoly-Detection
setup.bat
```

The setup script will:
- ✅ Check and install dependencies
- ✅ Create Python virtual environment
- ✅ Install all required packages
- ✅ Build the frontend
- ✅ Create necessary directories
- ✅ Provide startup commands

### Option 2: Docker Setup

If you have Docker installed:

```bash
git clone https://github.com/BodanampatiMohith/Microanamoly-Detection.git
cd Microanamoly-Detection
docker-compose up --build
```

Access the application at http://localhost:5000

## 🎯 Manual Setup

If the automated setup fails, follow these steps:

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run build
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py
```

**Terminal 2 - Frontend (Development):**
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- **Development Mode**: http://localhost:3000
- **Production Mode**: http://localhost:5000

## 📱 First Steps

1. **Upload a Video**: Use the web interface to upload a video file
2. **Configure ROI**: Select the Region of Interest for analysis
3. **Adjust EVM Settings**: Fine-tune amplification and frequency parameters
4. **Start Analysis**: Begin real-time anomaly detection
5. **View Results**: Monitor the dashboard for alerts and analytics

## 🔧 Common Issues

### Python Issues

**Issue:** `python: command not found`
**Solution:** Install Python 3.10+ and ensure it's in your PATH

**Issue:** Virtual environment activation fails
**Solution:** 
```bash
# Try alternative activation
python -m venv venv
venv\Scripts\activate.bat  # Windows
source venv/bin/activate  # Linux/macOS
```

### Node.js Issues

**Issue:** `node: command not found`
**Solution:** Install Node.js 18+ from nodejs.org

**Issue:** npm install fails
**Solution:** 
```bash
npm cache clean --force
npm install
```

### Port Conflicts

**Issue:** Port 5000 or 3000 already in use
**Solution:** Change ports in configuration files or stop conflicting services

### Permission Issues

**Linux/macOS:**
```bash
chmod +x setup.sh
sudo bash setup.sh  # Only if necessary
```

## 📊 Testing the Installation

### 1. Test Backend
```bash
cd backend
source venv/bin/activate
python -c "import cv2, numpy, scipy, sklearn; print('✅ Backend dependencies OK')"
```

### 2. Test Frontend
```bash
cd frontend
npm run build
ls -la ../backend/static/  # Should show built files
```

### 3. Test Integration
```bash
python test_integration.py
```

## 🎮 Sample Usage

1. **Open** http://localhost:5000 in your browser
2. **Upload** a sample video (MP4, AVI, MOV formats supported)
3. **Select** Region of Interest by drawing on the video
4. **Configure** EVM parameters:
   - Amplification: 5.0 - 20.0
   - Low Frequency: 0.1 - 1.0 Hz
   - High Frequency: 2.0 - 5.0 Hz
5. **Start** real-time analysis
6. **Monitor** alerts and analytics dashboard

## 📞 Need Help?

- **Documentation**: Check the main [README.md](README.md)
- **Issues**: Report problems on [GitHub Issues](https://github.com/BodanampatiMohith/Microanamoly-Detection/issues)
- **Architecture**: See [architecture.md](architecture.md) for technical details

## 🎯 Next Steps

- Explore the [API documentation](README.md#api-endpoints)
- Try different video formats and resolutions
- Experiment with EVM parameters for different use cases
- Check the notebooks/ directory for analysis examples

---

**Happy anomaly detecting! 🎉**
