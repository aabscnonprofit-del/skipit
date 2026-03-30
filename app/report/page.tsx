'use client'

import { useState } from 'react'

export default function ReportPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location_name: 'Manual test',
          issue_type: 'delay',
          platform: 'uber_eats',
          description: 'test submit',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed')
      }

      alert('SUCCESS ✅')
    } catch (e: any) {
      setError(e.message)
    }

    setLoading(false)
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl mb-6">TEST SUBMIT</h1>

      <button
        onClick={handleSubmit}
        className="bg-yellow-400 text-black px-6 py-3 rounded-xl"
      >
        {loading ? 'Sending...' : 'Submit'}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}
    </div>
  )
}