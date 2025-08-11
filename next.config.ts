import type { NextConfig } from "next";
import createMDX from '@next/mdx'

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  // Optimize for Vercel
  output: 'standalone',
  images: {
    unoptimized: false,
  },
};

export default withMDX(nextConfig);