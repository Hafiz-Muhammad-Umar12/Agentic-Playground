# 👻 GhostTrack Dashboard — React Frontend

Dark tactical real-time tracking dashboard with live map, WebSocket feed,
device management, event log, and battery/speed stats overlay.

---

## 🗂 Structure

```
frontend/
├── public/index.html
└── src/
    ├── App.js                    ← Router + Protected routes
    ├── index.js                  ← Entry point + global styles
    ├── pages/
    │   ├── Login.jsx             ← Signup/Login with JWT
    │   └── Dashboard.jsx         ← Main tracking interface
    ├── components/
    │   ├── MapView.jsx           ← Leaflet map with live marker + trail
    │   └── DeviceCard.jsx        ← Device status card
    ├── services/
    │   └── api.js                ← All Axios API calls
    ├── socket/
    │   └── socket.js             ← WebSocket manager
    └── context/
        └── AuthContext.jsx       ← Auth state + JWT management
```

---

## ⚡ Quick Start

```bash
cd frontend
cp .env.example .env        # configure backend URL if needed
npm install
npm start                   # opens http://localhost:3000
```

---

## 🔌 Environment Variables

| Variable              | Default                   | Description              |
|-----------------------|---------------------------|--------------------------|
| REACT_APP_API_URL     | http://localhost:8000     | FastAPI backend URL      |
| REACT_APP_WS_URL      | ws://localhost:8000       | WebSocket backend URL    |

For production with HTTPS:
```
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com
```

---

## 🗺 Dashboard Features

| Feature              | Description                                         |
|----------------------|-----------------------------------------------------|
| Live map             | Dark CartoDB tiles, animated green live marker      |
| Trail polyline       | Dashed path showing movement history                |
| Stats overlay        | Lat/Lng, accuracy, speed, battery, mode (live)      |
| Device panel         | All registered devices, status badges, last seen    |
| Event log            | Real-time feed of location events (boot/shutdown/aggressive) |
| WebSocket status     | Live/Offline indicator in top bar                   |
| JWT auth             | Auto token refresh, protected routes                |

---

## 🚀 Production Build

```bash
npm run build
# Serve the /build folder with Nginx or Vercel
```
