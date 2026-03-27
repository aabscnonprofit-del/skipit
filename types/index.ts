export type AppSource =
  | "uber_eats"
  | "doordash"
  | "instacart"
  | "roadie"
  | "other";

export type ReportType =
  | "delay"
  | "order_issue"
  | "road_issue"
  | "closed"
  | "mismatch"
  | "safety";

export type IssueTag =
  | "order_not_ready"
  | "order_not_found"
  | "store_closed"
  | "long_wait"
  | "oversized_item"
  | "assembled_item"
  | "cannot_fit_vehicle"
  | "duplicate_drivers"
  | "unsafe"
  | "dog"
  | "dark_area"
  | "hard_access";

export type ReportStatus = "verified" | "likely" | "unverified";

export type RiskLevel = "high" | "medium" | "low" | "hidden";

export interface Report {
  id: string;
  created_at: string;
  location_name: string;
  lat: number | null;
  lng: number | null;
  app_source: AppSource;
  report_type: ReportType;
  wait_time: number | null;
  issue_tags: IssueTag[];
  description: string | null;
  audio_url: string | null;
  status: ReportStatus;
  expires_at: string;
}

export interface CreateReportPayload {
  location_name: string;
  lat: number | null;
  lng: number | null;
  app_source: AppSource;
  report_type: ReportType;
  wait_time: number | null;
  issue_tags: IssueTag[];
  description?: string;
  audio_url?: string;
}

export interface ReportsResponse {
  reports: Report[];
}

export interface ReportResponse {
  report: Report;
}