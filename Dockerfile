# ==============================================================================
# SatoshiTrace — 100% Offline Linux Container
# Smart India Hackathon (SIH 2026) | Problem Statement ID: SIH26146
# ==============================================================================

FROM python:3.12-slim-bookworm

# Install system dependencies, Node.js 20 & curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install python packages
COPY satoshitrace/backend/requirements.txt /app/satoshitrace/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/satoshitrace/backend/requirements.txt

# Copy frontend package manifests and install
COPY sato/package.json sato/package-lock.json /app/sato/
WORKDIR /app/sato
RUN npm install --prefer-offline --no-audit

WORKDIR /app

# Copy full application codebase
COPY . /app/

EXPOSE 8000 8080

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0

# Start both services
CMD ["bash", "-c", "python3 -m uvicorn satoshitrace.backend.main:app --host 0.0.0.0 --port 8000 & (cd sato && npm run dev -- --port 8080 --host 0.0.0.0)"]
