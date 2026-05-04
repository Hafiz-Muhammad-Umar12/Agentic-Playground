# 🧠 Autonomous GitHub PR Fix Agent

An **AI-powered production-grade system** that automatically analyzes GitHub Pull Requests, detects issues, and posts intelligent code review comments using LLMs, Redis queueing, and background workers.

---

## 🎥 Live Demo

![Demo](./assets/Demo.gif)

## 🚀 Overview

The **Autonomous GitHub PR Fix Agent** is an event-driven AI system that listens to GitHub webhooks, processes incoming Pull Requests asynchronously, and generates intelligent code reviews using AI.

It is designed with a **scalable, production-style architecture** using:

* ⚡ FastAPI (API Layer)
* 🧠 Gemini / LLM (AI Code Reviewer)
* 🧵 Redis + ARQ (Queue System)
* 🗄️ SQLAlchemy (Persistent Database)
* 🔁 Background Workers (Async Processing)

---

## 🏗️ System Architecture

```
GitHub PR Event
      ↓
FastAPI Webhook Endpoint
      ↓
Security Verification (HMAC)
      ↓
Database (Store PR status: pending)
      ↓
Redis Queue (ARQ Job)
      ↓
Background Worker
      ↓
GitHub API (Fetch PR Diff)
      ↓
LLM (Gemini AI Review)
      ↓
GitHub PR Comment
      ↓
Database Update (completed)
```

---

## ⚙️ Key Features

### 🔄 Event-Driven Architecture

* GitHub webhook triggers system automatically
* Fully asynchronous processing

### 🧠 AI Code Review Engine

* Uses LLM (Gemini) for intelligent analysis
* Detects bugs, security issues, and improvements

### ⚡ Background Processing

* Redis + ARQ queue system
* Non-blocking API design

### 🗄️ Persistent Tracking

* SQLAlchemy database stores PR states:

  * pending
  * processing
  * completed
  * failed

### 🔐 Security Layer

* GitHub webhook signature verification (HMAC)

---

## 📁 Project Structure

```
src/
│
├── api/
│   └── routes.py          # FastAPI endpoints (webhook entry)
│
├── services/
│   └── orchestrator.py    # Core workflow manager
│
├── worker.py              # ARQ background worker
│
├── models/
│   └── db.py              # Database models (SQLAlchemy)
│
├── github/
│   └── client.py          # GitHub API integration
│
├── ai/
│   └── reviewer.py       # LLM prompt + analysis logic
│
└── config.py             # Environment configuration
```

---

## 🧪 How It Works (Flow Explanation)

1. Developer opens or updates a Pull Request on GitHub
2. GitHub sends webhook event to FastAPI server
3. System verifies webhook signature (security check)
4. PR data is stored in database (status: pending)
5. Job is pushed into Redis queue
6. Worker picks job from queue
7. Worker fetches PR diff from GitHub
8. AI analyzes code and generates review
9. System posts comment back to GitHub PR
10. Database updated to completed

---

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Initialize Database

```bash
python init_db.py
```

---

### 4. Start Redis

Using Docker:

```bash
docker run -p 6379:6379 redis
```

---

### 5. Run FastAPI Server

```bash
uvicorn src.main:app --reload
```

---

### 6. Start Background Worker

```bash
arq src.worker.WorkerSettings
```

---

## 🔌 Environment Variables

Create `.env` file:

```
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=your_secret
GEMINI_API_KEY=your_ai_key
DATABASE_URL=sqlite:///./db.sqlite3
REDIS_URL=redis://localhost:6379
```

---

## 🧠 Tech Stack

* **Backend:** FastAPI
* **AI:** Gemini / LLM API
* **Queue:** Redis + ARQ
* **Database:** SQLite / PostgreSQL (SQLAlchemy)
* **Async Processing:** Python Workers
* **Integration:** GitHub REST API + Webhooks

---

## 📊 Why This Project is Powerful

This project demonstrates:

* Distributed system design
* Event-driven architecture
* AI agent orchestration
* Real-world DevOps automation
* Scalable backend engineering

---

## 🔥 Future Improvements

* Multi-agent review system (Security Agent, Performance Agent)
* Docker + Kubernetes deployment
* Observability (logging, metrics, tracing)
* Retry + Dead Letter Queue (DLQ)
* Web dashboard for PR tracking

---

## 📌 Use Case

* Automated code review for teams
* AI DevOps assistant
* GitHub workflow automation
* SaaS product foundation

---

## 👨‍💻 Author

Built as an **Agentic AI Engineering Project** demonstrating production-grade AI system design and backend architecture skills.

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and share feedback!

---

🚀 *“From PR to AI-reviewed code — fully automated.”*
