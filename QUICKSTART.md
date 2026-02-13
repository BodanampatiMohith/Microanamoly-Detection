# Microanomalies Detection - Operator's Guide

## Quick Start

### 1. Start Backend

```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

Backend will start on `http://localhost:5000`

### 2. Start Frontend (New Terminal)

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```

Frontend will start on `http://localhost:3000`

### 3. Open Application

Navigate to: **http://localhost:3000**

## Interface Guide

### Left Panel: Video Feeds

- **Original Webcam**: Shows live webcam with orange ROI box
- **Magnified Feed**: Shows Eulerian Video Magnified output
- **Drag ROI**: Click and drag the orange rectangle to move the region of interest

### Right Panel: Dashboard

#### Status Widget (Top)
- **Large Display**: Shows NORMAL or ABNORMAL
- **Color**: Teal = Normal, Red = Abnormal
- **Stability Index**: Gauge (0-100%) indicating system stability

#### Feature Cards (Middle)
Real-time measurements:
- **Dominant Frequency**: Primary vibration frequency (Hz)
- **RMS Motion**: Root Mean Square motion amplitude
- **Variance**: Signal variability
- **Peak-to-Peak**: Maximum swing amplitude
- **Spectral Entropy**: Frequency content randomness
- **Motion Energy**: Average motion intensity

#### Energy Distribution (Bottom)
Spectral energy breakdown:
- **Low (0-5 Hz)**: Percentage in low frequency band
- **Mid (5-20 Hz)**: Percentage in mid frequency band
- **High (20-50 Hz)**: Percentage in high frequency band

### Controls (Bottom Right)

- **ROI Position X/Y**: Adjust region coordinates
- **Width/Height**: Adjust region size
- **Reset System**: Clear all buffers and restart detection

## Typical Operations

### Establishing Baseline (Normal Operation)

1. **Mount stable reference part** (motor, pump, fan, etc.)
2. **Run at normal operating conditions** for 30-60 seconds
3. **Observe metrics**:
   - Dominant frequency should stabilize around 5-15 Hz
   - Stability Index should be > 0.7 (green, "NORMAL")
   - RMS motion should be low and consistent

### Inducing Faults

#### Imbalance
- **Action**: Add small weight to rotating part
- **Expected Response**:
  - RMS increases significantly
  - Stability Index drops (red, "ABNORMAL")
  - Dominant frequency remains similar

#### Loosened Bolt
- **Action**: Loosen a structural bolt slightly
- **Expected Response**:
  - Frequency shift (dominant freq increases/decreases)
  - Variance increases
  - Stability Index drops

#### Speed Change
- **Action**: Increase/decrease operating speed
- **Expected Response**:
  - Dominant frequency changes proportionally
  - Other metrics may shift
  - Anomaly index depends on deviation from baseline

## Troubleshooting

### "Cannot connect to backend"
- Ensure Flask is running: `python backend/app.py`
- Check port 5000 is available
- Firewall may be blocking: Add exception for localhost:5000

### Webcam not working
- Check browser permissions (allow camera access)
- Ensure webcam is not in use by other application
- Try HTTPS or different browser if using HTTP

### Video feed is laggy
- Reduce video resolution in browser settings
- Lower frame capture frequency (increase interval)
- Reduce EVM pyramid levels (config.py)

### Incorrect anomaly detection
- **Too sensitive** (false positives): Raise threshold in config.py
- **Too insensitive** (false negatives): Lower threshold
- Collect your machine's normal data and retrain ML model

### Magnified feed looks distorted
- May be normal at high amplifications (20x+)
- Reduce amplification in config if needed
- Check ROI is on consistent background/feature

## Configuration Adjustments

Edit `backend/src/utils/config.py`:

### EVM Parameters
```python
EVM_CONFIG = {
    "amplification_factor": 20,  # Lower = subtler, Higher = more visible
    "cutoff_freq_low": 3,        # Hz - lower bound of interest
    "cutoff_freq_high": 30,      # Hz - upper bound of interest
    "num_levels": 4,             # Pyramid levels (3-5), higher = slower
}
```

### Anomaly Detection
```python
ANOMALY_CONFIG = {
    "rms_reference": 0.5,        # Your machine's normal RMS
    "normal_threshold": 0.6,     # Stability index threshold (0-1)
}
```

## Data Collection

### Recording Sessions
Videos are saved to `data/recordings/` for later analysis.

To enable recording, modify `app.py` to save base64 streams.

### Feature Export
Features are available via API response. To save for ML training:

```bash
# Mock script (customize as needed)
python -c "
import json
from src.signal.features import FeatureExtractor

# Extract and save features to CSV/JSON
"
```

## Performance Notes

- **CPU Usage**: Moderate (~40-60% on modern laptop)
- **Memory**: ~300-500 MB
- **Latency**: ~100-150ms per frame
- **Throughput**: ~10 FPS capture, process every 100ms

For slower machines:
- Reduce resolution to 480x360
- Set amplification to 10-15
- Use num_levels = 3

## Safety

⚠️ **When testing with machinery:**
- Secure all parts before inducing faults
- Start with minimal load/speed
- Have emergency stop available
- Never place fingers near rotating parts
- Wear appropriate PPE

## Advanced Usage

### Training ML Model
```bash
cd backend
python -m src.anomaly.train_model \
  --normal-data ../data/recordings/normal \
  --abnormal-data ../data/recordings/abnormal \
  --model-type svm \
  --output ../data/models/anomaly_model.pkl
```

### Using Different Cameras
To use specific camera:
```javascript
// In VideoCapture.jsx, modify:
const constraints = {
  video: {
    deviceId: { exact: "camera-id" }
  }
};
```

### REST API Direct Access
```bash
# Process frame
curl -X POST http://localhost:5000/api/process_frame \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_data","roi":{"x":100,"y":100,"width":200,"height":200}}'

# Get statistics
curl http://localhost:5000/api/statistics
```

## Contact & Support

For issues:
1. Check logs: `backend/logs/app.log`
2. Review terminal output for error messages
3. Check GitHub issues section
4. Contact development team with:
   - Error message
   - Steps to reproduce
   - Configuration used
   - System specifications

---

**Happy vibration analysis! 🎯**
