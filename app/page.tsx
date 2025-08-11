import { getAllPosts, getAllCategories } from '../lib/posts'
import { format } from 'date-fns'
import Link from 'next/link'

export default function HomePage() {
  const posts = getAllPosts()
  const categories = getAllCategories()
  const featuredPosts = posts.slice(0, 3)
  const recentPosts = posts.slice(3, 9)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Our Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing articles, insights, and stories from our community of writers.
        </p>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <article key={post.slug} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm ml-auto">
                      {format(new Date(post.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">{post.summary}</p>
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Articles</h2>
          <div className="space-y-6">
            {recentPosts.map((post) => (
              <article key={post.slug} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">
                    {format(new Date(post.date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
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

        {/* Sidebar */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/categories/${encodeURIComponent(category)}`}
                  className="block text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}