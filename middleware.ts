// middleware.ts - Updated middleware for NextAuth
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Admin routes protection
    if (req.nextUrl.pathname.startsWith('/admin') && 
        !req.nextUrl.pathname.startsWith('/admin/login') &&
        !req.nextUrl.pathname.startsWith('/admin/error')) {
      
      if (!req.nextauth.token?.isAdmin) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    }
    
    // API routes protection
    if (req.nextUrl.pathname.startsWith('/api/admin')) {
      if (!req.nextauth.token?.isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login and error pages
        if (req.nextUrl.pathname.startsWith('/admin/login') || 
            req.nextUrl.pathname.startsWith('/admin/error')) {
          return true
        }
        
        // For admin routes, require admin token
        if (req.nextUrl.pathname.startsWith('/admin') || 
            req.nextUrl.pathname.startsWith('/api/admin')) {
          return !!token?.isAdmin
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}