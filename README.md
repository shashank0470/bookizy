<div align="center">

# 🏥 Bookizy

**A real-time clinic queue and token booking system**

Patients book queue tokens at nearby clinics and track live wait times — receptionists manage the queue from a live dashboard, all synced via WebSocket.

[![Java](https://img.shields.io/badge/Java-ED8B00?style=flat&logo=openjdk&logoColor=white)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat&logo=springboot&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)]()
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)]()
[![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens)]()
[![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-informational?style=flat)]()

</div>

---

## 📌 What It Does

Most clinic queues are opaque — you show up, get a token, and wait blindly. Bookizy fixes that.

- Patients book tokens remotely and watch the live queue update in real time
- Estimated wait time recalculates automatically as the queue changes
- Receptionists control token flow from a dedicated dashboard — no page refreshes needed
- All clients stay in sync via WebSocket subscriptions

---

## ✨ Features

### For Patients
- JWT-based signup and login
- Browse clinics by doctor, specialization, timing, and address
- Book a queue token (one active token per clinic at a time)
- Live queue view with real-time updates via WebSocket
- Dynamic wait-time estimate based on patients ahead × clinic's average minutes per patient
- Cancel an active booking
- View active bookings and manage profile

### For Receptionists
- Full patient queue view with names and ages
- Update token status: `waiting → arrived → serving → completed / skipped / cancelled`
- **Serve next** — auto-advances the first `arrived` token to `serving`
- Remove tokens from the queue
- Real-time sync via WebSocket (no manual refresh needed)

---

## ⚙️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, SockJS, STOMP.js |
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA, WebSocket (STOMP) |
| Database | MySQL 8 |
| Auth | JWT (JJWT), BCrypt password hashing |
| Build | Gradle (backend), npm (frontend) |

---

## 🔄 How It Works

```
Patient books token
       ↓
Backend assigns next token number for that clinic (resets daily)
       ↓
WebSocket broadcasts queue change to /topic/clinic/{clinicId}
       ↓
All connected patients & receptionists refresh automatically
```

**Wait time formula:** `patients ahead × clinic's average minutes per patient`

### Token Lifecycle

```
WAITING → ARRIVED → SERVING → COMPLETED
                ↘              ↗
               SKIPPED / CANCELLED
```

| Status | Description |
|---|---|
| `waiting` | Booked, not yet at the clinic |
| `arrived` | Patient checked in at reception |
| `serving` | Currently with the doctor |
| `completed` | Visit finished |
| `skipped` | Patient skipped |
| `cancelled` | Booking cancelled |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+ and npm
- MySQL 8 running locally

### 1. Database Setup

```sql
CREATE DATABASE IF NOT EXISTS appointment_db;
```

Update `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/appointment_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

> ⚠️ Change the default `jwt.secret` before deploying to production.

### 2. Run the Backend

```bash
cd backend
./gradlew bootRun        # Linux / macOS
gradlew.bat bootRun      # Windows
```

API starts at `http://localhost:8080`

On first run, four sample clinics are seeded automatically:
- City Clinic — General
- Downtown Care — Pediatrics
- Skin Health — Dermatology
- Uptown Dental — Dentistry

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at `http://localhost:5173`

---

## 📁 Project Structure

```
bookizy/
├── backend/                    # Spring Boot REST API + WebSocket server
│   └── src/main/java/com/appointment/
│       ├── controller/         # Auth, Clinic, Token, Receptionist endpoints
│       ├── service/            # Business logic
│       ├── entity/             # User, Clinic, Token models
│       ├── repository/         # JPA repositories
│       ├── security/           # JWT filter & token provider
│       └── config/             # Security, WebSocket, seed data
│
└── frontend/                   # React SPA
    └── src/
        ├── components/
        │   ├── Auth/           # Login, Signup
        │   ├── Patient/        # Dashboard, ClinicList, ClinicQueue, MyBookings, Profile
        │   └── Receptionist/   # ReceptionistDashboard
        ├── services/           # API client & WebSocket helpers
        └── utils/              # Auth helpers (localStorage)
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register a new patient | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |

### Clinics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/clinics` | List all clinics | Public |
| GET | `/api/clinics/{id}` | Get clinic details | Public |

### Tokens (Patient)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/tokens/clinic/{clinicId}` | Book a token | JWT |
| GET | `/api/tokens/clinic/{clinicId}/queue` | Live queue (privacy-aware) | JWT |
| GET | `/api/tokens/clinic/{clinicId}/my-token` | Get your active token | JWT |
| DELETE | `/api/tokens/{tokenId}` | Cancel your token | JWT |

### Queue Management (Receptionist)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/receptionist/clinic/{clinicId}/queue` | Full queue view | Public* |
| PUT | `/api/receptionist/token/{tokenId}/status` | Update token status | Public* |
| POST | `/api/receptionist/clinic/{clinicId}/serve-next` | Serve next arrived patient | Public* |
| DELETE | `/api/receptionist/token/{tokenId}` | Remove token from queue | Public* |

> *⚠️ Receptionist routes are currently open in `SecurityConfig` — restrict with role-based auth before deploying to production.*

**WebSocket:** `ws://localhost:8080/ws` → subscribe to `/topic/clinic/{clinicId}`

---

## 👥 User Roles

| Role | Access |
|---|---|
| `PATIENT` | Default on signup — dashboard, booking, queue view |
| `RECEPTIONIST` | Queue management at `/receptionist/{clinicId}` |
| `ADMIN` | Defined in backend; no UI yet |

> Receptionist accounts must currently be created directly in the database (signup always assigns `PATIENT`).

---

## 🗺️ Demo Flow

1. **Sign up** and **log in** as a patient
2. Open **Available Clinics** → click **Book Token**
3. Enter patient details → view your token number and the live queue
4. Open a second tab → log in as a receptionist → manage statuses and serve patients
5. Watch both tabs update in real time via WebSocket

---

## 🛣️ Roadmap

- [ ] Receptionist signup flow and admin panel for user management
- [ ] Role-based authorization on receptionist API routes
- [ ] Appointment date/time picker in booking form (backend already supports this)
- [ ] Backend endpoint for profile updates
- [ ] Fix cancel button in My Bookings
- [ ] `.env`-based config for API URL and secrets

---

## 📄 License

Open source — free for personal and educational use.
