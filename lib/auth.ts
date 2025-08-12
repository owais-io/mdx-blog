// lib/auth.ts - NextAuth configuration
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

// Define allowed admin emails
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow specific emails to sign in
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        return true
      }
      return false // Deny access
    },
    async session({ session, token }) {
      // Add admin flag to session
      if (session.user?.email && ADMIN_EMAILS.includes(session.user.email)) {
        session.user.isAdmin = true
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.email && ADMIN_EMAILS.includes(user.email)
      }
      return token
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)