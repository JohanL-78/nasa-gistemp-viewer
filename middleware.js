import { NextResponse } from 'next/server'
 
const locales = ['fr', 'en']
 
export function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
 
  if (pathnameHasLocale) return
 
  // Redirect if there is no locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fr', request.url))
  }
}
 
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}