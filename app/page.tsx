'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setReports(data || [])
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>ACTIVE SIGNALS</h1>

      {reports.map((r) => (
        <div key={r.id} style={{ marginBottom: 10 }}>
          {r.location_name}
        </div>
      ))}
    </div>
  )
}
