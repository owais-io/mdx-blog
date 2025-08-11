import { getPostBySlug, getAllPosts } from '../../../lib/posts'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.summary,
  }
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article>
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
              {post.category}
            </span>
            <span className="text-gray-500 ml-auto">
              {format(new Date(post.date), 'MMMM dd, yyyy')}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-xl text-gray-600">{post.summary}</p>
        </header>

        {/* TLDR Section */}
        {post.tldr && post.tldr.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">TL;DR</h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              {post.tldr.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="prose-custom mb-12">
          <MDXRemote source={post.content} />
        </div>

        {/* FAQ Section */}
        {post.faq && post.faq.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {post.faq.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-700">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}