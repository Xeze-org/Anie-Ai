# BITS-CS Frontend

Modern React chat interface with AI-powered grade calculations and academic advising.

## 🐳 Docker Deployment

### Using Pre-built Image

```bash
docker pull ghcr.io/ae-oss/ai-grade-calculator/frontend:v1.1.0
docker run -p 3000:80 ghcr.io/ae-oss/ai-grade-calculator/frontend:v1.1.0
```

### Building from Source

```bash
docker build -t bits-frontend .
docker run -p 3000:80 bits-frontend
```

## 🔧 Local Development

### Setup

```bash
npm install
```

### Environment

Edit `.env`:

```env
# For development (connect to local backend)
VITE_API_URL=http://localhost:8080/api/chat

# For production (uses nginx reverse proxy)
# VITE_API_URL=/api/chat
```

### Run

```bash
npm run dev
```

Access: http://localhost:5173

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 Beautiful UI | Dark theme with ambient lighting effects |
| 📐 LaTeX Support | KaTeX rendering for math equations |
| 📝 Markdown | Full markdown in chat responses |
| 💾 Local Storage | Chat history in IndexedDB (browser) |
| ⚙️ Custom API | Use your own Gemini API key |
| 🔄 Model Selection | Choose from multiple Gemini models |

## 📡 Custom API Mode

Users can bring their own Gemini API key:

1. Go to **Settings** (gear icon)
2. Toggle "Use my own API key"
3. Enter API key and select model
4. Save → Chat directly with Gemini

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/           # Chat, Home, Settings
│   ├── components/      # Reusable components
│   ├── lib/             # Utilities (db, settings, gemini)
│   └── App.tsx          # Routes
├── Dockerfile           # Container build
├── nginx.conf           # Production server
└── .env                 # Environment
```

## 🔒 Security

- No secrets in client bundle
- API key stored locally only (localStorage)
- Chat history never leaves browser
- HTTPS enforced in production

## 📝 License

GPL-3.0 - See [LICENSE](../LICENSE)
