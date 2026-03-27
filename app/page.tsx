'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// расстояние между точками (в км)
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
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      fetchReports()
    }
  }, [userLocation])

  function getUserLocation() {
    if (!navigator.geolocation) {
      console.log('No geolocation')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      (err) => {
        console.log('Location error', err)
      }
    )
  }

  async function fetchReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')

    if (error) {
      console.error(error)
      return
    }

    const filtered = (data || []).filter((r) => {
      if (!userLocation) return true

      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        r.lat,
        r.lng
      )

      return distance < 10 // радиус 10 км
    })

    setReports(filtered)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>ACTIVE SIGNALS</h1>

      {!userLocation && <div>Getting your location...</div>}

      {reports.map((r) => (
        <div key={r.id} style={{ marginBottom: 10 }}>
          {r.location_name}
        </div>
      ))}
    </div>
  )
}
