# 🧪 SANDBOX [GCP - DJANGO - ANGULAR]

- [🚀 INFRASTRUCTURE](#-infrastructure)
  - [📌 Overview](#-overview)
  - [🧰 Prerequisites](#-prerequisites)
  - [📤 Launch the Workflow](#-launch-the-workflow)
- [🐍 DJANGO APP](#-django-app)
  - [📌 Overview](#-overview-1)
  - [🧰 Prerequisites](#-prerequisites-1)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Running Locally](#-running-locally)
  - [🧪 Running Tests](#-running-tests)
  - [📤 Deploy to Cloud Run](#-deploy-to-cloud-run)
- [🅰️ ANGULAR APP](#🅰️-angular-app)
  - [📌 Overview](#-overview-2)
  - [🧰 Prerequisites](#-prerequisites-2)
  - [📁 Project Structure](#-project-structure-1)
  - [🚀 Running Locally](#-running-locally-1)
  - [🧪 Running Tests](#-running-tests-1)
  - [📤 Deploy to Cloud Run](#-deploy-to-cloud-run-1)

## NOTES
- This repository is a sandbox for testing and learning purposes.
- It is not intended for production use.
- In production, the service account should be created with the least privilege principle
- The service account to deploy the infrastructure should not have the same permissions as the service account to deploy the application

## 🚀 INFRASTRUCTURE

[![🚀 Deploy Infrastructure](https://github.com/DracarysBZH/sandbox-gcp-django-angular/actions/workflows/infra.yml/badge.svg)](https://github.com/DracarysBZH/sandbox-gcp-django-angular/actions/workflows/infra.yml)

### 📌 Overview
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
   - `Cloud Run Admin`
   - `Service Account User`
   - `Storage Object User`
   - `Artifact Registry Administrator`
   - `Secret Manager Secret Accessor`

4. Finish the creation process.

5. Create a JSON key  
   - In the account list, click the newly created service account  
   - Keys → Add key → Create new key  
     - Choose JSON  
     - Download the file

6. Add this key to GitHub  
   - GitHub repo → Settings → Secrets and variables → Actions  
   - Add a new secret  
     - Name: `GCP_SA_KEY`  
     - Value: downloaded .json file

7. Add the other secrets  
   - `GCP_PROJECT_ID`  
   - `GCP_REGION`

8. Create a GCS bucket  
   - Cloud Storage → Create bucket  
     - Name: `gcs-sandbox-gcp-django-angular`
     - Region: europe-west1  
     - Storage class: Standard  
     - Access control: Uniform

9. In the secrets manager add a `DJANGO_SECRET_KEY`, generate it with the following command:
   - `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`

### 📤 Launch the workflow

Once all the prerequisites are in place:

1. Go to the **Actions** tab in the GitHub repository
2. Select **🚀 Deploy Infrastructure**
3. Click **Run workflow**

This will trigger the Terraform deployment to GCP

## 🐍 DJANGO APP

[![📤 Deploy Django app to Cloud Run](https://github.com/DracarysBZH/sandbox-gcp-django-angular/actions/workflows/django.yml/badge.svg)](https://github.com/DracarysBZH/sandbox-gcp-django-angular/actions/workflows/django.yml)

### 📌 Overview

This project is a sandbox Django application deployed on Google Cloud Run, following the principles of:
- Hexagonal Architecture (Ports & Adapters)
- Continuous Deployment via GitHub Actions
- Docker for containerization.

### 🧰 Prerequisites
1. Create a service account with the following roles:
   - Artifact Registry Administrator
2. Follow the instruction in [🚀 INFRASTRUCTURE](#-infrastructure)

### 📁 Project Structure
```
djangoapi/
├── djangoapi/                     # Django settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── todo_list/                     # Todo list application
│   ├── adapters/                  # Interface Adapters (HTTP, ORM, etc.)
│   │   ├── http/                  # REST views, serializers, urls
│   │   ├── factory/               # Object creation logic
│   │   ├── repositories/          # ORM implementation of SPI ports
│   │   └── exceptions/
│   ├── domain/                    # Business logic and domain entities
│   │   ├── entities/
│   │   └── services/
│   ├── ports/                     # Ports (interfaces)
│   │   ├── api/                   # Input ports (commands from interface)
│   │   └── spi/                   # Output ports (e.g., persistence)
│   ├── services/                  # Application services (use cases)
│   ├── tests/                     # Unit and integration tests
│   ├── migrations/                # Django migrations
│   └── apps.py
├── manage.py
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
└── db.sqlite3
```

This layout follows the **hexagonal (ports and adapters) architecture**, where:
- `domain/` contains core business rules,
- `ports/` defines interfaces for communication (input/output),
- `adapters/` implements those interfaces for HTTP, ORM, etc.,
- `services/` contains orchestration logic (use cases),
- `tests/` includes unit/integration tests.

This separation enhances modularity, testability, and scalability.

### 🚀 Running Locally
1. Create a virtualenv and install the dependencies.
```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

2. Initialize the migrations
```
python manage.py makemigrations
python manage.py migrate
```

3. Start the local server
```
python manage.py runserver
```

### 🧪 Running Tests
```
python manage.py test todo_list.tests
```

### 📤 Deploy to Cloud Run

Once all the prerequisites are in place, the django app is ready to be deployed to Cloud Run on push to the main branch.

The workflow:
- Builds the Docker image.
- Pushes it to Artifact Registry
- Deploys to Cloud Run using gcloud

## 🅰️ ANGULAR APP

[![📤 Deploy Angular app to Cloud Run](https://github.com/DracarysBZH/sandbox-gcp-django-angular/actions/workflows/angular.yml/badge.svg)](https://github.com/DracarysBZH/sandbox-gcp-django-angular/actions/workflows/angular.yml)

### 📌 Overview

This Angular application is deployed on Google Cloud Run, following the principles of:
- Modular Architecture
- Continuous Deployment via GitHub Actions
- Docker for containerization

### 🧰 Prerequisites
1. Follow the instructions in [🚀 INFRASTRUCTURE](#-infrastructure)

### 📁 Project Structure
```
angular-app/
├── src/
│   ├── app/
│   │   ├── core/                        # Core features module
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/
│   │   │   └── services/
│   │   ├── features/                    # Feature modules
│   │   │   └── main-layout/             # Main layout
│   │   │   └── todo-list/               # Todo list feature
│   │   │       ├── components/
│   │   │       │   ├── create-item/
│   │   │       │   ├── item/
│   │   │       │   └── todo-list/
│   │   │       ├── models/              # Todo interfaces & types
│   │   │       └── services/            # Todo-specific services
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/                    # Environment configs
│   ├── index.html
│   ├── main.ts
│   └── styles.scss                      # Global styles
├── angular.json                         # Angular CLI configuration
├── Dockerfile                           # Docker configuration
├── package.json                         # Dependencies & scripts
└── tsconfig.json                        # TypeScript configuration
```

### 🚀 Running Locally
1. Install dependencies
```
npm install
```
2. Start the development server
```
npm start
```

### 🧪 Running Tests
```
npm run test
```

### 📤 Deploy to Cloud Run

Once all the prerequisites are in place, the Angular app is ready to be deployed to Cloud Run on push to the main branch.

The workflow:
- Builds the Docker image
- Pushes it to Artifact Registry
- Deploys to Cloud Run using gcloud
