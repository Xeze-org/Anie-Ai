// Package backend contains the Cloud Function for BITS CS chatbot
package backend

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

var (
	geminiClient *genai.Client
	geminiModel  *genai.GenerativeModel
	initOnce     sync.Once
	initErr      error
)

func init() {
	// Register the HTTP function
	functions.HTTP("Chat", ChatHandler)
}

// Initialize Gemini client (lazy initialization)
func initGemini() error {
	initOnce.Do(func() {
		ctx := context.Background()

		// Get API key from Firebase/GCP secrets
		apiKey := os.Getenv("GEMINI_API_KEY")
		if apiKey == "" {
			initErr = fmt.Errorf("GEMINI_API_KEY not set")
			return
		}

		geminiClient, initErr = genai.NewClient(ctx, option.WithAPIKey(apiKey))
		if initErr != nil {
			return
		}

		// Use Gemini Flash latest
		geminiModel = geminiClient.GenerativeModel("models/gemini-flash-latest")
		geminiModel.SetMaxOutputTokens(8192)
		geminiModel.SetTemperature(0.7)
	})

	return initErr
}

// ChatRequest represents the incoming chat request
type ChatRequest struct {
	Message           string    `json:"message"`
	AdditionalContext string    `json:"additionalContext,omitempty"`
	History           []Message `json:"history,omitempty"`
}

// Message represents a chat message
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatResponse represents the response
type ChatResponse struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}

// ChatHandler is the Cloud Function entry point
func ChatHandler(w http.ResponseWriter, r *http.Request) {
	// CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Initialize Gemini
	if err := initGemini(); err != nil {
		log.Printf("Failed to initialize Gemini: %v", err)
		sendErrorResponse(w, "Service initialization failed", http.StatusInternalServerError)
		return
	}

	// Parse request
	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Message == "" && len(req.History) == 0 {
		sendErrorResponse(w, "Message or history is required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Build prompt with Anie's system instructions
	instructions := SystemInstructions
	if req.AdditionalContext != "" {
		instructions = instructions + "\n\n# Additional Context:\n" + req.AdditionalContext
	}

	var response string
	var err error

	if len(req.History) > 0 {
		// Chat with history
		response, err = chatWithHistory(ctx, req.History, instructions)
	} else {
		// Single message
		prompt := fmt.Sprintf("System Instructions:\n%s\n\nUser Message:\n%s", instructions, req.Message)
		resp, genErr := geminiModel.GenerateContent(ctx, genai.Text(prompt))
		if genErr != nil {
			err = genErr
		} else {
			response = extractResponse(resp)
		}
	}

	if err != nil {
		log.Printf("Gemini error: %v", err)
		sendErrorResponse(w, "Failed to generate response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ChatResponse{Response: response})
}

func chatWithHistory(ctx context.Context, history []Message, instructions string) (string, error) {
	chat := geminiModel.StartChat()

	// Set system instruction
	geminiModel.SystemInstruction = &genai.Content{
		Parts: []genai.Part{genai.Text(instructions)},
	}

	// Add history (except last message)
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
		return "", err
	}

	return extractResponse(resp), nil
}

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

func sendErrorResponse(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ChatResponse{Error: message})
}
