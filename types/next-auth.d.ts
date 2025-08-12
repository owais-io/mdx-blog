// types/next-auth.d.ts - Extend NextAuth types
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      email: string
      name: string
      image: string
      isAdmin: boolean
    }
  }
  
  interface User {
    isAdmin?: boolean
  }
}
