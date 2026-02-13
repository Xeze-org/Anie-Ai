package api

import (
	"encoding/json"
	"log"
	"net/http"

	"ea-scanner/internal/analyzer"
	"ea-scanner/internal/models"
	"ea-scanner/internal/parser"
)

// Handler holds the API handlers
type Handler struct {
	analyzer       *analyzer.Analyzer
	resumeAnalyzer *analyzer.ResumeAnalyzer
}

// NewHandler creates a new Handler
func NewHandler() *Handler {
	return &Handler{
		analyzer:       analyzer.New(),
		resumeAnalyzer: analyzer.NewResumeAnalyzer(),
	}
}

// RegisterRoutes sets up the HTTP routes
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /health", h.handleHealth)
	mux.HandleFunc("POST /api/analyze", h.handleAnalyze)
	mux.HandleFunc("OPTIONS /api/analyze", h.handleCORS)
	mux.HandleFunc("POST /api/resume/analyze", h.handleResumeAnalyze)
	mux.HandleFunc("OPTIONS /api/resume/analyze", h.handleCORS)
}

// handleHealth returns server health status
func (h *Handler) handleHealth(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "ea-scanner",
	})
}

// handleCORS handles preflight requests
func (h *Handler) handleCORS(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	w.WriteHeader(http.StatusOK)
}

// handleAnalyze processes document analysis requests
func (h *Handler) handleAnalyze(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	w.Header().Set("Content-Type", "application/json")

	// Parse request body
	var req models.AnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate required fields
	if req.APIKey == "" {
		sendError(w, http.StatusBadRequest, "API key is required", "")
		return
	}
	if req.Document == "" {
		sendError(w, http.StatusBadRequest, "Document is required", "")
		return
	}
	if req.Filename == "" {
		req.Filename = "document.txt"
	}

	// Parse document
	text, err := parser.ParseDocument(req.Document, req.Filename)
	if err != nil {
		sendError(w, http.StatusBadRequest, "Failed to parse document", err.Error())
		return
	}

	// Normalize text
	text = parser.NormalizeText(text)

	if len(text) < 50 {
		sendError(w, http.StatusBadRequest, "Document too short", "Document must contain at least 50 characters of text")
		return
	}

	// Analyze with Gemini
	log.Printf("Analyzing document: %s (%d chars)", req.Filename, len(text))

	result, err := h.analyzer.Analyze(r.Context(), req.APIKey, text)
	if err != nil {
		log.Printf("Analysis error: %v", err)
		sendError(w, http.StatusInternalServerError, "Analysis failed", err.Error())
		return
	}

	log.Printf("Analysis complete: Risk Score %d (%s)", result.RiskScore, result.RiskLevel)

	// Send response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

// handleResumeAnalyze processes resume analysis requests
func (h *Handler) handleResumeAnalyze(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	w.Header().Set("Content-Type", "application/json")

	// Parse request body
	var req models.ResumeAnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate required fields
	if req.APIKey == "" {
		sendError(w, http.StatusBadRequest, "API key is required", "")
		return
	}
	if req.Document == "" {
		sendError(w, http.StatusBadRequest, "Resume document is required", "")
		return
	}
	if req.Filename == "" {
		req.Filename = "resume.txt"
	}

	// Parse document
	text, err := parser.ParseDocument(req.Document, req.Filename)
	if err != nil {
		sendError(w, http.StatusBadRequest, "Failed to parse resume", err.Error())
		return
	}

	// Normalize text
	text = parser.NormalizeText(text)

	if len(text) < 100 {
		sendError(w, http.StatusBadRequest, "Resume too short", "Resume must contain at least 100 characters of text")
		return
	}

	// Analyze resume with Gemini
	log.Printf("Analyzing resume: %s (%d chars)", req.Filename, len(text))

	result, err := h.resumeAnalyzer.AnalyzeResume(r.Context(), req.APIKey, text, "")
	if err != nil {
		log.Printf("Resume analysis error: %v", err)
		sendError(w, http.StatusInternalServerError, "Resume analysis failed", err.Error())
		return
	}

	log.Printf("Resume analysis complete: Score %d (%s)", result.OverallScore, result.ScoreCategory)

	// Send response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

// setCORSHeaders sets CORS headers for frontend access
func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

// sendError sends an error response
func sendError(w http.ResponseWriter, status int, message, details string) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(models.ErrorResponse{
		Error:   message,
		Details: details,
	})
}
