variable "gcp_project_id" {
  description = "GCP project id"
  type        = string
}

variable "gcp_location" {
  description = "GCP location"
  type        = string
}

variable "gcp_project_number" {
  description = "GCP project number"
  type        = string
}

variable "django_service_name" {
  description = "Django service name"
  type        = string
}

variable "tfstate_bucket_name" {
  description = "GCS bucket name for Terraform state"
  type        = string
}

variable "service_account_name" {
  description = "Email of the service account used to run the Cloud Run service"
  type        = string
}

variable "django_artifact_registry_name" {
  description = "Django Artifact Registry name"
  type        = string
}
