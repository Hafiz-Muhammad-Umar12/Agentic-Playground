# 🎬 AI Video Repurposer PRO (Enterprise)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Celery](https://img.shields.io/badge/Worker-Celery-37814A?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![FFmpeg](https://img.shields.io/badge/Processing-FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**AI Video Repurposer PRO** is a production-grade multi-agent system designed to transform long-form video content into viral short-form assets (TikTok, Reels, Shorts). Powered by a specialized multi-agent architecture, it handles everything from viral moment detection to subtitle burning and cloud deployment.

---

## 🏗️ Multi-Agent Architecture

The system operates as a distributed pipeline of specialized agents:

1.  **Transcription Agent:** High-fidelity speech-to-text using OpenAI Whisper / Deepgram with word-level timestamps.
2.  **Insight Agent:** Utilizes LLMs (Gemini 1.5 Pro / Claude 3) to analyze transcripts for viral patterns, emotional peaks, and high-retention "hooks."
3.  **Clipping Agent:** Precision FFmpeg engine for frame-accurate cutting, aspect ratio normalization (9:16), and resolution upscaling.
4.  **Caption Agent:** Dynamic SRT generation and hard-coded subtitle burning with custom branding and styling.
5.  **Storage Agent:** Seamless integration with Cloudinary/S3 for distributed asset delivery.

---

## 🚀 Key Features

- **🎯 Viral Scoring Engine:** Every clip is assigned a 1–100 score based on engagement probability.
- **⚡ Async Processing:** Distributed task queue powered by Celery + Redis for high-concurrency workloads.
- **🌍 Global Subtitles:** Automated translation from English to Urdu, Hindi, and 20+ other languages.
- **📱 Platform Presets:** Native optimization for TikTok, Instagram Reels, and YouTube Shorts.
- **🔒 Enterprise Security:** JWT-based authentication and secure cloud storage integrations.

---

## 🖼️ Product Showcases

<div align="center">
  <img src="ai-video-clipper/ai_video_repurposer/assets/processing.png" width="30%" alt="User Authentication"/>
  <img src="assests/processing.png" width="30%" alt="AI Processing Pipeline"/>
  <img src="assests/setting.png" width="30%" alt="Agent Configurations"/>
</div>

<p align="center">
  <i>User Authentication • AI Processing Dashboard • Intelligent Agent Settings</i>
</p>

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | FastAPI (Asynchronous Python 3.11+) |
| **Task Queue** | Celery + Redis (Reliable Background Processing) |
| **Core AI** | Google Gemini 1.5 Pro / OpenAI GPT-4o |
| **Speech-to-Text** | OpenAI Whisper (Large-v3) / Deepgram |
| **Video Engine** | FFmpeg (Native C-bindings via Subprocess) |
| **Database** | PostgreSQL / MySQL (via SQLAlchemy 2.0) |
| **Cloud Storage** | Cloudinary / AWS S3 |

---

## ⚡ Quick Start (Production Setup)

### 1. Environment Configuration
```bash
git clone https://github.com/yourusername/ai-video-repurposer-pro.git
cd ai-video-repurposer-pro

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Infrastructure Setup
```bash
# Ensure Redis and your DB (PostgreSQL/MySQL) are running
docker-compose up -d redis db
```

### 3. Initialize Database
```bash
cp .env.example .env
# Configure your .env with Gemini/OpenAI/Cloudinary keys
alembic upgrade head
```

### 4. Orchestration
```bash
# Terminal 1: API Server
uvicorn app.main:app --reload --port 8000

# Terminal 2: Background Worker
celery -A app.workers.tasks worker --loglevel=info -Q video
```

---

## 📡 API Documentation

### `POST /api/v1/repurpose/submit`
Dispatches a new repurposing job to the worker cluster.

**Payload:**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "platforms": ["tiktok", "reels"],
  "language": "en",
  "max_clips": 5
}
```

### `GET /api/v1/repurpose/status/{job_id}`
Returns real-time processing progress (0-100%) and current agent state.

---

## 🗂️ Project Organization

```text
app/
├── agents/       # Logic for specialized AI/Video agents
├── api/          # FastAPI route definitions & dependencies
├── core/         # Config, Security, and Database engines
├── models/       # SQLAlchemy 2.0 ORM schemas
├── services/     # Third-party integrations (S3, Cloudinary, AI)
├── workers/      # Celery task definitions & app config
└── main.py       # Application entry point
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
**Maintained by [Your Name/Organization]**
