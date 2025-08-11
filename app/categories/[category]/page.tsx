import { getPostsByCategory, getAllCategories } from '../../../lib/posts'
import { format } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }))
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = decodeURIComponent(params.category)
  const posts = getPostsByCategory(category)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Category: {category}
      </h1>
      
      <div className="grid gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {post.category}
              </span>
              <span className="text-gray-500 text-sm ml-auto">
                {format(new Date(post.date), 'MMM dd, yyyy')}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.summary}</p>
            {post.tldr && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="font-semibold text-sm text-gray-700 mb-1">TLDR:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {post.tldr.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            <Link 
              href={`/posts/${post.slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Read full article →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}