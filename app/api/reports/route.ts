import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calcExpiresAt } from "@/lib/utils";
import type { CreateReportPayload } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reports
// Returns only ACTIVE reports (not expired)
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .not("expires_at", "is", null)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ reports: data ?? [] });
  } catch (err) {
    console.error("[GET /api/reports]", err);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reports
// Create new report (validated + normalized)
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: CreateReportPayload = await req.json();

    // ─── REQUIRED FIELDS ──────────────────────────────────────────────────────
    if (!body.location_name || !body.app_source || !body.report_type) {
      return NextResponse.json(
        {
          error:
            "location_name, app_source, and report_type are required",
        },
        { status: 400 }
      );
    }

    // ─── NORMALIZATION ────────────────────────────────────────────────────────
    const location_name = body.location_name.trim().slice(0, 120);

    const description = body.description
      ? body.description.trim().slice(0, 300)
      : null;

    const issue_tags = Array.isArray(body.issue_tags)
      ? body.issue_tags.slice(0, 10)
      : [];

    const wait_time =
      typeof body.wait_time === "number" && body.wait_time > 0
        ? body.wait_time
        : null;

    const lat =
      typeof body.lat === "number" ? body.lat : null;

    const lng =
      typeof body.lng === "number" ? body.lng : null;

    // ─── TIME ─────────────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    const expires_at = calcExpiresAt(now);

    // ─── STATUS LOGIC (BETTER) ────────────────────────────────────────────────
    let status: "verified" | "likely" | "unverified" = "unverified";

    if (lat !== null && lng !== null) {
      status = "likely";
    }

    if (
      lat !== null &&
      lng !== null &&
      wait_time !== null &&
      wait_time >= 5
    ) {
      status = "verified";
    }

    // ─── INSERT ──────────────────────────────────────────────────────────────
    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          location_name,
          lat,
          lng,
          app_source: body.app_source,
          report_type: body.report_type,
          wait_time,
          issue_tags,
          description,
          audio_url: null,
          status,
          expires_at,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ report: data }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reports]", err);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}