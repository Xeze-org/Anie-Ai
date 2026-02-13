package analyzer

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"ea-scanner/internal/models"

	"google.golang.org/genai"
)

const resumeSystemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze resumes for ATS optimization based on proven research findings.

## SCORING CRITERIA (by weight):

### 1. ACTION VERBS (HIGH WEIGHT - 25% of score)
- Every bullet point MUST start with a strong past-tense action verb
- Good verbs: Led, Engineered, Directed, Executed, Developed, Architected, Deployed, Constructed, Automated, Optimized, Implemented, Designed, Programmed, Shipped, Launched
- Check for variety - same verb shouldn't repeat more than 2-3 times
- Score 0-100 based on percentage of bullets with proper action verbs

### 2. QUANTIFIABLE METRICS (HIGH WEIGHT - 25% of score)
- Look for numbers, percentages, and metrics in Experience and Projects
- Pattern required: [Number] + [Metric] + [Impact/Result]
- Examples: "80% reduction", "99.9% uptime", "67k+ requests/month", "500+ students served"
- Score based on percentage of bullet points with quantified achievements

### 3. SPELLING & GRAMMAR (MEDIUM WEIGHT - 20% of score)
- Check for technical terms ATS might flag:
  - "bcrypt" → suggest "secure password hashing"
  - "filesystem" → suggest "file system"
- Check hyphenation: "Problem-Solving" not "Problem Solving" for compound modifiers
- Flag any spelling errors

### 4. SECTION STRUCTURE (MEDIUM WEIGHT - 15% of score)
- Required sections: Heading, Summary/Objective, Education, Experience, Skills
- Use standard names: "Skills" preferred over "Technical Skills"
- Check for: Projects, Achievements/Accomplishments, Certifications
- Sections should be clearly labeled

### 5. WORD VARIETY (MEDIUM WEIGHT - 15% of score)
- Flag any word repeated more than 3-4 times
- Common culprits: "reducing", "achieving", "implementing", "building"
- Suggest synonyms for repeated words

## SCORING CATEGORIES:
- 90-100: TOP_1% (Excellent, submit with confidence)
- 80-89: TOP_5% (Very good, minor improvements possible)
- 70-79: TOP_14% (Good, some optimizations recommended)
- 50-69: TOP_30% (Needs work, follow suggestions)
- 0-49: NEEDS_WORK (Major improvements required)

## CHECKLIST TO VERIFY:
- Every bullet starts with action verb (past tense)
- Numbers/metrics in Experience section
- Numbers/metrics in Projects section
- No repeated words (>3 times)
- Standard section names
- No technical jargon ATS won't recognize
- Phone number included
- Spelling checked

