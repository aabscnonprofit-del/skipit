import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("BODY:", body)

    const location_name = body.location_name || "Unknown"
    const issue_type = body.issue_type || "other"
    const description = body.description || ""
    const platform = body.platform || "other"

    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          location_name,
          issue_type,
          description,
          platform,
        },
      ])
      .select()

    if (error) {
      console.error("SUPABASE ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error("SERVER ERROR:", e)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}