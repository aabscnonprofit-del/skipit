import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { error } = await supabase.from('reports').insert([
      {
        location_name: body.location_name || 'Unknown',
        issue_type: body.issue_type || 'other',
        platform: body.platform || 'unknown',
        lat: body.lat ?? 0,
        lng: body.lng ?? 0,
        description: body.description || null,
      },
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}