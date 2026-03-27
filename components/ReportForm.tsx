"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AppSource, ReportType, IssueTag } from "@/types";
import {
  APP_SOURCE_LABELS,
  REPORT_TYPE_LABELS,
  ISSUE_TAG_LABELS,
} from "@/lib/utils";

const APP_SOURCES = Object.entries(APP_SOURCE_LABELS) as [AppSource, string][];
const REPORT_TYPES = Object.entries(REPORT_TYPE_LABELS) as [ReportType, string][];
const ISSUE_TAGS = Object.entries(ISSUE_TAG_LABELS) as [IssueTag, string][];
const WAIT_TIMES = [5, 10, 20, 30];

export default function ReportForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [appSource, setAppSource] = useState<AppSource | null>(null);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [waitTime, setWaitTime] = useState<number | null>(null);
  const [issueTags, setIssueTags] = useState<IssueTag[]>([]);
  const [description, setDescription] = useState("");

  // ─── GEO ─────────────────────────────────────────
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocLoading(false);
      },
      () => {
        setError("Could not get location");
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  // ─── TAG TOGGLE ──────────────────────────────────
  const toggleTag = (tag: IssueTag) => {
    setIssueTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
        ? [...prev, tag]
        : prev
    );
  };

  // ─── VALIDATION ──────────────────────────────────
  const canAdvance = () => {
    if (step === 1) return locationName.trim().length > 2;
    if (step === 2) return appSource !== null;
    if (step === 3) return reportType !== null;
    return true;
  };

  // ─── SUBMIT ──────────────────────────────────────
  const handleSubmit = async () => {
    if (submitting) return;
    if (!appSource || !reportType) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: locationName.trim(),
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          app_source: appSource,
          report_type: reportType,
          wait_time: waitTime,
          issue_tags: issueTags,
          description: description.trim().slice(0, 200),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubmitting(false);
    }
  };

  // ─── SUCCESS ─────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-5xl animate-bounce">✅</div>
        <h2 className="font-mono text-white text-xl font-bold uppercase">
          Report Sent
        </h2>
        <p className="font-mono text-zinc-500 text-sm">
          Helping other drivers...
        </p>
      </div>
    );
  }

  // ─── UI ──────────────────────────────────────────
  const STEPS = ["Location", "App", "Type", "Details", "Review"];

  return (
    <div className="flex flex-col gap-6">

      {/* Progress */}
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full ${
              i + 1 <= step ? "bg-amber-400" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <input
            placeholder="Location (e.g. Chipotle Kapolei)"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white font-mono"
            autoFocus
          />

          <button
            onClick={getLocation}
            disabled={locLoading}
            className="py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-400"
          >
            {coords
              ? "✓ GPS Locked"
              : locLoading
              ? "Locating..."
              : "Use my location"}
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="grid grid-cols-2 gap-3">
          {APP_SOURCES.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setAppSource(val)}
              className={`py-3 rounded-xl border ${
                appSource === val
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-zinc-700 bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="grid grid-cols-2 gap-3">
          {REPORT_TYPES.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setReportType(val)}
              className={`py-3 rounded-xl border ${
                reportType === val
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-zinc-700 bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {WAIT_TIMES.map((t) => (
              <button
                key={t}
                onClick={() => setWaitTime(t)}
                className="flex-1 py-3 border border-zinc-700 rounded-xl"
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {ISSUE_TAGS.map(([tag, label]) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 border rounded ${
                  issueTags.includes(tag)
                    ? "border-amber-400"
                    : "border-zinc-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes..."
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2"
          />
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <div className="text-sm font-mono text-zinc-400">
          Review and submit
        </div>
      )}

      {/* NAV */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 border border-zinc-700 py-3 rounded-xl"
          >
            Back
          </button>
        )}

        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex-1 bg-amber-400 text-black py-3 rounded-xl"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-amber-400 text-black py-3 rounded-xl"
          >
            {submitting ? "Sending..." : "Submit"}
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm font-mono">
          {error}
        </div>
      )}
    </div>
  );
}