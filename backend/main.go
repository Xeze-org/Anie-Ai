package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/bits-cs/backend/internal"
)

func main() {
	ctx := context.Background()

	// Get API key from environment
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY not set")
	}

	// Initialize Gemini service
	geminiService, err := internal.NewGeminiService(ctx, apiKey)
	if err != nil {
		log.Fatalf("Failed to create Gemini service: %v", err)
	}
	defer geminiService.Close()

	// Create handlers
	handlers := internal.NewHandlers(geminiService)

	// Setup routes with CORS
	http.HandleFunc("/api/chat", enableCORS(handlers.HandleChat))
	http.HandleFunc("/api/chat/stream", enableCORS(handlers.HandleStreamChat))
	http.HandleFunc("/api/health", enableCORS(handlers.HandleHealth))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func enableCORS(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler(w, r)
	}
}
