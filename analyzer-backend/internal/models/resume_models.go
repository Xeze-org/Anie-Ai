package models

// ResumeAnalyzeRequest represents the incoming request for resume analysis
type ResumeAnalyzeRequest struct {
	APIKey   string `json:"api_key"`  // Client's Gemini API key
	Document string `json:"document"` // Base64 encoded resume
	Filename string `json:"filename"` // Original filename with extension
}

// ResumeAnalysisResult represents the resume analysis output
type ResumeAnalysisResult struct {
	OverallScore        int                `json:"overall_score"`        // 0-100 ATS score
	ScoreCategory       string             `json:"score_category"`       // TOP_1%, TOP_5%, TOP_14%, TOP_30%, NEEDS_WORK
	Summary             string             `json:"summary"`              // Brief overall assessment
	ActionVerbScore     ScoreSection       `json:"action_verb_score"`    // Action verb analysis
	QuantificationScore ScoreSection       `json:"quantification_score"` // Metrics/numbers analysis
	SpellingGrammar     ScoreSection       `json:"spelling_grammar"`     // Spelling & grammar
	SectionStructure    ScoreSection       `json:"section_structure"`    // Section naming & structure
	WordVariety         ScoreSection       `json:"word_variety"`         // Word repetition analysis
	Suggestions         []ResumeSuggestion `json:"suggestions"`          // Actionable improvements
	Checklist           []ChecklistItem    `json:"checklist"`            // Quick checklist status
}

// ScoreSection represents a scored category
type ScoreSection struct {
	Score       int      `json:"score"`       // 0-100 section score
	Status      string   `json:"status"`      // EXCELLENT/GOOD/NEEDS_IMPROVEMENT/POOR
	Feedback    string   `json:"feedback"`    // Explanation
	Issues      []string `json:"issues"`      // Specific issues found
	Suggestions []string `json:"suggestions"` // How to improve
}

// ResumeSuggestion represents an actionable improvement
type ResumeSuggestion struct {
	Priority    string `json:"priority"`    // HIGH/MEDIUM/LOW
	Category    string `json:"category"`    // ActionVerbs/Quantification/Spelling/Structure/WordVariety
	Current     string `json:"current"`     // What was found (optional)
	Suggested   string `json:"suggested"`   // What to change to
	Explanation string `json:"explanation"` // Why this matters
}

// ChecklistItem represents a quick check status
type ChecklistItem struct {
	Item   string `json:"item"`   // Checklist item description
	Status bool   `json:"status"` // Pass/Fail
	Note   string `json:"note"`   // Additional context
}
