# Build stage
FROM golang:1.26-alpine AS builder

# Install git and ca-certificates (needed for fetching dependencies)
RUN apk add --no-cache git ca-certificates

# Set working directory
WORKDIR /app

# Copy go mod files first for dependency caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY main.go ./
COPY internal/ ./internal/

# Build the application
# CGO_ENABLED=0 creates a static binary
# -ldflags="-s -w" strips debug info for smaller binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o server .

# Runtime stage
FROM alpine:3.21

# Install ca-certificates for HTTPS requests to Gemini API
RUN apk --no-cache add ca-certificates

# Create non-root user for security
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -D appuser

WORKDIR /app

# Copy binary from builder and set ownership immediately
COPY --from=builder --chown=appuser:appgroup /app/server .

# Ensure binary is executable
RUN chmod +x /app/server

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run the server
CMD ["./server"]
