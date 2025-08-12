// app/admin/page.tsx - Updated with NextAuth
'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Post {
  slug: string
  title: string
  summary: string
  date: string
  category: string
  content: string
  tldr?: string[]
  faq?: Array<{ q: string; a: string }>
}

interface FormData {
  title: string
  summary: string
  date: string
  category: string
  content: string
  tldr1: string
  tldr2: string
  tldr3: string
  q1: string; a1: string
  q2: string; a2: string
  q3: string; a3: string
  q4: string; a4: string
  q5: string; a5: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    summary: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    content: '',
    tldr1: '', tldr2: '', tldr3: '',
    q1: '', a1: '', q2: '', a2: '', q3: '', a3: '', q4: '', a4: '', q5: '', a5: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session?.user?.isAdmin) {
      router.push('/admin/login')
      return
    }

    fetchPosts()
  }, [session, status, router])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/posts')
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const slug = editingPost ? editingPost.slug : generateSlug(formData.title)
    
    const tldr = [formData.tldr1, formData.tldr2, formData.tldr3].filter(Boolean)
    const faq = [
      { q: formData.q1, a: formData.a1 },
      { q: formData.q2, a: formData.a2 },
      { q: formData.q3, a: formData.a3 },
      { q: formData.q4, a: formData.a4 },
      { q: formData.q5, a: formData.a5 }
    ].filter(item => item.q && item.a)

    const postData = {
      slug,
      frontmatter: {
        title: formData.title,
        summary: formData.summary,
        date: formData.date,
        category: formData.category,
        ...(tldr.length > 0 && { tldr }),
        ...(faq.length > 0 && { faq })
      },
      content: formData.content
    }

    try {
      const response = await fetch('/api/admin/posts', {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        alert(editingPost ? 'Post updated successfully!' : 'Post created successfully!')
        setShowForm(false)
        setEditingPost(null)
        resetForm()
        fetchPosts()
      } else {
        const errorData = await response.json()
        alert(`Error saving post: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '', summary: '', date: new Date().toISOString().split('T')[0], category: '', content: '',
      tldr1: '', tldr2: '', tldr3: '',
      q1: '', a1: '', q2: '', a2: '', q3: '', a3: '', q4: '', a4: '', q5: '', a5: ''
    })
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setFormData({
      title: post.title || '',
      summary: post.summary || '',
      date: post.date || new Date().toISOString().split('T')[0],
      category: post.category || '',
      content: post.content || '',
      tldr1: post.tldr?.[0] || '', tldr2: post.tldr?.[1] || '', tldr3: post.tldr?.[2] || '',
      q1: post.faq?.[0]?.q || '', a1: post.faq?.[0]?.a || '',
      q2: post.faq?.[1]?.q || '', a2: post.faq?.[1]?.a || '',
      q3: post.faq?.[2]?.q || '', a3: post.faq?.[2]?.a || '',
      q4: post.faq?.[3]?.q || '', a4: post.faq?.[3]?.a || '',
      q5: post.faq?.[4]?.q || '', a5: post.faq?.[4]?.a || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      const response = await fetch(`/api/admin/posts?slug=${slug}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        alert('Post deleted successfully!')
        fetchPosts()
      } else {
        const errorData = await response.json()
        alert(`Error deleting post: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    }
  }

  // Loading state
  if (status === 'loading' || (isLoading && posts.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // Not authenticated
  if (!session?.user?.isAdmin) {
    return null // Will be redirected by useEffect
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <div className="text-sm text-gray-600">
            Welcome, {session.user.name}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-gray-700">{session.user.email}</span>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingPost(null)
              resetForm()
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            disabled={isLoading}
          >
            Create New Post
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Posts List */}
      {!showForm && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.slug}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form - Same as before but with loading states */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingPost(null)
                resetForm()
              }}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary *
              </label>
              <textarea
                required
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* TLDR Points */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">TLDR Points</h3>
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TLDR Point {num}
                    </label>
                    <input
                      type="text"
                      value={formData[`tldr${num}` as keyof FormData] as string}
                      onChange={(e) => setFormData({...formData, [`tldr${num}`]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">FAQ</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question {num}
                      </label>
                      <input
                        type="text"
                        value={formData[`q${num}` as keyof FormData] as string}
                        onChange={(e) => setFormData({...formData, [`q${num}`]: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer {num}
                      </label>
                      <textarea
                        value={formData[`a${num}` as keyof FormData] as string}
                        onChange={(e) => setFormData({...formData, [`a${num}`]: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (MDX) *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Write your article content in MDX format here..."
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

