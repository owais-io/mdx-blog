'use client'
import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = '986041' // Change this!

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    summary: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    content: '',
    tldr1: '', tldr2: '', tldr3: '',
    q1: '', a1: '', q2: '', a2: '', q3: '', a3: '', q4: '', a4: '', q5: '', a5: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts()
    }
  }, [isAuthenticated])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('Invalid password')
    }
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
        alert('Error saving post')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post')
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
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`/api/admin/posts?slug=${slug}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          alert('Post deleted successfully!')
          fetchPosts()
        } else {
          alert('Error deleting post')
        }
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('Error deleting post')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingPost(null)
            resetForm()
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Create New Post
        </button>
      </div>

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
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      className="text-red-600 hover:text-red-900"
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

      {/* Form */}
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
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {editingPost ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}