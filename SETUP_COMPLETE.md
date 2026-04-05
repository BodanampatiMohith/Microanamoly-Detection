# Setup Complete

Use this checklist after cloning the repo or before pushing to GitHub.

## Local Setup

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

## Expected Result

- dashboard loads
- header shows `Backend Connected`
- camera permission prompt appears
- monitoring starts from the right-side control panel

## Before Deployment

Build the frontend into Flask static assets:

```powershell
cd frontend
npm run build
```

## Before Pushing To GitHub

```bash
git status
git add frontend/src/services/api.js README.md QUICK_START.md QUICKSTART.md DEPLOYMENT.md SYSTEM_STATUS.md SETUP_COMPLETE.md PROJECT_SUMMARY.md setup.bat setup.sh backend/static
git commit -m "Finalize backend/frontend connection and docs"
git push origin main
```
