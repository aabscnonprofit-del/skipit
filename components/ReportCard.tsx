import { Report } from "@/types";
import {
  getRiskLevel,
  timeAgo,
  REPORT_TYPE_LABELS,
  APP_SOURCE_LABELS,
  ISSUE_TAG_LABELS,
  RISK_CONFIG,
} from "@/lib/utils";

interface Props {
  report: Report;
}

export default function ReportCard({ report }: Props) {
  const risk = getRiskLevel(report);
  const cfg = RISK_CONFIG[risk];

  const reportTypeLabel =
    REPORT_TYPE_LABELS[report.report_type] ?? report.report_type;

  const appSourceLabel =
    APP_SOURCE_LABELS[report.app_source] ?? report.app_source;

  const safeTags = Array.isArray(report.issue_tags)
    ? report.issue_tags.slice(0, 6)
    : [];

  const safeDescription =
    typeof report.description === "string"
      ? report.description.trim().slice(0, 220)
      : null;

  return (
    <div
      className={`
        relative rounded-xl border bg-zinc-900/80 backdrop-blur-sm p-4
        transition-all duration-200 active:scale-[0.98]
        ${cfg.border} ${cfg.glow}
      `}
    >
      {/* TOP */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {risk === "high" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dot}`}
              />
            </span>

            <h3 className="font-mono text-sm font-bold text-white truncate uppercase tracking-wider">
              {report.location_name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
            >
              {cfg.label}
            </span>

            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
              {reportTypeLabel}
            </span>

            <span className="text-[10px] font-mono text-zinc-500">
              {appSourceLabel}
            </span>
          </div>
        </div>

        {report.wait_time !== null && (
          <div className="text-right shrink-0">
            <div
              className={`text-2xl font-mono font-black leading-none ${
                report.wait_time > 20
                  ? "text-red-400"
                  : report.wait_time > 10
                  ? "text-amber-400"
                  : "text-zinc-300"
              }`}
            >
              {report.wait_time}
            </div>
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              min wait
            </div>
          </div>
        )}
      </div>

      {/* TAGS */}
      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {safeTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50"
            >
              {ISSUE_TAG_LABELS[tag] ?? tag}
            </span>
          ))}
        </div>
      )}

      {/* DESCRIPTION */}
      {safeDescription && (
        <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-3 border-l-2 border-zinc-700 pl-3 break-words">
          {safeDescription}
        </p>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono text-zinc-600 shrink-0">
          {timeAgo(report.created_at)}
        </span>

        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap ${
            report.status === "verified"
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              : report.status === "likely"
              ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              : "text-zinc-500 bg-zinc-800 border border-zinc-700"
          }`}
        >
          {report.status === "verified"
            ? "✓ verified"
            : report.status === "likely"
            ? "~ likely"
            : "? unverified"}
        </span>
      </div>
    </div>
  );
}