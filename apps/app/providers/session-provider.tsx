"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

/**
 * Client-side wrapper for Next-Auth SessionProvider
 * Required because SessionProvider uses React Context which is not available in Server Components
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
