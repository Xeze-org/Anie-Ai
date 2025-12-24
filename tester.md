# 🐳 Docker Guide - BITS CS AI Grade Calculator

This guide explains how to build, run, and deploy the application using Docker.

## 📁 Project Structure

```
bits-cs/
├── docker-compose.yml      # Orchestrates both services (root)
├── backend/
│   ├── Dockerfile          # Go backend image
│   ├── .dockerignore
│   ├── .env                # GEMINI_API_KEY (create this!)
│   └── cmd/main.go         # Entry point
└── frontend/
    ├── Dockerfile          # React/Vite → nginx image
    ├── .dockerignore
    └── nginx.conf          # SPA routing config
```

---

## 🚀 Quick Start

### 1. Set up environment

Create `backend/.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Pull images and run

```bash
# From project root
docker compose up -d

# Check status
docker compose ps
```

### 3. Access the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/health |

---

## 🔨 Building Images

### Build Backend

```bash
cd backend
docker build -t ghcr.io/ae-oss/ai-grade-calculator/backend:v1.0.0 .
```

### Build Frontend

```bash
cd frontend
docker build -t ghcr.io/ae-oss/ai-grade-calculator/frontend:v1.0.0 .
```

### Build Both (faster method)

```bash
# From root directory
docker compose build
```

---

## 📤 Push to GitHub Container Registry (GHCR)

### 1. Login to GHCR

```bash
docker login ghcr.io -u YOUR_GITHUB_USERNAME
# Enter your Personal Access Token (with write:packages scope)
```

### 2. Push images

```bash
docker push ghcr.io/ae-oss/ai-grade-calculator/backend:v1.0.0
docker push ghcr.io/ae-oss/ai-grade-calculator/frontend:v1.0.0
```

---

## 🔄 Common Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services |
| `docker compose down` | Stop all services |
| `docker compose logs -f` | View live logs |
| `docker compose logs backend` | View backend logs only |
| `docker compose pull` | Pull latest images from GHCR |
| `docker compose restart` | Restart all services |

---

## 🛠️ Troubleshooting

### Check container health

```bash
docker compose ps
docker inspect bits-cs-backend --format='{{.State.Health.Status}}'
```

### View logs

```bash
docker logs bits-cs-backend --tail 50
docker logs bits-cs-frontend --tail 50
```

### Rebuild after code changes

```bash
# Rebuild specific service
docker compose build backend
docker compose up -d backend

# Rebuild all
docker compose build --no-cache
docker compose up -d
```

### Check if API key is loaded

```bash
docker exec bits-cs-backend printenv GEMINI_API_KEY
```

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │
│  (nginx:alpine) │────▶│  (Go + Alpine)  │
│    Port 3000    │     │    Port 8080    │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
    Static React           Gemini 2.0 API
       SPA                  (Google AI)
```

### Image Sizes (approximate)
- **Backend**: ~15 MB (Go static binary + Alpine)
- **Frontend**: ~25 MB (nginx + built React app)

---

## 🔐 Security Features

- ✅ Non-root user in backend container
- ✅ Read-only filesystem (backend)
- ✅ No new privileges security option
- ✅ Health checks for both services
- ✅ Resource limits (CPU/Memory)
- ✅ API key via environment variable (not baked into image)

---

## 📋 Version Tags

| Image | Tag | Description |
|-------|-----|-------------|
| backend | v1.0.0 | Initial release |
| frontend | v1.0.0 | Initial release |

---

## 🌐 Production Deployment

For production, update the frontend `.env` before building:

```bash
# frontend/.env.production
VITE_API_URL=https://your-domain.com/api/chat
```

Then rebuild the frontend image with the production API URL baked in.
