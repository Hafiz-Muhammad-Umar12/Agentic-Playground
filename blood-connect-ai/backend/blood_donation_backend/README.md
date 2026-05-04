# 🩸 Blood Donation Platform — Backend

FastAPI + MySQL + JWT backend for the Blood Donation Platform.

---

## 📁 Project Structure

```
blood_donation_backend/
├── app/
│   ├── main.py                  # FastAPI entry point
│   ├── core/
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLAlchemy setup
│   │   └── security.py          # JWT + password hashing
│   ├── models/
│   │   ├── user.py              # User table
│   │   ├── blood_request.py     # Blood request table
│   │   ├── donation.py          # Donations table
│   │   └── notification.py      # Notifications table
│   ├── schemas/
│   │   ├── user.py              # Pydantic schemas for users
│   │   ├── blood_request.py     # Pydantic schemas for requests
│   │   └── donation.py          # Pydantic schemas for donations/notifications
│   └── routers/
│       ├── auth.py              # /api/v1/auth/*
│       ├── users.py            # /api/v1/users/*
│       ├── blood_requests.py   # /api/v1/requests/*
│       ├── donations.py        # /api/v1/donations/*
│       └── notifications.py    # /api/v1/notifications/*
├── requirements.txt
├── .env.example
└── README.md
```

---

## ⚙️ Setup

### 1. Clone & Install

```bash
git clone <repo>
cd blood_donation_backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and secret key
```

### 3. Create MySQL Database

```sql
CREATE DATABASE blood_donation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tables are auto-created on first run.

---

## 🤖 AI Agent Powered Dashboard (NEW)

> ⚡ The **entire user dashboard layer is AI-driven**.

* The **backend APIs remain the same**, but all dashboard operations (analytics, insights, matching, recommendations) are handled by an **AI Agent layer**.
* The AI Agent dynamically:

  * Matches donors with nearby requests
  * Suggests optimal donors based on blood group & location
  * Generates real-time insights for users and admins
  * Summarizes donation activity and request urgency
  * Powers intelligent notifications and alerts

### 🧠 AI Agent Responsibilities

* 🩸 Smart donor–request matching
* 📍 Location-based recommendations
* ⚡ Priority detection for emergency requests
* 📊 Dashboard analytics generation
* 🔔 Intelligent notification triggers

### 🏗️ Architecture Impact

* FastAPI → Core backend (auth, CRUD, data layer)
* AI Agent Service → Dashboard intelligence layer
* Frontend Dashboard → Fully AI-driven UI decisions

---

## 📡 API Endpoints

### Auth  `/api/v1/auth`

| Method | Endpoint | Description          |
| ------ | -------- | -------------------- |
| POST   | /signup  | Register new user    |
| POST   | /login   | Login & get tokens   |
| POST   | /refresh | Refresh access token |
| GET    | /me      | Get current user     |

### Users  `/api/v1/users`

| Method | Endpoint   | Description               |
| ------ | ---------- | ------------------------- |
| GET    | /          | List all users (filtered) |
| GET    | /donors    | List available donors     |
| GET    | /{user_id} | Get single user           |
| PATCH  | /me        | Update your profile       |
| DELETE | /me        | Deactivate account        |

### Blood Requests  `/api/v1/requests`

| Method | Endpoint | Description                  |
| ------ | -------- | ---------------------------- |
| POST   | /        | Create blood request         |
| GET    | /        | List requests (with filters) |
| GET    | /my      | Your requests                |
| GET    | /{id}    | Get single request           |
| PATCH  | /{id}    | Update request               |
| DELETE | /{id}    | Cancel request               |

### Donations  `/api/v1/donations`

| Method | Endpoint              | Description                   |
| ------ | --------------------- | ----------------------------- |
| POST   | /                     | Accept (donate for) a request |
| GET    | /my                   | Your donation history         |
| GET    | /request/{request_id} | Donations for a request       |
| PATCH  | /{id}                 | Update donation status        |

### Notifications  `/api/v1/notifications`

| Method | Endpoint       | Description                |
| ------ | -------------- | -------------------------- |
| GET    | /              | Get notifications          |
| GET    | /unread-count  | Count of unread            |
| PATCH  | /mark-read     | Mark specific ones as read |
| PATCH  | /mark-all-read | Mark all as read           |
| DELETE | /clear         | Clear all notifications    |

---

## 🔐 Authentication

All endpoints (except `/auth/signup` and `/auth/login`) require a Bearer token:

```
Authorization: Bearer <access_token>
```

---

## 🩸 Blood Groups Supported

`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

---

## 🚀 Deployment

* **Backend**: Render / Railway
* **Database**: PlanetScale / Aiven MySQL
* Set `.env` variables in deployment environment

---

## 📋 Swagger Docs

* [http://localhost:8000/docs](http://localhost:8000/docs) — Swagger UI
* [http://localhost:8000/redoc](http://localhost:8000/redoc) — ReDoc documentation
