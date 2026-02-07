import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SiweMessage } from "siwe"
import { prisma } from "@/lib/server/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      walletAddress: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    walletAddress: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    walletAddress?: string
  }
}

// Log environment configuration on startup
console.log("[NextAuth Config] Initializing with:", {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? `SET (${process.env.NEXTAUTH_SECRET.slice(0, 10)}...)` : "NOT SET",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
  NODE_ENV: process.env.NODE_ENV,
})

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("[NextAuth Config] ERROR: NEXTAUTH_SECRET is not set!")
}
if (!process.env.NEXTAUTH_URL) {
  console.warn("[NextAuth Config] WARNING: NEXTAUTH_URL is not set (may cause issues in production)")
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Ethereum & Farcaster",
      credentials: {
        message: { label: "Message", type: "text", placeholder: "0x0" },
        signature: { label: "Signature", type: "text", placeholder: "0x0" },
        authType: { label: "Auth Type", type: "text" },
        fid: { label: "Farcaster ID", type: "text" },
      },
      async authorize(credentials) {
        console.log("[NextAuth] authorize() called with authType:", credentials?.authType)
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.error("[Auth] Missing credentials")
            return null
          }

          const authType = credentials.authType || "siwe"
          let walletAddress: string

          // Handle Farcaster authentication (SIWF)
          // SIWF messages follow the SIWE (EIP-4361) format, so we can verify them with siwe library
          if (authType === "farcaster") {
            console.log("[Farcaster Auth] Verifying SIWF message...")

            try {
              // SIWF uses the same message format as SIWE (EIP-4361)
              // We can verify it using the siwe library
              const siwe = new SiweMessage(credentials.message)
              const result = await siwe.verify({ signature: credentials.signature })

              if (!result.success) {
                console.error("[Farcaster Auth] Verification failed:", result.error)
                return null
              }

              walletAddress = siwe.address.toLowerCase()
              console.log("[Farcaster Auth] Verified via SIWF for address:", walletAddress, "FID:", credentials.fid)
            } catch (error) {
              console.error("[Farcaster Auth] Verification error:", error)
              return null
            }
          }
          // Handle SIWE authentication
          else {
            console.log("[SIWE Auth] Verifying SIWE message...")

            try {
              // Parse and verify the SIWE message
              const siwe = new SiweMessage(JSON.parse(credentials.message))
              const result = await siwe.verify({ signature: credentials.signature })

              if (!result.success) {
                console.error("[SIWE Auth] Verification failed:", result.error)
                return null
              }

              walletAddress = siwe.address.toLowerCase()
              console.log("[SIWE Auth] Verified address:", walletAddress)
            } catch (error) {
              console.error("[SIWE Auth] Verification error:", error)
              return null
            }
          }

          // Check if user exists or create new user
          let user = await prisma.user.findUnique({
            where: { walletAddress },
          })

          if (!user) {
            console.log("[Auth] Creating new user for address:", walletAddress)
            user = await prisma.user.create({
              data: {
                walletAddress,
                name: authType === "farcaster" && credentials.fid ? `FID:${credentials.fid}` : undefined,
              },
            })

            // Also create UserStat record for backwards compatibility
            await prisma.userStat.upsert({
              where: { walletAddress },
              update: { userId: user.id },
              create: {
                walletAddress,
                userId: user.id,
              },
            })
          } else {
            // Link existing UserStat if not already linked
            const existingStat = await prisma.userStat.findUnique({
              where: { walletAddress },
            })

            if (existingStat && !existingStat.userId) {
              await prisma.userStat.update({
                where: { walletAddress },
                data: { userId: user.id },
              })
            }
          }

          console.log(`[Auth] Authentication successful via ${authType} for:`, user.walletAddress)
          const userObject = {
            id: user.id,
            walletAddress: user.walletAddress,
            name: user.name,
            email: user.email,
            image: user.image,
          }
          console.log("[Auth] Returning user object:", userObject)
          return userObject
        } catch (error) {
          console.error("[Auth] Error during authorization:", error)
          if (error instanceof Error) {
            console.error("[Auth] Error name:", error.name)
            console.error("[Auth] Error message:", error.message)
            console.error("[Auth] Error stack:", error.stack)
          }
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        // Use 'none' in production to support Farcaster Mini App iframe context
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("[NextAuth] jwt callback - user:", user ? "present" : "null")
      if (user) {
        token.id = user.id
        token.walletAddress = user.walletAddress
        console.log("[NextAuth] jwt callback - set token for wallet:", user.walletAddress)
      }
      return token
    },
    async session({ session, token }) {
      console.log("[NextAuth] session callback - token:", token ? "present" : "null")
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.walletAddress = token.walletAddress as string
        console.log("[NextAuth] session callback - session user wallet:", session.user.walletAddress)
      }
      return session
    },
  },
  pages: {
    signIn: "/", // Redirect to home page for sign-in
    error: "/", // Redirect to home page on error
  },
  // Enable debug mode to get detailed error messages
  debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
