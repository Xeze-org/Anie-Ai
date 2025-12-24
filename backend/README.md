# BITS-CS Backend (Go)

Go backend service using **Gemini 2.0 Flash** - optimized for long context instructions (up to 1M tokens).

## Why Gemini Flash for Long Instructions?

- **1M token context window** - handles very long system instructions
- **Fast response times** - optimized for speed
- **Cost effective** - lower cost than Pro models
- **Streaming support** - for real-time responses

## Setup

### Prerequisites
- Go 1.21+
- Gemini API Key

### Install Dependencies

```bash
cd backend
go mod tidy
```

### Environment Variables

```bash
export GEMINI_API_KEY=your_api_key_here
export PORT=8080  # optional, defaults to 8080
```

### Run

```bash
go run .
```

Or build and run:

```bash
go build -o server .
./server
```

## API Endpoints

### POST /api/chat
Simple chat with optional system instructions.

```json
{
  "message": "Hello, how are you?",
  "instructions": "You are a helpful assistant for BITS Pilani students..."
}
```

### POST /api/chat/stream
Streaming chat for real-time responses.

```json
{
  "message": "Explain quantum computing",
  "instructions": "You are a physics professor..."
}
```

### GET /api/health
Health check endpoint.

## Project Structure

```
backend/
├── main.go        # Entry point and server setup
├── gemini.go      # Gemini API service
├── handlers.go    # HTTP handlers
├── go.mod         # Go module definition
└── README.md      # This file
```

## Configuration

The Gemini model is configured for long context:

```go
model.SetMaxOutputTokens(8192)
model.SetTemperature(0.7)
model.SetTopP(0.95)
model.SetTopK(40)
```

## CORS

CORS is enabled for all origins. Modify `enableCORS` in `main.go` for production.
