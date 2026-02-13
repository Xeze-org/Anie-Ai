package internal

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// Request/Response types
type ChatRequestBody struct {
	Message      string    `json:"message"`
	Instructions string    `json:"instructions"`
	History      []Message `json:"history,omitempty"`
}

type ChatResponseBody struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}

type StreamChunk struct {
	Content string `json:"content"`
	Done    bool   `json:"done"`
}

// Handlers struct holds dependencies
type Handlers struct {
	gemini *GeminiService
}

// NewHandlers creates handlers with Gemini service
func NewHandlers(gemini *GeminiService) *Handlers {
	return &Handlers{gemini: gemini}
}

// HandleChat handles chat requests
func (h *Handlers) HandleChat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ChatRequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Message == "" && len(req.History) == 0 {
		writeError(w, "Message or history is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	var response string
	var err error

	if len(req.History) > 0 {
		// Use chat with history for conversation context
		response, err = h.gemini.ChatWithHistory(ctx, req.History, req.Instructions)
	} else {
		// Simple single message chat
		response, err = h.gemini.Chat(ctx, req.Message, req.Instructions)
	}

	if err != nil {
		log.Printf("Gemini error: %v", err)
		writeError(w, "Failed to generate response", http.StatusInternalServerError)
		return
	}

	writeJSON(w, ChatResponseBody{Response: response})
}

// HandleStreamChat handles streaming chat requests
func (h *Handlers) HandleStreamChat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ChatRequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Message == "" {
		writeError(w, "Message is required", http.StatusBadRequest)
		return
	}

	// Set headers for SSE
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}

	ctx := r.Context()

	err := h.gemini.StreamChat(ctx, req.Message, req.Instructions, func(chunk string) {
		data, _ := json.Marshal(StreamChunk{Content: chunk, Done: false})
		fmt.Fprintf(w, "data: %s\n\n", data)
		flusher.Flush()
	})

	if err != nil {
		log.Printf("Stream error: %v", err)
	}

	// Send done signal
	data, _ := json.Marshal(StreamChunk{Content: "", Done: true})
	fmt.Fprintf(w, "data: %s\n\n", data)
	flusher.Flush()
}

// HandleHealth returns health status
func (h *Handlers) HandleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]string{"status": "ok", "model": "gemini-2.0-flash"})
}

// Helper functions
func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ChatResponseBody{Error: message})
}
