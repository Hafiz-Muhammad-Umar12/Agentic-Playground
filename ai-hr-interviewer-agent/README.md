# 🧠 AI HR Interviewer Agent

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![LLM](https://img.shields.io/badge/LLM-Powered-orange)
![Architecture](https://img.shields.io/badge/Type-Agentic_AI-purple)
![Status](https://img.shields.io/badge/Status-Active-success)

An **Agentic AI-powered HR Interviewer System** that autonomously conducts technical and behavioral interviews, evaluates candidate responses, and generates structured hiring insights using Large Language Models (LLMs).

This project simulates a real-world **AI Hiring Agent** instead of a simple chatbot — capable of reasoning, adapting, and making decisions like a human interviewer.

---

## 🚀 What This Project Does

- Understands job role requirements  
- Generates structured interview questions  
- Conducts dynamic conversational interviews  
- Asks intelligent follow-up questions  
- Evaluates candidate responses using LLM reasoning  
- Produces final hiring recommendation reports  

---

## 🧠 Core Capabilities

- Autonomous interview conduction (Agent-based system)  
- Context-aware conversation memory  
- Role-specific question generation  
- AI-based scoring & evaluation system  
- Multi-step reasoning workflow  
- Structured HR decision reports  
- FastAPI backend  

---

## 🏗️ System Architecture

User → Interview Agent → Question Generator → Conversation Engine → Evaluation Agent → HR Report

---

## 🧩 Tech Stack

- FastAPI  
- Python 3.10+  
- OpenAI / Gemini (LLMs)  
- Agentic AI Architecture  
- PostgreSQL (optional)  
- Qdrant (optional)  

---

## ⚙️ Setup

```bash
git clone https://github.com/Hafiz-Muhammad-Umar12/Agentic-Playground.git
cd ai-hr-interviewer-agent
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 📡 API

- POST /start-interview  
- POST /submit-answer  
- GET /evaluation/{id}  

---

## 🧠 How It Works

1. Select job role  
2. AI generates interview plan  
3. Conducts interview dynamically  
4. Evaluates answers  
5. Generates HR report  

---

## 📊 Example Output

{
  "candidate": "Umar",
  "role": "Backend Engineer",
  "score": 8.6,
  "recommendation": "Hire"
}

---

## 👨‍💻 Author

Muhammad Umar  
GitHub: https://github.com/Hafiz-Muhammad-Umar12

---

## ⭐ License

MIT License
