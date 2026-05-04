<<<<<<< HEAD
# 🤖 WhatsApp AI Support Bot

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet_4-CC785C?style=for-the-badge&logo=anthropic&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Meta_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**An intelligent, production-ready WhatsApp customer support agent powered by Anthropic's Claude AI and Meta's Cloud API.**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Configuration](#-configuration) • [Deployment](#-deployment) • [API Docs](#-api-reference)

</div>

---

## 📌 Overview

WhatsApp AI Support Bot is a fully autonomous customer support system that handles incoming WhatsApp messages using Claude AI. It maintains per-user conversation history, responds intelligently in both **Urdu and English**, and requires zero human intervention for routine queries.

Built for businesses in Pakistan and beyond who want to offer 24/7 WhatsApp support without hiring a full support team.

---

## ✨ Features

- 🧠 **Claude AI Brain** — Powered by Anthropic's `claude-sonnet-4` for intelligent, context-aware replies
- 💬 **Conversation Memory** — Remembers full chat history per user across the session
- 🌐 **Bilingual Support** — Automatically responds in Urdu or English based on customer's language
- ⚡ **Async Architecture** — Built with FastAPI + httpx for high-performance, non-blocking I/O
- 🔒 **Secure Webhook** — Meta webhook verification with token-based security
- 🛡️ **Error Resilient** — Graceful error handling at every layer
- 🧩 **Modular Codebase** — Clean separation of concerns for easy customization
- 🚀 **Production Ready** — Ready to deploy on Railway, Render, or any cloud platform

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FLOW OVERVIEW                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Customer          Meta             Our Server         │
│   WhatsApp   ──►   Cloud    ──►    /webhook (POST)      │
│                    API                    │             │
│                                           ▼             │
│                                   extract_message_data()│
│                                           │             │
│                                           ▼             │
│                                   get_ai_response()     │
│                                    (Claude AI)          │
│                                           │             │
│                                           ▼             │
│                                   send_whatsapp_message()
│                                           │             │
│                                           ▼             │
│   Customer   ◄──   Meta    ◄──    Customer gets reply   │
│   WhatsApp         Cloud                                │
│                    API                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
whatsapp-support-bot/
│
├── app/
│   ├── __init__.py         # Package initializer
│   ├── main.py             # FastAPI app & webhook endpoints
│   ├── agent.py            # Claude AI logic & conversation handler
│   ├── whatsapp.py         # Meta Cloud API integration
│   └── memory.py           # Per-user conversation history store
│
├── config/
│   └── settings.py         # Pydantic settings & environment config
│
├── tests/
│   └── test_agent.py       # Unit tests
│
├── .env                    # 🔒 Secret keys (never commit this!)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web Framework** | FastAPI | Webhook server & REST API |
| **AI Model** | Claude Sonnet 4 (Anthropic) | Intelligent response generation |
| **WhatsApp API** | Meta Cloud API | Message send/receive |
| **HTTP Client** | httpx (async) | Non-blocking API calls |
| **Config** | Pydantic Settings | Type-safe environment variables |
| **Server** | Uvicorn | ASGI production server |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Meta Developer Account ([create here](https://developers.facebook.com))
- Anthropic API Key ([get here](https://console.anthropic.com))
- A public HTTPS URL (use [ngrok](https://ngrok.com) for local dev)

---

### Step 1 — Clone & Setup

```bash
git clone https://github.com/yourusername/whatsapp-support-bot.git
cd whatsapp-support-bot

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### Step 2 — Configure Environment

Create your `.env` file:

```env
# ─── Meta WhatsApp ───────────────────────────────
META_ACCESS_TOKEN=your_meta_permanent_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
WEBHOOK_VERIFY_TOKEN=any_random_secret_string

# ─── Anthropic Claude ────────────────────────────
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> 💡 **Tip:** Generate `WEBHOOK_VERIFY_TOKEN` using any random string generator — this is a secret you choose yourself.

---

### Step 3 — Customize Your Bot

Open `app/agent.py` and update the `SYSTEM_PROMPT` with your business info:

```python
SYSTEM_PROMPT = """
You are a customer support agent for "YOUR BUSINESS NAME".
We are a [describe your business] based in [city].

Our services include:
- [Service 1]
- [Service 2]

Business hours: Monday-Saturday, 9 AM - 6 PM PKT

Always respond in the same language the customer uses.
Keep responses concise — this is WhatsApp, not email.
"""
```

---

### Step 4 — Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

Server is live at: `http://localhost:8000`

Health check:
```bash
curl http://localhost:8000
# {"status": "WhatsApp Bot is running! ✅"}
```

---

### Step 5 — Expose to Internet (Local Dev)

```bash
# Install ngrok and run:
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) — you'll need this for Meta webhook setup.

---

### Step 6 — Setup Meta Webhook

1. Go to [Meta Developer Console](https://developers.facebook.com)
2. Select your app → **WhatsApp** → **Configuration**
3. Set **Webhook URL**: `https://your-ngrok-url.io/webhook`
4. Set **Verify Token**: same as your `WEBHOOK_VERIFY_TOKEN` in `.env`
5. Subscribe to **messages** field
6. Click **Verify and Save**

✅ Your bot is now live!

---

## 🔧 Configuration Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `META_ACCESS_TOKEN` | ✅ | Meta permanent/temporary access token |
| `META_PHONE_NUMBER_ID` | ✅ | WhatsApp Business phone number ID |
| `WEBHOOK_VERIFY_TOKEN` | ✅ | Custom secret for webhook verification |
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic Claude API key |

---

## 📡 API Reference

### `GET /`
Health check endpoint.

**Response:**
```json
{ "status": "WhatsApp Bot is running! ✅" }
```

---

### `GET /webhook`
Meta webhook verification endpoint.

**Query Params:**
| Param | Description |
|-------|-------------|
| `hub.mode` | Must be `subscribe` |
| `hub.verify_token` | Must match your `WEBHOOK_VERIFY_TOKEN` |
| `hub.challenge` | Challenge string returned on success |

---

### `POST /webhook`
Receives incoming WhatsApp messages from Meta.

**Payload:** Meta Cloud API webhook format

**Response:**
```json
{ "status": "ok" }
```

---

## 🌐 Deployment

### Deploy on Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variables in Railway dashboard and you're live! 🎉

---

### Deploy on Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy!

---

## 🧠 How Memory Works

Each user's conversation is stored in-memory using their WhatsApp phone number as the key:

```python
conversation_store = {
    "923001234567": [
        {"role": "user", "content": "Hello, I need help"},
        {"role": "assistant", "content": "Hi! How can I help you today?"},
        ...
    ]
}
```

> ⚠️ **Note:** Memory resets on server restart. For persistent memory across restarts, integrate **Supabase** or **Redis**.

---

## 🔒 Security Best Practices

- Never commit `.env` to Git — it's in `.gitignore` by default
- Use **Meta Permanent Tokens** for production (not temporary ones)
- Rotate your `WEBHOOK_VERIFY_TOKEN` periodically
- Use HTTPS in production — never HTTP
- Validate all incoming webhook payloads

---

## 🛣️ Roadmap

- [ ] Persistent memory with Supabase/Redis
- [ ] Image & document message handling
- [ ] Human handoff when bot can't answer
- [ ] Multi-language support (Arabic, Hindi)
- [ ] Analytics dashboard
- [ ] WhatsApp template messages for proactive outreach
- [ ] Rate limiting per user

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

Built with ❤️ for Pakistani businesses going digital.

---

<div align="center">

**⭐ Star this repo if it helped you!**

</div>
=======
# 🤖 WhatsApp AI Support Bot

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet_4-CC785C?style=for-the-badge&logo=anthropic&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Meta_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**An intelligent, production-ready WhatsApp customer support agent powered by Anthropic's Claude AI and Meta's Cloud API.**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Configuration](#-configuration) • [Deployment](#-deployment) • [API Docs](#-api-reference)

</div>

---

## 📌 Overview

WhatsApp AI Support Bot is a fully autonomous customer support system that handles incoming WhatsApp messages using Claude AI. It maintains per-user conversation history, responds intelligently in both **Urdu and English**, and requires zero human intervention for routine queries.

Built for businesses in Pakistan and beyond who want to offer 24/7 WhatsApp support without hiring a full support team.

---

## ✨ Features

- 🧠 **Claude AI Brain** — Powered by Anthropic's `claude-sonnet-4` for intelligent, context-aware replies
- 💬 **Conversation Memory** — Remembers full chat history per user across the session
- 🌐 **Bilingual Support** — Automatically responds in Urdu or English based on customer's language
- ⚡ **Async Architecture** — Built with FastAPI + httpx for high-performance, non-blocking I/O
- 🔒 **Secure Webhook** — Meta webhook verification with token-based security
- 🛡️ **Error Resilient** — Graceful error handling at every layer
- 🧩 **Modular Codebase** — Clean separation of concerns for easy customization
- 🚀 **Production Ready** — Ready to deploy on Railway, Render, or any cloud platform

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FLOW OVERVIEW                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Customer          Meta             Our Server         │
│   WhatsApp   ──►   Cloud    ──►    /webhook (POST)      │
│                    API                    │             │
│                                           ▼             │
│                                   extract_message_data()│
│                                           │             │
│                                           ▼             │
│                                   get_ai_response()     │
│                                    (Claude AI)          │
│                                           │             │
│                                           ▼             │
│                                   send_whatsapp_message()
│                                           │             │
│                                           ▼             │
│   Customer   ◄──   Meta    ◄──    Customer gets reply   │
│   WhatsApp         Cloud                                │
│                    API                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
whatsapp-support-bot/
│
├── app/
│   ├── __init__.py         # Package initializer
│   ├── main.py             # FastAPI app & webhook endpoints
│   ├── agent.py            # Claude AI logic & conversation handler
│   ├── whatsapp.py         # Meta Cloud API integration
│   └── memory.py           # Per-user conversation history store
│
├── config/
│   └── settings.py         # Pydantic settings & environment config
│
├── tests/
│   └── test_agent.py       # Unit tests
│
├── .env                    # 🔒 Secret keys (never commit this!)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web Framework** | FastAPI | Webhook server & REST API |
| **AI Model** | Claude Sonnet 4 (Anthropic) | Intelligent response generation |
| **WhatsApp API** | Meta Cloud API | Message send/receive |
| **HTTP Client** | httpx (async) | Non-blocking API calls |
| **Config** | Pydantic Settings | Type-safe environment variables |
| **Server** | Uvicorn | ASGI production server |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Meta Developer Account ([create here](https://developers.facebook.com))
- Anthropic API Key ([get here](https://console.anthropic.com))
- A public HTTPS URL (use [ngrok](https://ngrok.com) for local dev)

---

### Step 1 — Clone & Setup

```bash
git clone https://github.com/yourusername/whatsapp-support-bot.git
cd whatsapp-support-bot

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### Step 2 — Configure Environment

Create your `.env` file:

```env
# ─── Meta WhatsApp ───────────────────────────────
META_ACCESS_TOKEN=your_meta_permanent_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
WEBHOOK_VERIFY_TOKEN=any_random_secret_string

# ─── Anthropic Claude ────────────────────────────
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> 💡 **Tip:** Generate `WEBHOOK_VERIFY_TOKEN` using any random string generator — this is a secret you choose yourself.

---

### Step 3 — Customize Your Bot

Open `app/agent.py` and update the `SYSTEM_PROMPT` with your business info:

```python
SYSTEM_PROMPT = """
You are a customer support agent for "YOUR BUSINESS NAME".
We are a [describe your business] based in [city].

Our services include:
- [Service 1]
- [Service 2]

Business hours: Monday-Saturday, 9 AM - 6 PM PKT

Always respond in the same language the customer uses.
Keep responses concise — this is WhatsApp, not email.
"""
```

---

### Step 4 — Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

Server is live at: `http://localhost:8000`

Health check:
```bash
curl http://localhost:8000
# {"status": "WhatsApp Bot is running! ✅"}
```

---

### Step 5 — Expose to Internet (Local Dev)

```bash
# Install ngrok and run:
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) — you'll need this for Meta webhook setup.

---

### Step 6 — Setup Meta Webhook

1. Go to [Meta Developer Console](https://developers.facebook.com)
2. Select your app → **WhatsApp** → **Configuration**
3. Set **Webhook URL**: `https://your-ngrok-url.io/webhook`
4. Set **Verify Token**: same as your `WEBHOOK_VERIFY_TOKEN` in `.env`
5. Subscribe to **messages** field
6. Click **Verify and Save**

✅ Your bot is now live!

---

## 🔧 Configuration Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `META_ACCESS_TOKEN` | ✅ | Meta permanent/temporary access token |
| `META_PHONE_NUMBER_ID` | ✅ | WhatsApp Business phone number ID |
| `WEBHOOK_VERIFY_TOKEN` | ✅ | Custom secret for webhook verification |
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic Claude API key |

---

## 📡 API Reference

### `GET /`
Health check endpoint.

**Response:**
```json
{ "status": "WhatsApp Bot is running! ✅" }
```

---

### `GET /webhook`
Meta webhook verification endpoint.

**Query Params:**
| Param | Description |
|-------|-------------|
| `hub.mode` | Must be `subscribe` |
| `hub.verify_token` | Must match your `WEBHOOK_VERIFY_TOKEN` |
| `hub.challenge` | Challenge string returned on success |

---

### `POST /webhook`
Receives incoming WhatsApp messages from Meta.

**Payload:** Meta Cloud API webhook format

**Response:**
```json
{ "status": "ok" }
```

---

## 🌐 Deployment

### Deploy on Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variables in Railway dashboard and you're live! 🎉

---

### Deploy on Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy!

---

## 🧠 How Memory Works

Each user's conversation is stored in-memory using their WhatsApp phone number as the key:

```python
conversation_store = {
    "923001234567": [
        {"role": "user", "content": "Hello, I need help"},
        {"role": "assistant", "content": "Hi! How can I help you today?"},
        ...
    ]
}
```

> ⚠️ **Note:** Memory resets on server restart. For persistent memory across restarts, integrate **Supabase** or **Redis**.

---

## 🔒 Security Best Practices

- Never commit `.env` to Git — it's in `.gitignore` by default
- Use **Meta Permanent Tokens** for production (not temporary ones)
- Rotate your `WEBHOOK_VERIFY_TOKEN` periodically
- Use HTTPS in production — never HTTP
- Validate all incoming webhook payloads

---

## 🛣️ Roadmap

- [ ] Persistent memory with Supabase/Redis
- [ ] Image & document message handling
- [ ] Human handoff when bot can't answer
- [ ] Multi-language support (Arabic, Hindi)
- [ ] Analytics dashboard
- [ ] WhatsApp template messages for proactive outreach
- [ ] Rate limiting per user

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author
## Hafiz Muhammad Umar Farooq
Built with ❤️ for Pakistani businesses going digital.

---

<div align="center">

**⭐ Star this repo if it helped you!**

</div>
>>>>>>> a72dac81873f3ae2a20e880e0a3ac5fb9dc2887b
