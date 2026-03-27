import ReportForm from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="pt-2">
        <h1 className="font-mono text-2xl font-black text-white uppercase tracking-tight leading-tight">
          File a
          <br />
          <span className="text-amber-400">Report</span>
        </h1>

        <p className="font-mono text-xs text-zinc-500 mt-1">
          Help other drivers avoid bad stops
        </p>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-inner">
        <ReportForm />
      </div>

      {/* FOOTNOTE */}
      <div className="pt-2">
        <p className="font-mono text-[10px] text-zinc-600 text-center leading-relaxed">
          Reports expire automatically after 8 hours.
          <br />
          No account required. Your signal helps the community.
        </p>
      </div>

    </div>
  );
}