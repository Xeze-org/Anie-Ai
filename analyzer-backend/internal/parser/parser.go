package parser

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/ledongthuc/pdf"
	"github.com/nguyenthenguyen/docx"
)

// ParseDocument extracts text content from base64 encoded document
func ParseDocument(base64Content, filename string) (string, error) {
	// Decode base64
	data, err := base64.StdEncoding.DecodeString(base64Content)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}

	ext := strings.ToLower(filepath.Ext(filename))

	switch ext {
	case ".txt":
		return string(data), nil
	case ".docx":
		return parseDocx(data)
	case ".pdf":
		return parsePDF(data)
	default:
		// Try as plain text
		return string(data), nil
	}
}

// parseDocx extracts text from DOCX bytes
func parseDocx(data []byte) (string, error) {
	// Write to temp file for docx library
	tmpFile, err := os.CreateTemp("", "ea-doc-*.docx")
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	defer os.Remove(tmpFile.Name())
	defer tmpFile.Close()

	if _, err := tmpFile.Write(data); err != nil {
		return "", fmt.Errorf("failed to write temp file: %w", err)
	}
	tmpFile.Close()

	// Read docx from file
	doc, err := docx.ReadDocxFile(tmpFile.Name())
	if err != nil {
		return "", fmt.Errorf("failed to parse DOCX: %w", err)
	}
	defer doc.Close()

	// Get editable content
	content := doc.Editable().GetContent()

	return content, nil
}

// parsePDF extracts text from PDF bytes using ledongthuc/pdf library
func parsePDF(data []byte) (string, error) {
	// Write to temp file for pdf library
	tmpFile, err := os.CreateTemp("", "ea-pdf-*.pdf")
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	defer os.Remove(tmpFile.Name())

	if _, err := tmpFile.Write(data); err != nil {
		tmpFile.Close()
		return "", fmt.Errorf("failed to write temp file: %w", err)
	}
	tmpFile.Close()

	// Open PDF file
	f, r, err := pdf.Open(tmpFile.Name())
	if err != nil {
		return "", fmt.Errorf("failed to open PDF: %w", err)
	}
	defer f.Close()

	// Extract text from all pages
	var buf bytes.Buffer
	totalPages := r.NumPage()

	for pageNum := 1; pageNum <= totalPages; pageNum++ {
		page := r.Page(pageNum)
		if page.V.IsNull() {
			continue
		}

		text, err := page.GetPlainText(nil)
		if err != nil {
			// Try to continue with other pages
			continue
		}
		buf.WriteString(text)
		buf.WriteString("\n")
	}

	content := buf.String()
	if strings.TrimSpace(content) == "" {
		return "", fmt.Errorf("could not extract text from PDF - the PDF may be image-based or encrypted")
	}

	return content, nil
}

// NormalizeText cleans up extracted text
func NormalizeText(text string) string {
	// Remove excessive whitespace
	text = strings.Join(strings.Fields(text), " ")

	// Basic cleanup
	text = strings.ReplaceAll(text, "\r\n", "\n")
	text = strings.ReplaceAll(text, "\r", "\n")

	return strings.TrimSpace(text)
}
