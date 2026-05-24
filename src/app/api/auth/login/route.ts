import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body
    const correctPassword = process.env.SITE_PASSWORD

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('logged_in', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 天
      })
      return response
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
