resource "google_cloud_run_v2_service" "django" {
  name     = var.django_service_name
  project  = var.gcp_project_id
  location = var.gcp_location

  template {
    service_account = var.service_account_name

    volumes {
      name = "dbsqlite"

      gcs {
        bucket    = "gcs-sandbox-gcp-django-angular"
        read_only = false
      }
    }

    containers {
      image = "gcr.io/cloudrun/hello"

      env {
        name  = "DJANGO_CLOUD_RUN_SERVICE"
        value = var.django_service_name
      }

      env {
        name  = "ANGULAR_CLOUD_RUN_SERVICE"
        value = var.angular_service_name
      }

      env {
        name  = "GCP_REGION"
        value = var.gcp_location
      }

      env {
        name  = "GCP_PROJECT_NUMBER"
        value = var.gcp_project_number
      }

      env {
        name  = "DJANGO_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = "DJANGO_SECRET_KEY"
            version = "latest"
          }
        }
      }

      volume_mounts {
        name = "dbsqlite"
        mount_path = "/db"
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "django_member" {
  project = google_cloud_run_v2_service.django.project
  location = google_cloud_run_v2_service.django.location
  name = google_cloud_run_v2_service.django.name
  role = "roles/run.invoker"
  member = "allUsers"
}
