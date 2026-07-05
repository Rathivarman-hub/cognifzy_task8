# ? ServerPulse

A production-grade full-stack monitoring dashboard built with the **MERN stack**, featuring real-time background job processing, Redis caching, structured request logging, and a live monitoring UI.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

---

## ?? Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 18, Vite 5, Bootstrap 5, Bootstrap Icons |
| Backend   | Node.js, Express.js, MVC Architecture         |
| Database  | MongoDB (Mongoose)                            |
| Cache     | Redis (Upstash / ioredis)                     |
| Queue     | Bull + Bull Board UI                          |
| Email     | Nodemailer + Gmail OAuth2                     |
| Auth      | JWT                                           |

---

## ? Features

- ?? **Job Queue Dashboard** – View, filter and monitor all background jobs
- ?? **Email Job Queue** – Queue HTML emails via Bull + Nodemailer
- ?? **Report Job Queue** – Queue report generation jobs
- ? **Redis Caching** – GET response caching with TTL and stats
- ?? **Request Logging** – Every HTTP request logged to MongoDB
- ??? **Middleware Stack** – Helmet, CORS, Morgan, compression, rate limiting
- ?? **Live Dashboard** – Real-time queue status and cache stats (auto-refresh)
- ?? **Dark / Light Mode** – Smooth theme toggle saved to localStorage
- ?? **Fully Responsive** – Works on mobile, tablet, and desktop

---

## ?? Project Structure

```
serverPulse/
+-- client/                    # React frontend (Vite)
¦   +-- src/
¦   ¦   +-- components/        # Navbar, JobCard, QueueStatus, CacheStatus
¦   ¦   +-- context/           # ThemeContext, AuthContext
¦   ¦   +-- pages/             # Home, Dashboard, Jobs, Logs, Settings
¦   ¦   +-- services/          # Axios API service
¦   ¦   +-- App.jsx
¦   ¦   +-- index.css
¦   +-- vite.config.js
¦
+-- server/                    # Express backend
    +-- src/
    ¦   +-- config/            # DB, Redis, Gmail OAuth config
    ¦   +-- controllers/       # Jobs, Logs, Cache controllers
    ¦   +-- middleware/        # Auth, cache, logging middleware
    ¦   +-- models/            # Mongoose models
    ¦   +-- queues/            # Bull queue definitions
    ¦   +-- routes/            # Express route files
    ¦   +-- workers/           # Email & Report Bull workers
    ¦   +-- app.js
    +-- .env.example
    +-- package.json
```

---

## ?? Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Redis (local or [Upstash](https://upstash.com/) free tier)
- Google Cloud Console account (for Gmail OAuth2)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/serverPulse.git
cd serverPulse
```

### 2. Configure Environment Variables

Create a `.env` file inside `server/`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/serverpulse

# Redis (Upstash)
REDIS_HOST=your-upstash-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_upstash_redis_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Gmail OAuth2
GMAIL_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

> **?? Never commit your `.env` file** – it is already in `.gitignore`.

### 3. Install & Run

```bash
# Terminal 1 – Backend
cd server && npm install && npm run dev

# Terminal 2 – Frontend
cd client && npm install && npm run dev
```

### 4. Open in Browser

| Service        | URL                                  |
|----------------|--------------------------------------|
| ?? Frontend    | http://localhost:5173               |
| ?? Backend API | http://localhost:5000/api           |
| ?? Bull Board  | http://localhost:5000/admin/queues  |
| ?? Health      | http://localhost:5000/health        |

---

## ?? How to Get Environment Values

### MongoDB URI
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster ? Connect ? Connect your application
3. Copy the connection string

### Redis (Upstash)
1. Sign up at [Upstash](https://upstash.com/)
2. Create a Redis database ? Details tab
3. Copy **Endpoint** ? `REDIS_HOST`, **Port** ? `REDIS_PORT`, **Password** ? `REDIS_PASSWORD`

### Gmail OAuth2
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project ? Enable **Gmail API**
3. Credentials ? Create **OAuth 2.0 Client ID** (Desktop App)
4. Copy `client_id` and `client_secret`
5. Use [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/):
   - Scope: `https://mail.google.com/`
   - Exchange auth code ? copy `refresh_token`

---

## ?? API Endpoints

| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | `/api/jobs`           | List all jobs         |
| POST   | `/api/jobs/email`     | Queue an email job    |
| POST   | `/api/jobs/report`    | Queue a report job    |
| GET    | `/api/logs`           | List request logs     |
| DELETE | `/api/logs`           | Clear all logs        |
| GET    | `/api/cache/stats`    | Get Redis cache stats |
| DELETE | `/api/cache`          | Clear all cache       |
| GET    | `/health`             | Server health check   |
| GET    | `/admin/queues`       | Bull Board UI         |

---

## ?? Deployment

### Frontend ? Vercel
1. Push `client/` to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Set env var: `VITE_API_URL=https://your-backend-url.com/api`

### Backend ? Railway / Render
1. Import `server/` directory
2. Add all environment variables
3. Start command: `npm start`

---

## ?? License

MIT License

## ?? Author

**Rathivarman** – Built as a production-grade MERN stack showcase project.
