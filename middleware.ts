// src/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = new Set([
  '/login',
  '/privacy-policy',
  '/terms',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Siempre dejar pasar assets/next y las rutas públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') || // si tienes APIs públicas
    PUBLIC_PATHS.has(pathname)
  ) {
    return NextResponse.next()
  }

  // 👇 Tu lógica actual de protección (ejemplo)
  // const hasSession = Boolean(req.cookies.get('your_auth_cookie'))
  // if (!hasSession) {
  //   const url = req.nextUrl.clone()
  //   url.pathname = '/login'
  //   url.searchParams.set('redirect', pathname)
  //   return NextResponse.redirect(url)
  // }

  return NextResponse.next()
}

// Alternativa o complemento: limita el ámbito del middleware
export const config = {
  matcher: [
    // no se ejecuta en estas rutas:
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|privacy-policy|terms|login).*)',
  ],
}
