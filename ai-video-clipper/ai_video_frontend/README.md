# 🎬 ClipForge AI — Frontend

React + Vite frontend for the AI Video Repurposer PRO backend.

## Stack

- **React 18** + React Router v6
- **Vite** (dev server + build)
- **Tailwind CSS** (utility styling)
- **Framer Motion** (animations)
- **Zustand** (state management)
- **Axios** (API calls)
- **react-dropzone** (file uploads)
- **react-hot-toast** (notifications)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL to point to your backend

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. Build for production
npm run build
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | All jobs + stats |
| `/submit` | Submit YouTube URL or upload file |
| `/job/:jobId` | Real-time job tracking + clip results |

## Backend Connection

Make sure the FastAPI backend is running on `http://localhost:8000`.

The Vite dev server proxies `/api/*` to the backend automatically.

For production, set `VITE_API_URL` to your backend URL.

## Features

- 🔐 JWT authentication (login/register)
- 📺 YouTube URL submission
- 📁 Video file drag & drop upload
- 🎯 Platform selection (TikTok / Reels / YT Shorts)
- ⚡ Real-time job progress polling (every 3s)
- 📊 Viral score display per clip
- 📋 One-click caption copy
- ⬇️ Direct clip download (presigned S3 URL)
- 📱 Fully responsive
