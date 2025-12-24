#!/bin/bash
# Deploy Go Cloud Function to Firebase/GCP

PROJECT_ID="astralelite"
FUNCTION_NAME="bits-chat"
REGION="asia-south1"  # Mumbai

echo "🚀 Deploying Cloud Function to project: $PROJECT_ID"

# Deploy using gcloud (Cloud Functions Gen 2)
gcloud functions deploy $FUNCTION_NAME \
    --gen2 \
    --runtime=go123 \
    --region=$REGION \
    --source=. \
    --entry-point=Chat \
    --trigger-http \
    --allow-unauthenticated \
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
    --project=$PROJECT_ID \
    --memory=512MB \
    --timeout=60s

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🔗 Function URL: https://$REGION-$PROJECT_ID.cloudfunctions.net/$FUNCTION_NAME"
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi
