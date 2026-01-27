import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
          return {
            id: user.id,
            walletAddress: user.walletAddress,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error("[Auth] Error during authorization:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.walletAddress = user.walletAddress
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.walletAddress = token.walletAddress as string
      }
      return session
    },
  },
  pages: {
    signIn: "/", // Redirect to home page for sign-in
    error: "/", // Redirect to home page on error
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
