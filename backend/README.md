# BITS-CS Backend

Go backend service using **Gemini Flash** - optimized for long context instructions (up to 1M tokens).

## 🐳 Docker Deployment

### Using Pre-built Image

```bash
docker pull ghcr.io/ae-oss/ai-grade-calculator/backend:v1.1.0
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key -e GEMINI_MODEL=gemini-2.5-flash ghcr.io/ae-oss/ai-grade-calculator/backend:v1.1.0
```

### Building from Source

```bash
docker build -t bits-backend .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key -e GEMINI_MODEL=gemini-2.5-flash bits-backend
```

## 🔧 Local Development

### Prerequisites
- Go 1.24+
- Gemini API Key

### Setup

```bash
cd backend
go mod tidy
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Gemini API key |
| `GEMINI_MODEL` | Yes | Model name (e.g., `gemini-2.5-flash`) |
| `PORT` | No | Server port (default: 8080) |

### Run

```bash
export GEMINI_API_KEY=your_key
export GEMINI_MODEL=gemini-2.5-flash
go run .
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Chat with conversation history |
| POST | `/api/chat/stream` | Streaming chat response |
| GET | `/api/health` | Health check |

### POST /api/chat

```json
{
  "history": [
    {"role": "user", "content": "Calculate my grade for Web Programming"}
  ]
}
```

**Response:**
```json
{
  "response": "## 📊 Grade Calculation: Web Programming..."
}
```

## 📁 Project Structure

```
backend/
├── main.go              # Entry point
├── internal/
│   ├── gemini.go        # Gemini API service
│   ├── handlers.go      # HTTP handlers
│   └── instructions.go  # System prompt
├── Dockerfile           # Container build
├── .env                 # Environment (git-ignored)
└── go.mod               # Dependencies
```

## 🔒 Security

- Non-root container user (`appuser:1000`)
- Read-only root filesystem
- Minimal Alpine base image
- No Cloud Functions dependencies

## 📝 License

GPL-3.0 - See [LICENSE](../LICENSE)
