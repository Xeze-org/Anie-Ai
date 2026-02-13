package models

// AnalyzeRequest represents the incoming request from frontend
type AnalyzeRequest struct {
	APIKey   string `json:"api_key"`  // Client's Gemini API key
	Document string `json:"document"` // Base64 encoded document
	Filename string `json:"filename"` // Original filename with extension
}

// AnalysisResult represents the analysis output
type AnalysisResult struct {
	RiskScore       int       `json:"risk_score"`       // 0-100 risk score
	RiskLevel       string    `json:"risk_level"`       // LOW/MEDIUM/HIGH/CRITICAL
	ScamIndicators  []Finding `json:"scam_indicators"`  // Potential scam signs
	RiskyClauses    []Finding `json:"risky_clauses"`    // Problematic contract terms
	MissingElements []string  `json:"missing_elements"` // Expected elements not found
	Recommendations []string  `json:"recommendations"`  // Actionable advice
	Summary         string    `json:"summary"`          // Brief overall assessment
}

// Finding represents a specific issue found in the document
type Finding struct {
	Category    string `json:"category"`    // e.g., "Non-Compete", "Payment Request"
	Severity    string `json:"severity"`    // LOW/MEDIUM/HIGH/CRITICAL
	Description string `json:"description"` // Detailed explanation
	Quote       string `json:"quote"`       // Extracted text from document
}

// ErrorResponse for API errors
type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}
