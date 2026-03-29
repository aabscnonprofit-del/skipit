"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Report = {
  id: string
  location_name: string | null
  issue_type: string | null
}

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetch(`/api/reports/list?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
          .then((res) => res.json())
          .then((data) => {
            setReports(Array.isArray(data?.data) ? data.data : [])
            setLoading(false)
          })
          .catch(() => {
            setReports([])
            setLoading(false)
          })
      },
      () => {
        // если геолокация не дала
        fetch("/api/reports/list")
          .then((res) => res.json())
          .then((data) => {
            setReports(Array.isArray(data?.data) ? data.data : [])
            setLoading(false)
          })
      }
    )
  }, [])

  return (
    <div className="p-4 space-y-3 text-white">
      <h1 className="text-lg font-bold">ACTIVE SIGNALS</h1>

      {loading && <div>Getting your location...</div>}

      {!loading && reports.length === 0 && (
        <div>No signals nearby</div>
      )}

      {!loading &&
        reports.map((r) => (
          <Link key={r.id} href={`/report/${r.id}`}>
            <div className="bg-zinc-800 p-3 rounded-xl cursor-pointer hover:bg-zinc-700 transition">
              
              <div className="font-bold">
                {r.location_name || "Unknown"}
              </div>

              <div className="text-yellow-400">
                {r.issue_type || "unknown"}
              </div>

            </div>
          </Link>
        ))}
    </div>
  )
}