Respond ONLY with valid JSON in this exact format:
{
  "overall_score": <0-100>,
  "score_category": "<TOP_1%|TOP_5%|TOP_14%|TOP_30%|NEEDS_WORK>",
  "summary": "<2-3 sentence overall assessment>",
  "action_verb_score": {
    "score": <0-100>,
    "status": "<EXCELLENT|GOOD|NEEDS_IMPROVEMENT|POOR>",
    "feedback": "<explanation>",
    "issues": ["<issue1>", "<issue2>"],
    "suggestions": ["<suggestion1>", "<suggestion2>"]
  },
  "quantification_score": {
    "score": <0-100>,
    "status": "<EXCELLENT|GOOD|NEEDS_IMPROVEMENT|POOR>",
    "feedback": "<explanation>",
    "issues": ["<issue1>"],
    "suggestions": ["<suggestion1>"]
  },
  "spelling_grammar": {
    "score": <0-100>,
    "status": "<EXCELLENT|GOOD|NEEDS_IMPROVEMENT|POOR>",
    "feedback": "<explanation>",
    "issues": ["<issue1>"],
    "suggestions": ["<suggestion1>"]
  },
  "section_structure": {
    "score": <0-100>,
    "status": "<EXCELLENT|GOOD|NEEDS_IMPROVEMENT|POOR>",
    "feedback": "<explanation>",
    "issues": ["<issue1>"],
    "suggestions": ["<suggestion1>"]
  },
  "word_variety": {
    "score": <0-100>,
    "status": "<EXCELLENT|GOOD|NEEDS_IMPROVEMENT|POOR>",
    "feedback": "<explanation>",
    "issues": ["<repeated word>: used X times"],
    "suggestions": ["<use synonym instead>"]
  },
  "suggestions": [
    {"priority": "HIGH", "category": "ActionVerbs", "current": "<current text>", "suggested": "<improved text>", "explanation": "<why>"},
    {"priority": "MEDIUM", "category": "Quantification", "current": "", "suggested": "<add metric>", "explanation": "<why>"}
  ],
  "checklist": [
    {"item": "Every bullet starts with action verb", "status": true, "note": ""},
    {"item": "Numbers/metrics in Experience", "status": false, "note": "Add metrics to 3 bullets"},
    {"item": "Phone number included", "status": true, "note": ""}
  ]
}`

// ResumeAnalyzer handles resume-specific analysis
type ResumeAnalyzer struct{}

// NewResumeAnalyzer creates a new ResumeAnalyzer
func NewResumeAnalyzer() *ResumeAnalyzer {
	return &ResumeAnalyzer{}
}

// AnalyzeResume processes the resume text using the client's Gemini API key
func (a *ResumeAnalyzer) AnalyzeResume(ctx context.Context, apiKey, resumeText, model string) (*models.ResumeAnalysisResult, error) {
	// Create client with user's API key
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	// Use provided model or default
	if model == "" {
		model = "gemini-2.5-pro"
	}

	// Prepare the combined prompt
	fullPrompt := fmt.Sprintf("%s\n\nAnalyze this resume for ATS optimization:\n\n---\n%s\n---", resumeSystemPrompt, resumeText)

	// Generate analysis
	resp, err := client.Models.GenerateContent(ctx, model,
		genai.Text(fullPrompt),
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate analysis: %w", err)
	}

	// Extract text response
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from Gemini")
	}

	responseText := resp.Text()

	// Parse JSON response
	result, err := parseResumeAnalysisResponse(responseText)
	if err != nil {
		return nil, fmt.Errorf("failed to parse analysis response: %w", err)
	}

	return result, nil
}

// parseResumeAnalysisResponse extracts JSON from the Gemini response
func parseResumeAnalysisResponse(response string) (*models.ResumeAnalysisResult, error) {
	// Clean up response - find JSON content
	response = strings.TrimSpace(response)

	// Remove markdown code block if present
	if strings.Contains(response, "```json") {
		start := strings.Index(response, "```json")
		end := strings.LastIndex(response, "```")
		if start != -1 && end > start+7 {
			response = strings.TrimSpace(response[start+7 : end])
		}
	} else if strings.Contains(response, "```") {
		// Generic code block
		start := strings.Index(response, "```")
		end := strings.LastIndex(response, "```")
		if end > start+3 {
			response = strings.TrimSpace(response[start+3 : end])
		}
	}

	// Find JSON object with proper brace matching
	start := strings.Index(response, "{")
	if start == -1 {
		return nil, fmt.Errorf("no JSON object found in response")
	}

	// Find matching closing brace
	braceCount := 0
	end := -1
	for i := start; i < len(response); i++ {
		if response[i] == '{' {
			braceCount++
		} else if response[i] == '}' {
			braceCount--
			if braceCount == 0 {
				end = i
				break
			}
		}
	}

	if end == -1 {
		return nil, fmt.Errorf("no matching closing brace found")
	}

	jsonStr := response[start : end+1]

	var result models.ResumeAnalysisResult
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		return nil, fmt.Errorf("invalid JSON format: %w", err)
	}

	// Validate overall score
	if result.OverallScore < 0 {
		result.OverallScore = 0
	} else if result.OverallScore > 100 {
		result.OverallScore = 100
	}

	// Validate score category
	validCategories := map[string]bool{
		"TOP_1%": true, "TOP_5%": true, "TOP_14%": true,
		"TOP_30%": true, "NEEDS_WORK": true,
	}
	if !validCategories[result.ScoreCategory] {
		// Derive from score
		switch {
		case result.OverallScore >= 90:
			result.ScoreCategory = "TOP_1%"
		case result.OverallScore >= 80:
			result.ScoreCategory = "TOP_5%"
		case result.OverallScore >= 70:
			result.ScoreCategory = "TOP_14%"
		case result.OverallScore >= 50:
			result.ScoreCategory = "TOP_30%"
		default:
			result.ScoreCategory = "NEEDS_WORK"
		}
	}

	return &result, nil
}
