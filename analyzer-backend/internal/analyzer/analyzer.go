package analyzer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"ea-scanner/internal/models"

	"google.golang.org/genai"
)

const systemPrompt = `You are an expert employment law analyst specializing in detecting fraudulent job offers and risky employment contract clauses. Analyze the provided employment agreement/job offer and identify:

## SCAM INDICATORS (potential fraud signs):
- "Too good to be true" salary, benefits, or work conditions
- Requests for money (training fees, equipment deposits, processing fees)
- Requests for bank account or sensitive financial information upfront
- Vague job descriptions without clear duties or responsibilities
- Unprofessional language, grammar issues, or suspicious formatting
- Advance check deposits with requests to send money back
- No verifiable company information or contact details
- Pressure to sign immediately without time to review

## RISKY CLAUSES (problematic but potentially legal terms):
- Overly broad non-compete agreements (unreasonable time/geographic scope)
- Unlimited or overly broad non-solicitation clauses
- One-sided intellectual property assignments (claiming all your work)
- Unfair termination conditions (employer can fire anytime, you can't quit)
- Hidden salary deductions or unclear compensation structure
- Mandatory arbitration with employer-favorable terms
- Unlimited liability or one-sided indemnification clauses
- Excessive confidentiality restrictions

## MISSING ELEMENTS (red flags by absence):
- No clearly defined compensation structure
- Missing termination conditions
- No defined work hours or location
- Absence of company name or legitimate contact info
- No mention of benefits (for full-time roles)

Respond ONLY with valid JSON in this exact format:
{
  "risk_score": <0-100 integer>,
  "risk_level": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2-3 sentence overall assessment>",
  "scam_indicators": [
    {"category": "<type>", "severity": "<LOW|MEDIUM|HIGH|CRITICAL>", "description": "<explanation>", "quote": "<exact text from document>"}
  ],
  "risky_clauses": [
    {"category": "<type>", "severity": "<LOW|MEDIUM|HIGH|CRITICAL>", "description": "<explanation>", "quote": "<exact text from document>"}
  ],
  "missing_elements": ["<element1>", "<element2>"],
  "recommendations": ["<action1>", "<action2>"]
}

Risk Score Guidelines:
- 0-25: LOW - Standard agreement, no significant concerns
- 26-50: MEDIUM - Some concerning clauses, review recommended
- 51-75: HIGH - Multiple red flags, legal review strongly advised
- 76-100: CRITICAL - Likely scam or extremely predatory terms`

// Analyzer handles Gemini API interactions
type Analyzer struct{}

// New creates a new Analyzer
func New() *Analyzer {
	return &Analyzer{}
}

// Analyze processes the document text using the client's Gemini API key
func (a *Analyzer) Analyze(ctx context.Context, apiKey, documentText string) (*models.AnalysisResult, error) {
	// Create client with user's API key
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	// Prepare the combined prompt
	fullPrompt := fmt.Sprintf("%s\n\nAnalyze this employment agreement/job offer:\n\n---\n%s\n---", systemPrompt, documentText)

	// Generate analysis using the simpler text-only approach
	resp, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash",
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
	result, err := parseAnalysisResponse(responseText)
	if err != nil {
		return nil, fmt.Errorf("failed to parse analysis response: %w", err)
	}

	return result, nil
}

// parseAnalysisResponse extracts JSON from the Gemini response
func parseAnalysisResponse(response string) (*models.AnalysisResult, error) {
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

	var result models.AnalysisResult
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		// Log the problematic JSON for debugging (truncate if too long)
		logLen := len(jsonStr)
		if logLen > 500 {
			logLen = 500
		}
		log.Printf("Failed to parse JSON: %s", jsonStr[:logLen])
		return nil, fmt.Errorf("invalid JSON format: %w", err)
	}

	// Validate risk score
	if result.RiskScore < 0 {
		result.RiskScore = 0
	} else if result.RiskScore > 100 {
		result.RiskScore = 100
	}

	// Validate risk level
	validLevels := map[string]bool{"LOW": true, "MEDIUM": true, "HIGH": true, "CRITICAL": true}
	if !validLevels[result.RiskLevel] {
		// Derive from score
		switch {
		case result.RiskScore <= 25:
			result.RiskLevel = "LOW"
		case result.RiskScore <= 50:
			result.RiskLevel = "MEDIUM"
		case result.RiskScore <= 75:
			result.RiskLevel = "HIGH"
		default:
			result.RiskLevel = "CRITICAL"
		}
	}

	return &result, nil
}
