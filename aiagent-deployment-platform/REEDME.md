# 🚀 AgentForge — AI Agent Deployment Platform

> ⚠️ **WORKING IN PROGRESS (ACTIVE DEVELOPMENT PHASE)**  
> This system is currently functional and evolving. Core modules such as agent deployment, Docker-based execution, and API orchestration are operational but continuously improving.

---

## 🧠 Overview

**AgentForge** is a scalable AI Agent Deployment Platform designed to build, deploy, and manage autonomous AI agents using containerized infrastructure.

It enables developers to:
- Dynamically deploy AI agents via API
- Run agents in isolated Docker containers
- Manage full agent lifecycle (deploy, run, stop, logs)
- Integrate with vector databases (Qdrant), caching systems (Redis), and relational databases (MySQL)
- Build production-ready agent pipelines

---

## ⚙️ Tech Stack

### Backend
- FastAPI (High-performance API framework)
- Python 3.11+
- Docker SDK for Python
- AsyncIO (concurrent execution)

### Infrastructure
- Docker Desktop (container runtime)
- MySQL (metadata & persistence)
- Redis (queueing & caching layer)
- Qdrant (vector database for embeddings)

### Frontend (if enabled)
- Next.js
- TypeScript
- React

---

## 🏗️ System Architecture


Client (Frontend / Swagger UI)
↓
FastAPI Backend (AgentForge API)
↓
Deploy Service Layer
↓
Agent Builder (Docker SDK)
↓
Docker Container Runtime
↓
Agent Execution Layer
↓
Redis / MySQL / Qdrant


---

## 📁 Project Structure


aiagent-deployment-platform/
│
├── backend/
│ ├── api/ # API routes (deploy, run, logs)
│ ├── core/ # Docker builder + runtime engine
│ ├── services/ # Business logic layer
│ ├── models/ # Database models
│ ├── utils/ # Helper utilities
│ └── main.py # Application entry point
│
├── frontend/ # Next.js UI (optional)
├── docker/ # Container configs
├── .env # Environment configuration
└── README.md


---

## 🚀 Core Features

### ✅ Implemented
- AI Agent deployment via REST API
- Docker-based isolated execution environment
- Dynamic agent creation from configuration
- Agent lifecycle management
- Basic logging system
- Integration setup for MySQL, Redis, and Qdrant
- Swagger/OpenAPI documentation

### 🔄 In Progress
- Real-time log streaming (WebSocket support)
- Multi-agent orchestration system
- Agent versioning and rollback
- UI dashboard enhancements
- Auto-scaling container system
- Secure agent sandboxing improvements

---

## 🔌 API Reference

### 📦 Deploy Agent
```http
POST /api/v1/deploy
Request Body
{
  "name": "agent-name",
  "framework": "LangGraph",
  "model": "gpt-4o",
  "container_size": "small",
  "config": {}
}
Response
{
  "agent_id": "string",
  "endpoint": "string",
  "status": "running",
  "message": "Agent deployed successfully"
}
▶️ Run Agent
POST /api/v1/run/{agent_id}
📋 List Agents
GET /api/v1/agents
📊 Get Logs
GET /api/v1/logs/{agent_id}
🐳 Docker Setup
Run Qdrant Vector DB
docker run -p 6333:6333 qdrant/qdrant
Run Backend Server
uvicorn backend.main:app --reload
⚙️ Environment Variables
DATABASE_URL=mysql+aiomysql://root:@localhost:3306/agentforge
REDIS_URL=redis://localhost:6379/0

QDRANT_HOST=localhost
QDRANT_PORT=6333
🧪 Example Deployment Request
{
  "name": "test-agent",
  "framework": "LangGraph",
  "model": "gpt-4o",
  "container_size": "small",
  "config": {}
}
⚠️ Known Issues
Docker SDK may fail if environment conflicts exist (e.g. DOCKER_HOST)
Windows Docker Desktop requires correct context (desktop-linux)
Log streaming is still experimental
Container build time may vary depending on system resources
🧠 Design Philosophy

AgentForge is built with the following principles:

Modularity → Each agent runs in isolated containers
Scalability → Designed for multi-agent orchestration
Extensibility → Easily plug new frameworks and models
Production-first mindset → API-driven architecture
🔮 Future Vision
Kubernetes-based auto-scaling deployment
AI Agent marketplace (deploy/share agents)
Multi-tenant SaaS platform
Visual no-code agent builder
Distributed agent execution network
👨‍💻 Developer Notes

This project is part of an Agentic AI + Deployment Infrastructure system, focused on building real-world production-grade AI agent orchestration platforms.

The system is actively evolving and experimental in nature.

📌 Status

🟢 ACTIVE DEVELOPMENT — FUNCTIONAL CORE SYSTEM RUNNING