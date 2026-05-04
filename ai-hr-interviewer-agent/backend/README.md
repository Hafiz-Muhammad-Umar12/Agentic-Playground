# AI HR Interviewer Agent Backend

A production-ready FastAPI backend for an AI-driven HR interviewing system utilizing a multi-agent architecture.

## Features
- **Multi-Agent Orchestration**: Specialized agents for interviewing, evaluation, and follow-up.
- **Clean Architecture**: Decoupled layers for scalability and maintainability.
- **Memory Management**: Support for session-based interview context.
- **Extensible LLM Layer**: Interface for multiple LLM providers.

## Getting Started
1. Install dependencies: `pip install -r requirements.txt`
2. Configure environment: Copy `.env.example` to `.env` and fill in your keys.
3. Run the server: `uvicorn app.main:app --reload`
