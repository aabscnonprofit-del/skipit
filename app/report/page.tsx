import ReportForm from "@/components/ReportForm"

export default function ReportPage() {
  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div className="pt-2">
        <h1 className="font-mono text-2xl font-black text-white uppercase tracking-tight leading-tight">
          File a <br />
          <span className="text-yellow-400">Report</span>
        </h1>

        <p className="font-mono text-sm text-white/80 mt-2">
          Help other drivers avoid bad stops
        </p>
      </div>

      {/* FORM */}
      <div className="bg-zinc-900/70 border border-zinc-700 rounded-2xl p-5 shadow-inner">
        <ReportForm />
      </div>

      {/* FOOTER */}
      <div className="pt-2">
        <p className="font-mono text-xs text-white/60 text-center leading-relaxed">
          Reports expire automatically after 8 hours.
          <br />
          No account required. Your signal helps the community.
        </p>
      </div>

    </div>
  )
}