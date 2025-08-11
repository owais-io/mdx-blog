// app/api/admin/posts/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, savePost, deletePost } from '../../../../lib/posts'

export async function GET() {
  try {
    const posts = getAllPosts()
    return NextResponse.json(posts)
  } catch (err) {
    console.error('Failed to fetch posts:', err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug, frontmatter, content } = await request.json()
    savePost(slug, frontmatter, content)
    return NextResponse.json({ message: 'Post created successfully' }, { status: 201 })
  } catch (err) {
    console.error('Failed to create post:', err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { slug, frontmatter, content } = await request.json()
    savePost(slug, frontmatter, content)
    return NextResponse.json({ message: 'Post updated successfully' })
  } catch (err) {
    console.error('Failed to update post:', err)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }
    deletePost(slug)
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (err) {
    console.error('Failed to delete post:', err)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}