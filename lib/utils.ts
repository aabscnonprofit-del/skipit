import type { Report, RiskLevel, ReportType, AppSource, IssueTag } from "@/types";

// ─── CONFIG ─────────────────────────────────────────────
const TTL_HOURS = 8;

// ─── HELPERS ────────────────────────────────────────────
function safeTime(dateStr: string): number {
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? Date.now() : t;
}

// ─── TTL / RISK ─────────────────────────────────────────
export function getRiskLevel(report: Report): RiskLevel {
  const now = Date.now();
  const created = safeTime(report.created_at);

  let hoursAgo = (now - created) / 1000 / 60 / 60;

  // protect from future timestamps
  if (hoursAgo < 0) hoursAgo = 0;

  if (hoursAgo >= TTL_HOURS) return "hidden";

  const isHighContent =
    (report.wait_time !== null && report.wait_time > 20) ||
    report.report_type === "closed" ||
    report.report_type === "mismatch" ||
    report.report_type === "safety";

  if (hoursAgo < 2) {
    return isHighContent ? "high" : "medium";
  }

  if (hoursAgo < 6) {
    return isHighContent ? "medium" : "low";
  }

  return "low";
}

export function isVisible(report: Report): boolean {
  return getRiskLevel(report) !== "hidden";
}

// ─── TIME DISPLAY ───────────────────────────────────────
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const created = safeTime(dateStr);

  let seconds = Math.floor((now - created) / 1000);

  if (seconds < 0) seconds = 0;

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// ─── LABELS ─────────────────────────────────────────────
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  delay: "Delay",
  order_issue: "Order Issue",
  road_issue: "Road Issue",
  closed: "Closed",
  mismatch: "Item Mismatch",
  safety: "Safety",
};

export const APP_SOURCE_LABELS: Record<AppSource, string> = {
  uber_eats: "Uber Eats",
  doordash: "DoorDash",
  instacart: "Instacart",
  roadie: "Roadie",
  other: "Other",
};

export const ISSUE_TAG_LABELS: Record<IssueTag, string> = {
  order_not_ready: "Not Ready",
  order_not_found: "Not Found",
  store_closed: "Store Closed",
  long_wait: "Long Wait",
  oversized_item: "Oversized",
  assembled_item: "Assembly Req.",
  cannot_fit_vehicle: "Won't Fit",
  duplicate_drivers: "Dupe Drivers",
  unsafe: "Unsafe",
  dog: "Dog",
  dark_area: "Dark Area",
  hard_access: "Hard Access",
};

// ─── RISK CONFIG ────────────────────────────────────────
export const RISK_CONFIG = {
  high: {
    label: "HIGH RISK",
    dot: "bg-red-500",
    border: "border-red-500/40",
    badge: "bg-red-500/20 text-red-400 border border-red-500/30",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
  },
  medium: {
    label: "MEDIUM",
    dot: "bg-amber-400",
    border: "border-amber-400/30",
    badge: "bg-amber-400/20 text-amber-300 border border-amber-400/30",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.10)]",
  },
  low: {
    label: "LOW",
    dot: "bg-zinc-500",
    border: "border-zinc-700",
    badge: "bg-zinc-800 text-zinc-400 border border-zinc-700",
    glow: "",
  },
  hidden: {
    label: "EXPIRED",
    dot: "bg-zinc-700",
    border: "border-zinc-800",
    badge: "bg-zinc-900 text-zinc-600 border border-zinc-800",
    glow: "",
  },
};

// ─── TTL CALC ───────────────────────────────────────────
export function calcExpiresAt(createdAt: string): string {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return new Date().toISOString();

  d.setHours(d.getHours() + TTL_HOURS);
  return d.toISOString();
}