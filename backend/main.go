package backend

import (
	"context"
	"log"
	"net/http"
	"os"
)

// getAPIKey retrieves API key from Firebase Functions secrets
// Firebase secrets are automatically available as environment variables at runtime
// Set secret: firebase functions:secrets:set GEMINI_API_KEY --project astralelite
// Access secret: firebase functions:secrets:access GEMINI_API_KEY --project astralelite
func getAPIKey() string {
	// Firebase Functions secrets are injected as environment variables
	if key := os.Getenv("GEMINI_API_KEY"); key != "" {
		return key
	}

	log.Fatal("GEMINI_API_KEY not found. Set it using: firebase functions:secrets:set GEMINI_API_KEY --project astralelite")
	return ""
}

func main() {
	ctx := context.Background()

	// Get API key from environment or config
	apiKey := getAPIKey()

	// Initialize Gemini service with API key passed as parameter
	geminiService, err := NewGeminiService(ctx, apiKey)
	if err != nil {
		log.Fatalf("Failed to create Gemini service: %v", err)
	}
	defer geminiService.Close()

	// Create handlers with injected service
	handlers := NewHandlers(geminiService)

	// Setup HTTP routes
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
