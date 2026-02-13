package main

import (
	"log"
	"net/http"
	"os"

	"ea-scanner/internal/api"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Create handler
	handler := api.NewHandler()

	// Setup routes
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	// Start server
	addr := ":" + port
	log.Printf("🔍 Employment Agreement Scanner API starting on http://localhost%s", addr)
	log.Printf("📋 Endpoints:")
	log.Printf("   POST /api/analyze - Analyze employment agreement")
	log.Printf("   GET  /health      - Health check")

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
