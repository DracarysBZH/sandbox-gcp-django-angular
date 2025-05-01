terraform {
  backend "gcs" {
    bucket = "gcs-sandbox-gcp-django-angular"
    prefix  = "terraform/state"
  }
}
