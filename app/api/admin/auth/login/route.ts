// Updated login API with rate limiting
// app/api/admin/auth/login/route.ts - Enhanced version
import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, generateToken } from '../../../../../lib/auth'
import { loginRateLimit } from '../../../../../lib/rate-limit'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = loginRateLimit(request)
    
    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetTime)
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: resetDate.toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const isValid = await verifyPassword(password)
    
    if (!isValid) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 2000))
      return NextResponse.json(
        { error: 'Invalid password' },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    const token = generateToken()
    const response = NextResponse.json(
      { message: 'Login successful' },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      }
    )

    // Set httpOnly cookie for security
    const cookieStore = await cookies()
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}