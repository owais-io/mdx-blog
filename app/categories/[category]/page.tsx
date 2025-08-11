// app/categories/[category]/page.tsx

import { getAllCategories, getPostsByCategory } from '../../../lib/posts'
import Link from 'next/link'
import { format } from 'date-fns'

export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((category) => ({
    category: category,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  
  return {
    title: `${category} - Blog Categories`,
    description: `Articles in the ${category} category`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const posts = getPostsByCategory(category)

  if (posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">No posts found in &quot;{category}&quot;</h1>
        <Link 
          href="/categories" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to all categories
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href="/categories" 
          className="text-blue-600 hover:text-blue-800 underline mb-4 inline-block"
        >
          ← Back to all categories
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{category}</h1>
        <p className="text-gray-600">
          {posts.length} article{posts.length !== 1 ? 's' : ''} in this category
        </p>
      </div>

      <div className="grid gap-8">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                {post.category}
              </span>
              <span className="text-gray-500 ml-auto text-sm">
                {format(new Date(post.date), 'MMM dd, yyyy')}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              <Link 
                href={`/posts/${post.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            
            <p className="text-gray-600 mb-4 line-clamp-3">
              {post.summary}
            </p>
            
            <Link 
              href={`/posts/${post.slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}