# 🔥 GhostTrack Backend — FastAPI

Real-time anti-theft device tracking backend with JWT auth, WebSocket live feed,
location history, fake-shutdown detection, and boot event capture.

---

## 🗂 Project Structure

```
backend/
├── app/
│   ├── main.py              ← FastAPI app + CORS + routers
│   ├── api/
│   │   ├── auth.py          ← POST /auth/signup, /auth/login
│   │   ├── device.py        ← POST /device/register, GET /device/...
│   │   └── location.py      ← POST /location/update, /shutdown, /boot, GET history
│   ├── core/
│   │   ├── config.py        ← Settings from .env
│   │   ├── security.py      ← JWT create/verify, bcrypt hashing
│   │   └── websocket.py     ← ws://server/ws/location/{device_id}
│   ├── models/
│   │   ├── user.py          ← SQLAlchemy User table
│   │   ├── device.py        ← SQLAlchemy Device table
│   │   └── location.py      ← SQLAlchemy Location table
│   ├── schemas/
│   │   └── schemas.py       ← Pydantic request/response models
│   ├── services/
│   │   └── location_service.py  ← Save + broadcast location
│   └── db/
│       └── session.py       ← DB engine, SessionLocal, get_db
├── requirements.txt
├── .env.example
└── README.md
```

---

## ⚡ Quick Start

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env if needed (default uses SQLite, no config needed for local dev)
```

### 3. Run server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Open API docs

```
http://localhost:8000/docs
```

---

## 🔌 API Reference

### 🔑 Auth

| Method | Endpoint            | Body                          | Returns        |
|--------|---------------------|-------------------------------|----------------|
| POST   | `/auth/signup`      | `{name, email, password}`     | JWT token      |
| POST   | `/auth/login`       | `{email, password}`           | JWT token      |
| GET    | `/auth/me/profile`  | Header: `Authorization: Bearer <token>` | User info |

### 📱 Device

| Method | Endpoint                        | Auth | Description                    |
|--------|---------------------------------|------|--------------------------------|
| POST   | `/device/register`              | ✅   | Register new device            |
| GET    | `/device/my-devices`            | ✅   | List all your devices          |
| GET    | `/device/{device_id}`           | ✅   | Get single device              |
| PATCH  | `/device/{device_id}/status`    | ✅   | Update online/offline status   |
| DELETE | `/device/{device_id}`           | ✅   | Remove device                  |

### 📍 Location

| Method | Endpoint                          | Auth | Description                         |
|--------|-----------------------------------|------|-------------------------------------|
| POST   | `/location/update`                | ❌   | Push GPS update (background service)|
| POST   | `/location/shutdown`              | ❌   | Save last location on shutdown      |
| POST   | `/location/boot`                  | ❌   | Report location on boot             |
| GET    | `/location/last/{device_id}`      | ✅   | Get last known location             |
| GET    | `/location/history/{device_id}`   | ✅   | Get paginated location history      |

### 🔴 WebSocket

```
ws://localhost:8000/ws/location/{device_id}
```

Dashboard connects here. Every time mobile pushes a location, this socket
broadcasts it to all connected dashboards watching that device.

**Message format received:**
```json
{
  "type": "location_update",
  "device_id": "abc-123",
  "latitude": 24.8607,
  "longitude": 67.0011,
  "battery_level": 45,
  "is_aggressive": false,
  "event_type": "update",
  "timestamp": "2025-01-01T12:00:00"
}
```

---

## 🗄 Switch to PostgreSQL / Neon

In `.env`, replace DATABASE_URL:

```
DATABASE_URL=postgresql://username:password@host:5432/ghosttrack
```

Then uncomment `psycopg2-binary` in `requirements.txt` and reinstall.

---

## 🔐 Event Types

| event_type      | Trigger                                  |
|-----------------|------------------------------------------|
| `update`        | Regular GPS ping (every 3–10 sec)        |
| `boot`          | Phone booted, BootReceiver fired         |
| `shutdown`      | Phone shutting down, ShutdownReceiver    |
| `fake_shutdown` | Power button trick, aggressive tracking  |

---

## 🚀 Production Deployment

1. Set `SECRET_KEY` to a 32-byte random string
2. Set `DATABASE_URL` to PostgreSQL
3. Set `DEBUG=false`
4. Run with: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`
5. Put behind Nginx + HTTPS
6. Update CORS `allow_origins` to your frontend domain
