// lib/rate-limit.ts
import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// In production, consider using Redis or a database
const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

export class RateLimitResult {
  constructor(
    public allowed: boolean,
    public remaining: number,
    public resetTime: number,
    public totalRequests: number
  ) {}
}

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest, identifier?: string): RateLimitResult => {
    const now = Date.now()
    const key = identifier || getClientIdentifier(request)
    
    // Clean up expired entries
    if (rateLimitStore.size > 1000) { // Prevent memory leaks
      for (const [k, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
          rateLimitStore.delete(k)
        }
      }
    }
    
    const entry = rateLimitStore.get(key)
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs
      }
      rateLimitStore.set(key, newEntry)
      
      return new RateLimitResult(
        true,
        config.maxRequests - 1,
        newEntry.resetTime,
        1
      )
    }
    
    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return new RateLimitResult(
        false,
        0,
        entry.resetTime,
        entry.count
      )
    }
    
    // Increment counter
    entry.count++
    
    return new RateLimitResult(
      true,
      config.maxRequests - entry.count,
      entry.resetTime,
      entry.count
    )
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0]?.trim() || 
             realIp || 
             cfConnectingIp || 
             '127.0.0.1'
  
  return `ip:${ip}`
}

// Pre-configured rate limiters
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  maxRequests: 60 // 60 requests per minute
})