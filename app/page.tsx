'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function Home() {
  const [reports, setReports] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<any>(null)
  const [radius, setRadius] = useState(10)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      })
    })
  }, [])

  useEffect(() => {
    if (userLocation) fetchReports()
  }, [userLocation, radius])

  async function fetchReports() {
    const { data } = await supabase.from('reports').select('*')

    const filtered = (data || []).filter((r) => {
      const d = getDistance(
        userLocation.lat,
        userLocation.lng,
        r.lat,
        r.lng
      )
      return d < radius
    })

    setReports(filtered)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>ACTIVE SIGNALS</h1>

      <div style={{ marginBottom: 20 }}>
        Radius:
        <button onClick={() => setRadius(5)}>5 km</button>
        <button onClick={() => setRadius(10)}>10 km</button>
        <button onClick={() => setRadius(50)}>50 km</button>
      </div>

      {reports.map((r) => (
        <div key={r.id} style={{ marginBottom: 10 }}>
          {r.location_name}
        </div>
      ))}
    </div>
  )
}
