# Deploy Go Cloud Function to Firebase/GCP project astralelite

$PROJECT_ID = "astralelite"
$FUNCTION_NAME = "bits-chat"  # Changed from 'Chat' to avoid conflict
$REGION = "asia-south1"  # Mumbai

Write-Host "Deploying Cloud Function to project: $PROJECT_ID" -ForegroundColor Cyan

# Deploy using gcloud (Cloud Functions Gen 2)
gcloud functions deploy $FUNCTION_NAME `
    --gen2 `
    --runtime=go123 `
    --region=$REGION `
    --source=. `
    --entry-point=Chat `
    --trigger-http `
    --allow-unauthenticated `
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" `
    --project=$PROJECT_ID `
    --memory=512MB `
    --timeout=60s

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment successful!" -ForegroundColor Green
    Write-Host "Function URL: https://$REGION-$PROJECT_ID.cloudfunctions.net/$FUNCTION_NAME" -ForegroundColor Yellow
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
}
