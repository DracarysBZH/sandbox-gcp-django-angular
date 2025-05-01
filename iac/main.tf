resource "google_artifact_registry_repository" "djangoapi" {
  provider      = google
  location      = var.gcp_location
  repository_id = var.django_artifact_registry_name
  format        = "DOCKER"
  description   = "Docker repository for Django app"
}