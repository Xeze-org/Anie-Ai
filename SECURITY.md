# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Architecture Security

### Container-Based Deployment

This project uses containerized microservices deployed via Docker:

| Component | Technology | Security Measures |
|-----------|------------|-------------------|
| **Backend** | Go (Alpine container) | Non-root user, read-only filesystem, minimal base image |
| **Frontend** | Nginx (Alpine container) | Static files only, no server-side execution |
| **Registry** | GitHub Container Registry | Signed images, vulnerability scanning |

### API Key Management

| Environment | Storage Method |
|-------------|----------------|
| Production | Environment variables via container orchestration |
| Development | Local `.env` files (git-ignored) |
| CI/CD | GitHub Secrets |

**Never commit API keys to version control.**

## Security Features

### Backend Security
- ✅ Non-root container user (`appuser:1000`)
- ✅ Read-only root filesystem
- ✅ No shell access in production image
- ✅ Minimal Alpine base image
- ✅ Health checks enabled
- ✅ Resource limits enforced

### Frontend Security
- ✅ Static files served via Nginx
- ✅ No sensitive data in client bundle
- ✅ HTTPS enforced in production
- ✅ Content Security Policy headers

### CI/CD Security
- ✅ CodeQL analysis for Go and TypeScript
- ✅ TruffleHog secret scanning
- ✅ Dependabot automated updates
- ✅ Weekly container vulnerability scans

## Data Privacy

- **Chat History**: Stored locally in browser (IndexedDB), never sent to servers for storage
- **API Requests**: Only message content sent to AI service for response generation
- **No Tracking**: No analytics or user tracking implemented

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email: [admin@xeze.org](mailto:admin@xeze.org)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Initial response | 48 hours |
| Vulnerability assessment | 7 days |
| Patch release (critical) | 7 days |
| Patch release (non-critical) | 30 days |

## Security Scanning

### Manual Scans

```bash
# Scan container images with Docker Scout
docker scout cves ghcr.io/xeze-org/anie-ai/backend:latest
docker scout cves ghcr.io/xeze-org/anie-ai/frontend:latest

# Run TruffleHog locally
trufflehog git file://. --only-verified
```

### Automated Scans

Security scans run automatically via GitHub Actions:
- On every push to `main`
- On pull requests
- Weekly scheduled scans

## Dependencies

Dependencies are managed via:
- **Go**: `go.mod` with `go mod tidy`
- **Node.js**: `package-lock.json` with lockfile versioning
- **Docker**: Pinned base image versions

Dependabot automatically creates PRs for security updates.
