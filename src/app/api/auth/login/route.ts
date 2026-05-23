import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const password = formData.get('password') as string
  const correctPassword = process.env.SITE_PASSWORD

  if (password === correctPassword) {
    const response = NextResponse.redirect(new URL('/weight', request.url))
    response.cookies.set('logged_in', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    })
    return response
  }

  return NextResponse.redirect(new URL('/login?error=1', request.url))
}
