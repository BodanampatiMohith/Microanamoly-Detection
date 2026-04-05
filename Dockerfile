FROM node:18-slim AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
ENV VITE_BUILD_OUT_DIR=../backend/static
RUN npm run build

FROM python:3.10-slim

WORKDIR /app/backend

RUN apt-get update && apt-get install -y \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=frontend-builder /app/backend/static ./static

EXPOSE 7860

CMD ["sh", "-c", "gunicorn -w 2 -b 0.0.0.0:${PORT:-7860} app:app"]
