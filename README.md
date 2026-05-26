# Microanomalies Detection System

An advanced computer vision system that uses Eulerian Video Magnification (EVM) and machine learning to detect micro-motions and anomalies in video streams. Perfect for industrial monitoring, medical analysis, and security applications.

## ✨ Features

- **Eulerian Video Magnification** - Amplify imperceptible motions in videos
- **Real-time Anomaly Detection** - Hybrid rule-based & ML-based detection
- **Interactive Dashboard** - Real-time visualization and analytics
- **Configurable ROI** - Flexible Region of Interest selection
- **Docker Support** - Easy deployment and scaling

## 🏗️ Architecture

**Data Flow**: Video → EVM Pipeline → Signal Processing → Anomaly Detection → Dashboard

- **Backend**: Flask + OpenCV + SciPy
- **Frontend**: React 18 + Vite
- **Deployment**: Docker & Docker Compose

## 📁 Project Structure

```
microanomaly-detection/
├── backend/              # Flask API (Python)
├── frontend/             # React web app
├── data/                 # Videos, models, datasets
├── notebooks/            # Jupyter notebooks
└── docker-compose.yml    # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Automated Setup (Recommended)

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

### Docker Setup (Easiest)

```bash
docker-compose up --build
```

Access the application at `http://localhost:5000`

### Manual Setup

1. **Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install && npm run build
   ```

## 📊 Core Components

| Component | Description |
|-----------|-------------|
| **EVM Pipeline** | Laplacian pyramid decomposition + temporal filtering |
| **Signal Processing** | Motion extraction & feature engineering |
| **Anomaly Detection** | Rule-based & ML-based hybrid detection |
| **Dashboard** | Real-time visualization & analytics |

## ⚙️ Configuration

Edit configuration in `backend/src/utils/config.py` for EVM and detection parameters.

## ✅ Testing

```bash
python test_integration.py
cd backend && python -m pytest tests/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 📞 Support

- Create an issue on GitHub for bugs/features
- Check existing issues for common problems

---

**Built with ❤️ for advanced computer vision applications**
