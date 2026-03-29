import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      location_name,
      lat,
      lng,
      report_type,
      issue_tags,
      description,
    } = body

    if (!location_name) {
      return NextResponse.json(
        { error: "location_name required" },
        { status: 400 }
      )
    }

    const { error } = await supabase.from("reports").insert([
      {
        location_name,
        lat,
        lng,
        report_type,
        issue_tags,
        description,
      },
    ])

    if (error) {
      console.error("SUPABASE ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("REPORT ERROR:", error)
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    )
  }
}
