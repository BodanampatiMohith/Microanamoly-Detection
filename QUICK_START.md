# Quick Start

This gets the full app running locally with a working frontend-to-backend connection.

## 1. Start the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Expected backend URL:

```text
http://127.0.0.1:5000
```

## 2. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Expected frontend URL:

```text
http://localhost:3000
```

## 3. Verify the connection

Open `http://localhost:3000`.

You should see:

- the professional dashboard layout
- a `Backend Connected` badge in the header
- the raw video panel ready for camera input
- monitoring controls on the right

## 4. Start monitoring

1. Allow camera access in the browser.
2. Click `Start Monitoring`.
3. Watch the raw feed, magnified feed, waveform, and FFT panels update.

## If the backend does not connect

Check these in order:

1. `http://127.0.0.1:5000/api/health` should return JSON.
2. Flask should be running in the `backend` terminal.
3. The frontend should be running on `http://localhost:3000`.
4. If you changed the backend host, set `VITE_API_BASE_URL`.

## Production note

For deployment, frontend-only is not enough for the real app.

You need:

- the frontend UI
- the Flask backend API and processing pipeline

The recommended production setup is a single deployment using the root `Dockerfile`, which serves both together at `http://localhost:5000`.
