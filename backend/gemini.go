package backend

import (
	"context"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// GeminiService handles all Gemini API interactions
type GeminiService struct {
	client *genai.Client
	model  *genai.GenerativeModel
}

// Config holds configuration for Gemini service
type Config struct {
	APIKey          string
	MaxOutputTokens int32
	Temperature     float32
	TopP            float32
	TopK            int32
}

// DefaultConfig returns default configuration
func DefaultConfig(apiKey string) Config {
	return Config{
		APIKey:          apiKey,
		MaxOutputTokens: 8192,
		Temperature:     0.7,
		TopP:            0.95,
		TopK:            40,
	}
}

// NewGeminiService creates a new Gemini service with Flash model
// API key is passed as parameter for better security and testability
func NewGeminiService(ctx context.Context, apiKey string) (*GeminiService, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("API key is required")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create client: %w", err)
	}

	// Gemini 2.0 Flash - using correct model path format
	model := client.GenerativeModel("gemini-2.0-flash")

	// Configure for long instructions handling
	model.SetMaxOutputTokens(8192)
	model.SetTemperature(0.7)
	model.SetTopP(0.95)
	model.SetTopK(40)

	return &GeminiService{
		client: client,
		model:  model,
	}, nil
}

// Close closes the Gemini client
func (g *GeminiService) Close() error {
	return g.client.Close()
}

// Chat sends a message with Anie's system instructions
func (g *GeminiService) Chat(ctx context.Context, message string, additionalInstructions string) (string, error) {
	// Always use Anie's base instructions + any additional context
	instructions := SystemInstructions
	if additionalInstructions != "" {
		instructions = instructions + "\n\n# Additional Context:\n" + additionalInstructions
	}

	// Gemini Flash handles long context well (up to 1M tokens)
	prompt := fmt.Sprintf("System Instructions:\n%s\n\nUser Message:\n%s", instructions, message)

	resp, err := g.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %w", err)
	}

	return extractResponse(resp), nil
}

// ChatWithHistory maintains conversation context with Anie's persona
func (g *GeminiService) ChatWithHistory(ctx context.Context, history []Message, additionalInstructions string) (string, error) {
	chat := g.model.StartChat()

	// Always use Anie's base instructions + any additional context
	instructions := SystemInstructions
	if additionalInstructions != "" {
		instructions = instructions + "\n\n# Additional Context:\n" + additionalInstructions
	}

	// Set system instruction
	g.model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{genai.Text(instructions)},
	}

	// Add history
	for _, msg := range history[:len(history)-1] {
		role := "user"
		if msg.Role == "assistant" {
			role = "model"
		}
		chat.History = append(chat.History, &genai.Content{
			Role:  role,
			Parts: []genai.Part{genai.Text(msg.Content)},
		})
	}

	// Send the last message
	lastMsg := history[len(history)-1]
	resp, err := chat.SendMessage(ctx, genai.Text(lastMsg.Content))
	if err != nil {
		return "", fmt.Errorf("failed to send message: %w", err)
	}

	return extractResponse(resp), nil
}

// StreamChat streams response for long outputs with Anie's persona
func (g *GeminiService) StreamChat(ctx context.Context, message string, additionalInstructions string, onChunk func(string)) error {
	// Always use Anie's base instructions + any additional context
	instructions := SystemInstructions
	if additionalInstructions != "" {
		instructions = instructions + "\n\n# Additional Context:\n" + additionalInstructions
	}

	prompt := fmt.Sprintf("System Instructions:\n%s\n\nUser Message:\n%s", instructions, message)

	iter := g.model.GenerateContentStream(ctx, genai.Text(prompt))

	for {
		resp, err := iter.Next()
		if err != nil {
			break
		}

		text := extractResponse(resp)
		if text != "" {
			onChunk(text)
		}
	}

	return nil
}

// Message represents a chat message
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// extractResponse extracts text from Gemini response
func extractResponse(resp *genai.GenerateContentResponse) string {
	var result string
	for _, candidate := range resp.Candidates {
		if candidate.Content != nil {
			for _, part := range candidate.Content.Parts {
				if text, ok := part.(genai.Text); ok {
					result += string(text)
				}
			}
		}
	}
	return result
}
