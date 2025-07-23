resource "google_cloud_run_v2_service" "angular" {
  name     = var.angular_service_name
  project  = var.gcp_project_id
  location = var.gcp_location

  template {
    service_account = var.service_account_name

    containers {
      image = "gcr.io/cloudrun/hello"
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "angular_member" {
  project = google_cloud_run_v2_service.angular.project
  location = google_cloud_run_v2_service.angular.location
  name = google_cloud_run_v2_service.angular.name
  role = "roles/run.invoker"
  member = "allUsers"
}
