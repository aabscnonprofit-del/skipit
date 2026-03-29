import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default async function ReportPage({ params }: any) {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !data) {
    return (
      <div className="p-4 text-white">
        ❌ Report not found
        <br />
        ID: {params.id}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3 text-white">
      
      {/* BACK */}
      <Link href="/" className="text-sm text-zinc-400">
        ← Back to feed
      </Link>

      {/* TITLE */}
      <h1 className="text-xl font-bold">{data.location_name}</h1>

      {/* TYPE */}
      <div className="text-yellow-400 font-mono">
        {data.issue_type}
      </div>

      {/* DESCRIPTION */}
      <div className="text-zinc-300">
        {data.description || "No description"}
      </div>

      {/* PLATFORM */}
      <div className="text-xs text-zinc-500">
        Platform: {data.platform}
      </div>

    </div>
  )
}