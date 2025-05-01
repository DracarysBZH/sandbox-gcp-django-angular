# 🧪 SANDBOX [GCP - DJANGO - ANGULAR]

- [🚀 INFRASTRUCTURE](#-infrastructure)
  - [📝 Description](#-description)
  - [🧰 Prerequisites](#-prerequisites)
  - [📤 Launch the Workflow](#-launch-the-workflow)


## NOTES
- This repository is a sandbox for testing and learning purposes.
- It is not intended for production use.
- In production, the service account should be created with the least privilege principle
- The service account to deploy the infrastructure should not have the same permissions as the service account to deploy the application

## 🚀 INFRASTRUCTURE

[![🚀 Deploy Infrastructure](https://github.com/DracarysBZH/sandbox-gcp-django-angular/actions/workflows/infra.yml/badge.svg)](https://github.com/DracarysBZH/sandbox-gcp-django-angular/actions/workflows/infra.yml)

### 📝 Description
Example of a GitHub Actions workflow to:
- Run Terraform to create a Cloud Run service
- Authenticate with GCP using a service account key (stored in GitHub secrets)

### 🧰 Prerequisites
1. Access the project  
   - Go to [console.cloud.google.com](https://console.cloud.google.com) → select the project

2. Create a service account  
   - IAM & Admin → Service Accounts  
   - Create a service account  
     - Name  
     - ID  
   - Create and continue

3. Assign roles
   - Cloud Run Admin
   - Service Account User
   - Storage Object User
   - Artifact Registry Administrator

4. Finish the creation process.

5. Create a JSON key  
   - In the account list, click the newly created service account  
   - Keys → Add key → Create new key  
     - Choose JSON  
     - Download the file

6. Add this key to GitHub  
   - GitHub repo → Settings → Secrets and variables → Actions  
   - Add a new secret  
     - Name: GCP_SA_KEY  
     - Value: downloaded .json file

7. Add the other secrets  
   - GCP_PROJECT_ID  
   - GCP_REGION

8. Create a GCS bucket  
   - Cloud Storage → Create bucket  
     - Name: gcs-sandbox-gcp-django-angular  
     - Region: europe-west1  
     - Storage class: Standard  
     - Access control: Uniform

### 📤 Launch the workflow

Once all the prerequisites are in place:

1. Go to the **Actions** tab in the GitHub repository
2. Select **🚀 Deploy Infrastructure**
3. Click **Run workflow**

This will trigger the Terraform deployment to GCP
