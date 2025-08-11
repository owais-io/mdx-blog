import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface Post {
  slug: string
  title: string
  summary: string
  date: string
  category: string
  tldr?: string[]
  faq?: Array<{ q: string; a: string }>
  content: string
}

const postsDirectory = path.join(process.cwd(), 'content/posts')

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
    return []
  }
  
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter(name => name.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = matter(fileContents)

      return {
        slug,
        ...matterResult.data,
        content: matterResult.content,
      } as Post
    })

  return allPostsData.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)

  return {
    slug,
    ...matterResult.data,
    content: matterResult.content,
  } as Post
}

export function getPostsByCategory(category: string): Post[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.category === category)
}

export function getAllCategories(): string[] {
  const allPosts = getAllPosts()
  const categories = [...new Set(allPosts.map(post => post.category))]
  return categories.filter(Boolean)
}

export function savePost(slug: string, frontmatter: any, content: string): void {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
  
  const fileContent = matter.stringify(content, frontmatter)
  fs.writeFileSync(fullPath, fileContent)
}

export function deletePost(slug: string): void {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}