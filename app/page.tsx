"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import ReportCard from "@/components/ReportCard";
import { isVisible, getRiskLevel } from "@/lib/utils";
import type { Report } from "@/types";

const RISK_ORDER = { high: 0, medium: 1, low: 2, hidden: 3 };

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const fetchReports = useCallback(async () => {
    try {
      const controller = new AbortController();

      const res = await fetch("/api/reports", {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Failed to load");

      const { reports: data } = await res.json();

      setReports(data);
      setError(null);
    } catch {
      setError("Could not load reports. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    const interval = setInterval(fetchReports, 30000);

    return () => clearInterval(interval);
  }, [fetchReports]);

  // ─── PRECOMPUTE RISK (IMPORTANT) ────────────────────────────────────────────
  const processed = useMemo(() => {
    return reports
      .filter(isVisible)
      .map((r) => ({
        ...r,
        risk: getRiskLevel(r),
      }));
  }, [reports]);

  // ─── FILTER ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (filter === "all") return processed;
    return processed.filter((r) => r.risk === filter);
  }, [processed, filter]);

  // ─── COUNTS ────────────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    return {
      high: processed.filter((r) => r.risk === "high").length,
      medium: processed.filter((r) => r.risk === "medium").length,
      low: processed.filter((r) => r.risk === "low").length,
    };
  }, [processed]);

  // ─── SORT ──────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]
    );
  }, [filtered]);

  // ─── STAT COMPONENT ────────────────────────────────────────────────────────
  const StatPill = ({
    value,
    label,
    color,
    type,
  }: {
    value: number;
    label: string;
    color: string;
    type: "high" | "medium" | "low";
  }) => (
    <button
      onClick={() => setFilter(filter === type ? "all" : type)}
      className={`flex-1 py-3 rounded-xl border font-mono text-center transition-all duration-150 active:scale-[0.97] ${
        filter === type
          ? color === "red"
            ? "border-red-500/60 bg-red-500/10"
            : color === "amber"
            ? "border-amber-400/50 bg-amber-400/10"
            : "border-zinc-500/40 bg-zinc-800/60"
          : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      <div
        className={`text-xl font-black ${
          color === "red"
            ? "text-red-400"
            : color === "amber"
            ? "text-amber-400"
            : "text-zinc-400"
        }`}
      >
        {value}
      </div>
      <div className="text-[9px] text-zinc-500 uppercase tracking-widest">
        {label}
      </div>
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* HERO */}
      <div className="pt-2">
        <h1 className="font-mono text-2xl font-black text-white uppercase tracking-tight leading-tight">
          Active
          <br />
          <span className="text-amber-400">Signals</span>
        </h1>

        <p className="font-mono text-xs text-zinc-500 mt-1">
          {processed.length} active · auto-expires in 8h · refreshes every 30s
        </p>
      </div>

      {/* STATS */}
      <div className="flex gap-2">
        <StatPill value={counts.high} label="High" color="red" type="high" />
        <StatPill value={counts.medium} label="Medium" color="amber" type="medium" />
        <StatPill value={counts.low} label="Low" color="gray" type="low" />
      </div>

      {/* FILTER INDICATOR */}
      {filter !== "all" && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            Showing: {filter} risk only
          </span>
          <button
            onClick={() => setFilter("all")}
            className="font-mono text-xs text-amber-400 underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-zinc-800/40 border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="font-mono text-red-400 text-sm">{error}</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🟢</div>

          <h3 className="font-mono text-white font-bold uppercase tracking-wider mb-2">
            All Clear
          </h3>

          <p className="font-mono text-zinc-500 text-sm max-w-xs mx-auto">
            No active signals right now.
          </p>

          <Link
            href="/report"
            className="inline-block mt-6 bg-amber-400 text-black font-mono text-sm font-black px-6 py-3 rounded-xl uppercase tracking-wider"
          >
            + File Report
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {/* FAB */}
      {sorted.length > 0 && (
        <Link
          href="/report"
          className="fixed bottom-6 right-4 bg-amber-400 text-black font-mono font-black text-sm px-5 py-4 rounded-2xl shadow-2xl shadow-amber-400/30 uppercase tracking-wider active:scale-95 transition-transform flex items-center gap-2 z-40"
        >
          ⚡ Report
        </Link>
      )}
    </div>
  );
}