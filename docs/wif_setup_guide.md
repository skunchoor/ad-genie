# Setting up Workload Identity Federation for GitHub Actions (PowerShell)

Workload Identity Federation (WIF) is the modern, keyless authentication method for Google Cloud. It allows GitHub Actions to securely authenticate without you needing to download or store long-lived JSON service account keys.

You can run these commands directly in your **PowerShell** terminal.

## 1. Define Variables
First, set these variables in your terminal. Replace the values with your actual Project ID and GitHub repository.

```powershell
$PROJECT_ID = "my-google-cloud-project-id" # Replace this!
$REPO = "skunchoor/ad-genie" # Your GitHub repository
$SA_NAME = "github-actions-sa" # Name of the service account we'll create
```

## 2. Set the current Project
```powershell
gcloud config set project $PROJECT_ID
```

## 3. Enable Required APIs
Enable the IAM Credentials API (required for WIF):
```powershell
gcloud services enable iamcredentials.googleapis.com `
  --project $PROJECT_ID
```

## 4. Create a Service Account
Create the service account that GitHub Actions will impersonate:
```powershell
gcloud iam service-accounts create $SA_NAME `
  --project $PROJECT_ID
```

## 5. Grant Permissions to the Service Account
Give the service account permission to deploy to Cloud Run:
```powershell
# Allow it to deploy to Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" `
  --role="roles/run.admin"

# Allow it to act as itself
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" `
  --role="roles/iam.serviceAccountUser"
```

## 6. Create the Workload Identity Pool
Create a pool for GitHub:
```powershell
gcloud iam workload-identity-pools create "github-pool" `
  --project=$PROJECT_ID `
  --location="global" `
  --display-name="GitHub Actions Pool"
```

## 7. Create the Workload Identity Provider
Connect the pool to GitHub's OIDC provider:
```powershell
gcloud iam workload-identity-pools providers create-oidc "github-provider" `
  --project=$PROJECT_ID `
  --location="global" `
  --workload-identity-pool="github-pool" `
  --display-name="GitHub provider" `
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" `
  --attribute-condition="assertion.repository == '$REPO'" `
  --issuer-uri="https://token.actions.githubusercontent.com"
```

## 8. Bind the Pool to the Service Account
Allow the GitHub repository to impersonate the service account via the pool:
```powershell
$WORKLOAD_IDENTITY_POOL_ID = (gcloud iam workload-identity-pools describe "github-pool" `
  --project=$PROJECT_ID --location="global" --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" `
  --project=$PROJECT_ID `
  --role="roles/iam.workloadIdentityUser" `
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO}"
```

## 9. Get Your Secrets for GitHub
Finally, run these two commands to get the values you need to put into GitHub Secrets:

**Get the Service Account Email (`WIF_SERVICE_ACCOUNT`):**
```powershell
echo "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
```

**Get the Provider Name (`WIF_PROVIDER`):**
```powershell
gcloud iam workload-identity-pools providers describe "github-provider" `
  --project=$PROJECT_ID `
  --location="global" `
  --workload-identity-pool="github-pool" `
  --format="value(name)"
```

---

### Next Steps

1. Copy the outputs from step 9.
2. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
3. Create two new repository secrets:
   - `WIF_PROVIDER` (paste the long provider name string)
   - `WIF_SERVICE_ACCOUNT` (paste the email address)
4. I have already updated your `deploy-backend.yml` workflow to use these variables!
