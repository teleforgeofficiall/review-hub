# REVIEW HUB

Telegram Mini App for completing review tasks and earning rewards in INR (₹). Users browse available tasks, submit proof of completion, and earn money. Admins manage tasks, review submissions, and track platform statistics — all from mobile.

## Live

- **Mini App**: [frontend-kappa-sepia-39.vercel.app](https://frontend-kappa-sepia-39.vercel.app)
- **Bot**: [@ReviewHubInBot](https://t.me/ReviewHubInBot)

## Architecture

| Component | Tech | Hosting |
|-----------|------|---------|
| Mini App (User + Admin) | React + TypeScript + Vite + Tailwind v4 | Vercel |
| Backend API | Python FastAPI + SQLAlchemy + Alembic | VPS (Docker) |
| Telegram Bot | python-telegram-bot | VPS (Docker) |
| Database | PostgreSQL | Neon (Cloud) |

## Features

**Users:**
- Browse and filter available review tasks
- Submit proof (text + screenshots) for completed tasks
- Track submission status (pending, approved, rejected)
- Wallet with transaction history
- INR withdrawals (UPI / bank transfer)
- Referral system (₹10 per referral)
- Profile with stats and referral code sharing

**Admins:**
- Dashboard with real-time platform stats
- Create / edit / delete tasks with pricing
- Review and approve/reject submissions with feedback
- Manage withdrawals
- Mobile-optimized admin panel (built into Mini App)

## Project Structure

```
review-hub/
├── frontend/          # React Mini App (user + admin pages)
│   ├── api/           # Vercel serverless functions (proxy to backend)
│   └── src/
│       ├── components/    # TMAProvider, shared UI components
│       ├── pages/         # User pages (Tasks, Submissions, Wallet, Profile)
│       ├── pages/admin/   # Admin pages (Dashboard, Tasks, Reviews, Profile)
│       ├── stores/        # Zustand state management
│       └── lib/           # API client, utilities
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # API routes
│   │   ├── schemas/       # Pydantic schemas
│   │   └── utils/         # Auth, Telegram validation
│   └── alembic/           # DB migrations
├── bot/               # Telegram bot
└── docker-compose.yml
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker + Docker Compose
- Neon PostgreSQL database

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env with your values

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create .env
cp .env.example .env
# Edit .env if needed (defaults to /api proxy)

npm run dev
```

### Bot

```bash
cd bot
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with BOT_TOKEN, FRONTEND_URL, etc.

python bot.py
```

### Docker (Production)

```bash
# From project root
docker-compose up -d --build
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `BOT_TOKEN` | Telegram bot token | `123456:ABC-DEF...` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | Random string |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRY_HOURS` | Token expiry | `24` |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://frontend-kappa-sepia-39.vercel.app` |
| `ADMIN_IDS` | Comma-separated Telegram user IDs | `123456789` |

### Bot (`bot/.env`)

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Telegram bot token |
| `FRONTEND_URL` | Mini App URL |
| `BACKEND_URL` | Backend API URL |
| `ADMIN_IDS` | Comma-separated admin Telegram IDs |

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/telegram` | Authenticate with Telegram initData |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/tasks` | List active tasks |
| GET | `/api/tasks/:id` | Get task detail |
| POST | `/api/submissions` | Submit task proof |
| GET | `/api/submissions` | List user's submissions |
| GET | `/api/wallet/transactions` | Transaction history |
| GET | `/api/wallet/balance` | Wallet balance |
| POST | `/api/withdrawals` | Request withdrawal |
| GET | `/api/withdrawals` | List user's withdrawals |
| GET | `/api/admin/stats` | Admin dashboard stats |
| POST | `/api/admin/tasks` | Create task (admin) |
| PUT | `/api/admin/tasks/:id` | Update task (admin) |
| DELETE | `/api/admin/tasks/:id` | Delete task (admin) |
| PUT | `/api/submissions/:id/review` | Approve/reject submission (admin) |

## Deployment

### Vercel (Frontend)

```bash
cd frontend
npx vercel --prod
```

The `api/[...proxy].ts` serverless function proxies all `/api/*` requests to the VPS backend.

### VPS (Backend + Bot)

```bash
# SSH into VPS
ssh root@153.75.247.105

# Deploy
cd /path/to/review-hub
docker-compose up -d --build
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Axios
- **UI**: White + purple glassmorphism, Inter font, Material Symbols Outlined icons
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Alembic, asyncpg
- **Auth**: Telegram WebApp initData validation + JWT
- **Database**: Neon PostgreSQL (serverless)
- **Bot**: python-telegram-bot v21+

## License

Private — All rights reserved.
