## docker images security test
```bash
docker scout cves ghcr.io/ae-oss/ai-grade-calculator/backend:v1.0.0
```

```bash
docker scout cves ghcr.io/ae-oss/ai-grade-calculator/frontend:v1.0.0
```

## Deploy Firebase Hosting
```bash
firebase deploy --only hosting --project bits-cs-ef66a
```
## Deploy Google cloud Function
```bash
firebase deploy --only functions --project astralelite 
```
## Define secrest in Google cloud Function
```bash
 firebase functions:secrets:set PINECONE_API_KEY --project astralelite
```

## check is it correct or not
```bash
firebase functions:secrets:access PINECONE_ENVIRONMENT --project astralelite
```

## Set Gemini API Key secret
```bash
firebase functions:secrets:set GEMINI_API_KEY --project astralelite
```

## Check Gemini API Key
```bash
firebase functions:secrets:access GEMINI_API_KEY --project astralelite
```

## Deploy Go Backend (Cloud Function)
```bash
cd backend
gcloud functions deploy Chat --gen2 --runtime=go121 --region=us-central1 --source=. --entry-point=Chat --trigger-http --allow-unauthenticated --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" --project=astralelite --memory=512MB --timeout=60s
```

Or use the deploy script:
```bash
cd backend
./deploy.ps1
```

**Function URL:** `https://us-central1-astralelite.cloudfunctions.net/Chat`


```bash
ghcr.io/ae-oss/ai-grade-calculator/frontend:v1.1.0
```

```bash
ghcr.io/ae-oss/ai-grade-calculator/backend:v1.1.0
```
