// app/api/admin/auth/login/route.ts - Session check only
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

// GET: Check if user is authenticated
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        authenticated: true, 
        user: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Not needed for Google OAuth, but keeping for compatibility
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use Google OAuth for authentication' },
    { status: 400 }
  )
}