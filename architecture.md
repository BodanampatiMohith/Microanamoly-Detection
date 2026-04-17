# Microanomalies Detection Architecture

This document describes the current, working architecture of the system with Mermaid diagrams and plain-language explanations.

## 1) System Context

```mermaid
flowchart LR
    User[Operator in Browser]\nReactApp[React Frontend\nVite Build]
    Camera[Webcam\nMediaDevices API]
    Flask[Flask API\nbackend/app.py]
    EVM[Motion Pipeline\nEVM + Signal + Features]
    Detectors[Anomaly Detectors\nRule-based + Optional ML]
    Telemetry[Telemetry Store\nIn-memory history + aggregates]

    User --> ReactApp
    Camera --> ReactApp
    ReactApp -->|POST /api/process_frame| Flask
    ReactApp -->|GET /api/health\nGET /api/runtime/evm\nPOST /api/runtime/evm\nPOST /api/roi\nPOST /api/reset| Flask
    Flask --> EVM
    EVM --> Detectors
    Detectors --> Flask
    Flask --> Telemetry
    Telemetry --> Flask
    Flask --> ReactApp
```

Explanation:
- The browser captures webcam frames and sends them to the Flask API.
- Flask runs EVM motion magnification, feature extraction, and anomaly scoring.
- Results are returned to React for live charts, status cards, and controls.
- Telemetry is persisted in memory for summary and trend endpoints.

## 2) Frontend Component Architecture

```mermaid
flowchart TD
    App[App.jsx\nErrorBoundary + Global Styles] --> Home[pages/Home.jsx\nState + API orchestration]

    Home --> VideoCapture[components/VideoCapture.jsx\nWebcam frame capture]
    Home --> Dashboard[components/ProfessionalDashboard.jsx\nMain UI layout]
    Home --> Perf[components/PerformanceMonitor.jsx\nOptional panel]

    Dashboard --> Gauge[StabilityGauge.jsx]
    Dashboard --> Waveform[WaveformChart.jsx]
    Dashboard --> Spectrum[SpectrumAnalyzer.jsx]

    Home --> ApiSvc[services/api.js\nAPI base fallback + requests]
    ApiSvc --> BackendAPI[/Flask API/]
```

Explanation:
- `Home.jsx` is the state container for monitoring state, runtime settings, errors, and chart data.
- `VideoCapture` captures frames on an interval and pushes them to `Home`.
- `ProfessionalDashboard` renders video outputs, KPI cards, controls, and charts.
- `api.js` handles endpoint fallback (`/api`, localhost variants) and response validation.

## 3) Backend Processing Pipeline

```mermaid
flowchart TD
    Req[POST /api/process_frame\nimage + optional ROI] --> Validate[Input Validation\nbase64 + dimensions + ROI]
    Validate --> Decode[Decode image to OpenCV frame]
    Decode --> ExtractROI[Extract ROI from frame]
    ExtractROI --> EvmProc[EVM Pipeline\nTemporal filtering + amplification]
    EvmProc --> Motion[Motion signal extraction]
    Motion --> Features[Feature extraction\ntime + frequency domain]
    Features --> RuleDetect[Rule-based detector]
    Features --> MLDetect[Optional ML detector\nif model exists]
    RuleDetect --> Response[Compose API response\nframes + metrics + statuses]
    MLDetect --> Response
    Response --> TelemetryWrite[Store telemetry sample]
    TelemetryWrite --> Return[Return JSON payload]
```

Explanation:
- Validation is done before expensive compute steps.
- ROI extraction limits processing to the selected area.
- The response includes magnified frame, ROI frame, feature metrics, anomaly status, and timing.

## 4) Live Monitoring Sequence

```mermaid
sequenceDiagram
    participant Browser as React UI
    participant Capture as VideoCapture
    participant API as Flask /api/process_frame
    participant Pipeline as EVM + Features + Detection

    loop While monitoring is ON
        Capture->>Browser: JPEG frame (base64)
        Browser->>API: POST frame + ROI
        API->>Pipeline: validate -> process frame
        Pipeline-->>API: metrics + anomaly + magnified frame
        API-->>Browser: JSON response
        Browser->>Browser: update waveform, spectrum, KPIs, video panels
    end
```

Explanation:
- The frame loop is controlled in the frontend (`isMonitoring`).
- Each successful response updates all real-time widgets.
- If validation fails, API returns a 400 error and UI shows an error banner.

## 5) Monitoring Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Booting
    Booting --> BackendDisconnected: health check failed
    Booting --> Ready: health check ok

    BackendDisconnected --> Ready: backend recovers
    Ready --> Monitoring: Start Monitoring
    Monitoring --> Ready: Stop Monitoring

    Monitoring --> ErrorState: process_frame error
    Ready --> ErrorState: invalid runtime update
    ErrorState --> Ready: successful retry/reset

    Ready --> Resetting: Reset System
    Monitoring --> Resetting: Reset System
    Resetting --> Ready: reset complete
```

Explanation:
- The UI can start/stop monitoring only when backend health is good.
- Errors are recoverable through retry or reset.
- Reset clears runtime buffers/history and returns to a clean state.

## 6) Validation Rules

```mermaid
flowchart LR
    ROIIn[ROI input] --> ROIVal{ROI valid?}
    ROIVal -->|No| ROIErr[400: ROI bounds/type error]
    ROIVal -->|Yes| ROIApply[Apply ROI]

    EVMIn[EVM runtime payload] --> EVMVal{Valid ranges?}
    EVMVal -->|No| EVMErr[400: parameter validation error]
    EVMVal -->|Yes| EVMApply[Update amplification/frequency/sampling]

    FrameIn[Frame payload] --> FrameVal{Base64 + size valid?}
    FrameVal -->|No| FrameErr[400: invalid frame]
    FrameVal -->|Yes| FrameApply[Run processing pipeline]
```

Key enforced ranges:
- ROI: `x >= 0`, `y >= 0`, `50 <= width <= 640`, `50 <= height <= 480`
- Amplification: `1..100`
- Frequency band: `0.1 <= low <= 120`, `0.2 <= high <= 150`, and `high > low`
- Sampling rate: `1..240 FPS`

## 7) Deployment View

```mermaid
flowchart LR
    subgraph Client
        Browser[Browser\nReact SPA]
    end

    subgraph Server
        FlaskApp[Flask app.py]
        Static[backend/static\nVite build output]
    end

    Browser -->|HTTP /| FlaskApp
    FlaskApp --> Static
    Browser -->|HTTP /api/*| FlaskApp
```

Explanation:
- In production, Flask serves the built frontend and API from one host.
- In development, Vite dev server can proxy `/api` to Flask.

## 8) Data Contract (Core Response)

```mermaid
classDiagram
    class ProcessFrameResponse {
      +string status
      +int frame_index
      +string timestamp
      +float processing_time_ms
      +string magnified_frame
      +string roi_frame
      +object anomaly_detection
      +object ml_detection
      +object features
      +object motion_signal
      +object evm_meta
    }

    class AnomalyDetection {
      +string status
      +float anomaly_index
      +bool is_normal
    }

    class FeaturePayload {
      +float dominant_frequency
      +float rms
      +float variance
      +float peak_to_peak
      +float spectral_entropy
      +array spectrum_points
      +float energy_ratio_low
      +float energy_ratio_mid
      +float energy_ratio_high
    }

    ProcessFrameResponse --> AnomalyDetection
    ProcessFrameResponse --> FeaturePayload
```

Explanation:
- The frontend depends on this payload for charts, metric cards, and status badges.
- `spectrum_points` powers FFT visualization.
- `anomaly_detection` and timing fields drive operational decisions.
