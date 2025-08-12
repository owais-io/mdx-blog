// lib/auth-helpers.ts - Server-side auth helpers
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    redirect('/admin/login')
  }
  
  return session
}

export async function getAuthSession() {
  return await getServerSession(authOptions)
}
