import './globals.css'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MDX Blog',
  description: 'A beautiful blog built with Next.js and MDX',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  MDX Blog
                </Link>
              </div>
              <div className="flex space-x-8">
                <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link href="/categories" className="text-gray-600 hover:text-gray-900">Categories</Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="min-h-screen">
          {children}
        </main>
        
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 MDX Blog. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}