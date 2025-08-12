// app/api/admin/posts/route.ts - Updated for NextAuth
import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, savePost, deletePost } from '../../../../lib/posts'
import { getAuthSession } from '../../../../lib/auth-helpers'

// Helper function to check authentication
async function checkAuth() {
  const session = await getAuthSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET() {
  // Check authentication
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const posts = getAllPosts()
    return NextResponse.json(posts)
  } catch (err) {
    console.error('Failed to fetch posts:', err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const { slug, frontmatter, content } = body

    // Validate required fields
    if (!slug || !frontmatter || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, frontmatter, content' },
        { status: 400 }
      )
    }

    // Validate frontmatter required fields
    if (!frontmatter.title || !frontmatter.summary || !frontmatter.date || !frontmatter.category) {
      return NextResponse.json(
        { error: 'Missing required frontmatter fields: title, summary, date, category' },
        { status: 400 }
      )
    }

    savePost(slug, frontmatter, content)
    return NextResponse.json({ message: 'Post created successfully' }, { status: 201 })
  } catch (err) {
    console.error('Failed to create post:', err)
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const { slug, frontmatter, content } = body

    // Validate required fields
    if (!slug || !frontmatter || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, frontmatter, content' },
        { status: 400 }
      )
    }

    // Validate frontmatter required fields
    if (!frontmatter.title || !frontmatter.summary || !frontmatter.date || !frontmatter.category) {
      return NextResponse.json(
        { error: 'Missing required frontmatter fields: title, summary, date, category' },
        { status: 400 }
      )
    }

    savePost(slug, frontmatter, content)
    return NextResponse.json({ message: 'Post updated successfully' })
  } catch (err) {
    console.error('Failed to update post:', err)
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  // Check authentication
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
    }

    // Validate slug format (basic security check)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
    }

    deletePost(slug)
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (err) {
    console.error('Failed to delete post:', err)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}