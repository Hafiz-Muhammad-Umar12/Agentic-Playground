# 🤖 Claudi — AI CLI Agent

> A blazing-fast, Gemini-style AI CLI agent powered by **Groq LLaMA 3.3 70B** — fully streaming, fully free, and built for developers.

---

## ⚡ Overview

Claudi is a powerful terminal-based AI assistant that helps you code, explore files, search the web, and automate tasks — directly from your CLI.

Built with performance, simplicity, and developer experience in mind.

---

## 👤 Author

* Hafiz Muhammad Umar Farooq  
*Agentic AI Developer • Open Source Builder*



## ✨ Features

* 💬 **Multi-turn conversations** with memory support
* 📁 **File system access** (read/write files safely)
* 📂 **Directory exploration** (navigate projects easily)
* 🌐 **Web search integration** (DuckDuckGo-powered)
* ⚡ **Streaming responses** (real-time AI output via Groq)
* 🎨 **Beautiful terminal UI** (colorful & structured output)
* 🔐 **Secure API key storage** (auto-saved locally)
* 🚀 **Fast inference** (powered by LLaMA 3.3 70B)

---

## 📦 Installation

```bash
npm install -g claudi
```

---

## 🚀 Getting Started

Run the CLI:

```bash
claudi
```

On first run, you will be prompted to enter your **Groq API key**.

👉 Get your free API key: [https://console.groq.com](https://console.groq.com)

---

## 💬 CLI Commands

| Command    | Description                  |
| ---------- | ---------------------------- |
| `/help`    | Show available commands      |
| `/clear`   | Clear conversation history   |
| `/history` | View chat history            |
| `/model`   | Display active AI model info |
| `/reset`   | Reset stored API key         |
| `/exit`    | Exit CLI safely              |

---

## 🧠 Example Prompts

```bash
list files in current directory

read package.json and explain it

create a Node.js server with Express

search latest AI news

write a script to rename all .txt files
```

---

## 🔑 API Key Management

Reset or update your API key anytime:

```bash
claudi --reset
```

---

## 🏗️ Architecture

* **Runtime:** Node.js 18+
* **Language:** TypeScript
* **AI Model:** LLaMA 3.3 70B (Groq API)
* **Search Engine:** DuckDuckGo
* **UI Library:** Chalk (terminal styling)

---

## 📁 Project Capabilities

Claudi can:

* Execute safe file operations
* Analyze codebases
* Generate scripts and automation tools
* Assist in debugging
* Provide real-time web insights

---

## ⚠️ Safety Notes

* File operations are restricted to current working directory
* No system-level destructive commands are executed
* User confirmation is required for critical actions

---

## 📄 License

MIT License © 2026 Claudi Project

---

## 🌟 Why Claudi?

Claudi brings **AI directly into your terminal** — no browser, no distractions, just pure productivity.
