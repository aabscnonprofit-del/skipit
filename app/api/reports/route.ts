import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("INCOMING REPORT:", body)

    // временно просто возвращаем успех (без БД)
    return NextResponse.json({
      success: true,
      data: body,
    })
  } catch (error: any) {
    console.error("REPORT ERROR:", error)

    return NextResponse.json(
      {
        error: error.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}