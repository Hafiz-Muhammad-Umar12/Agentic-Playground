# Technical Architecture: AI Startup Builder

This document provides a deep dive into the engineering decisions and architectural patterns implemented in the AI Startup Builder.

## 🏛️ System Design Overview

The application is built as a **Distributed Task-Oriented System**. It separates volatile, long-running AI computations from the low-latency API layer using an asynchronous message-passing architecture.

### 1. High-Performance API (FastAPI)
The API layer is built with FastAPI, utilizing its asynchronous capabilities to handle concurrent connections efficiently. It serves three primary roles:
- **State Management**: Storing and retrieving user/project data via PostgreSQL.
- **Task Delegation**: Offloading complex pipelines to Celery.
- **Artifact Serving**: Providing secure access to generated project scaffolds.

### 2. Distributed Execution (Celery + Redis)
To handle the non-deterministic latency of LLM providers, we utilize Celery:
- **Decoupling**: The API responds immediately with a `task_id`, while the worker processes the pipeline in the background.
- **Resilience**: Implemented exponential backoff retries for LLM call failures.
- **Concurrency**: Multiple workers can scale horizontally to handle increased generation load.

### 3. Agentic Pipeline Logic
The core "intelligence" resides in a sequential multi-agent workflow:
- **Contextualization (RAG)**: The pipeline begins by querying **Qdrant** for similar past projects, providing the agents with relevant historical context.
- **Agent Roles**: Each agent (Idea, Market, Validation) is configured with a strict system persona and output schema to minimize hallucinations and maximize business utility.

### 4. Persistence & Memory
- **Relational (PostgreSQL)**: Stores structured data (Users, Project metadata, Agent output text).
- **Vector (Qdrant)**: Stores high-dimensional embeddings of refined ideas for semantic retrieval.
- **File System**: Local storage for generated ZIP archives, organized by `project_id`.

## ⚙️ Engineering Decisions

| Decision | Rationale |
| :--- | :--- |
| **Async SQLAlchemy** | Prevents blocking the event loop during heavy I/O, critical for FastAPI performance. |
| **Pydantic V2** | Ensures strict data validation and automated OpenAPI schema generation. |
| **FastEmbed** | Local CPU-optimized embedding generation, reducing latency and external API costs. |
| **Header-based Auth** | Simplified for portfolio visibility while maintaining data isolation principles. |

## 🛠️ Pipeline Execution Flow

1. **Ingress**: User submits a concept via the Dashboard.
2. **Persistence**: The concept is logged in PostgreSQL.
3. **Queueing**: A Celery task is dispatched to the Redis broker.
4. **Execution**:
    - Query Qdrant for semantic neighbors.
    - Run Orchestrator stage 1-3.
    - Write physical files to disk using `aiofiles`.
    - Upsert new refined idea into Qdrant.
5. **Completion**: Task status is marked as `SUCCESS` in Redis; ZIP is ready for download.
