import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 登录页面不拦截
  if (pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  //  API 路由不拦截（登录 API 需要访问）
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 检查 cookie 中的登录状态
  const isLoggedIn = request.cookies.get('logged_in')?.value === 'true'

  if (!isLoggedIn) {
    // 未登录，重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
