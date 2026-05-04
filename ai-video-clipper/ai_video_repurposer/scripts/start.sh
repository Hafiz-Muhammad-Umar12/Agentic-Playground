#!/bin/bash
# ─── AI Video Repurposer PRO — Quick Start Script ─────────────

set -e

echo "🎬 AI Video Repurposer PRO"
echo "================================"

# Check dependencies
command -v ffmpeg >/dev/null 2>&1 || { echo "❌ ffmpeg not found. Install: sudo apt install ffmpeg"; exit 1; }
command -v redis-cli >/dev/null 2>&1 || { echo "❌ redis not found. Install: sudo apt install redis-server"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ python3 not found"; exit 1; }

echo "✅ System dependencies OK"

# Setup virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install requirements
echo "📦 Installing Python packages..."
pip install -r requirements.txt -q

# Copy .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created .env from .env.example — add your API keys!"
fi

# Create temp dir
mkdir -p /tmp/video_repurposer

echo ""
echo "🚀 Starting services..."
echo ""
echo "1. Start Redis:     redis-server"
echo "2. Start Celery:    celery -A app.workers.celery_app worker --loglevel=info"
echo "3. Start API:       uvicorn app.main:app --reload --port 8000"
echo ""
echo "📖 API Docs: http://localhost:8000/docs"
echo "🌸 Flower:   http://localhost:5555"
echo ""

# Start API in foreground
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
