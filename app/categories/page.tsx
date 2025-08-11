import { getAllCategories, getPostsByCategory } from '../../lib/posts'
import Link from 'next/link'

export default function CategoriesPage() {
  const categories = getAllCategories()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Categories</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const posts = getPostsByCategory(category)
          return (
            <div key={category} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                <Link href={`/categories/${encodeURIComponent(category)}`} className="hover:text-blue-600">
                  {category}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">
                {posts.length} article{posts.length !== 1 ? 's' : ''}
              </p>
              <Link 
                href={`/categories/${encodeURIComponent(category)}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                View articles →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}