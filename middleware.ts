import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host')

  if (hostname?.startsWith('www.')) {
    url.hostname = hostname.replace('www.', '')
    return NextResponse.redirect(`https://${url.hostname}${url.pathname}${url.search}`)
  }

  return NextResponse.next()
}
