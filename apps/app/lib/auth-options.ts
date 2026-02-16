import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SiweMessage } from "siwe"
import { revalidateTag } from "next/cache"
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
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Ethereum & Farcaster",
      credentials: {
        message: { label: "Message", type: "text", placeholder: "0x0" },
        signature: { label: "Signature", type: "text", placeholder: "0x0" },
        authType: { label: "Auth Type", type: "text" },
        fid: { label: "Farcaster ID", type: "text" },
        farcasterDisplayName: { label: "Farcaster Display Name", type: "text" },
        farcasterPfpUrl: { label: "Farcaster Profile Picture", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null
          }

          const authType = credentials.authType || "siwe"
          let walletAddress: string

          if (authType === "farcaster") {
            try {
              const siwe = new SiweMessage(credentials.message)
              const result = await siwe.verify({ signature: credentials.signature })
              if (!result.success) return null
              walletAddress = siwe.address.toLowerCase()
            } catch {
              return null
            }
          } else {
            try {
              const siwe = new SiweMessage(JSON.parse(credentials.message))
              const result = await siwe.verify({ signature: credentials.signature })
              if (!result.success) return null
              walletAddress = siwe.address.toLowerCase()
            } catch {
              return null
            }
          }

          const userData: { walletAddress: string; name?: string; image?: string } = { walletAddress }

          if (authType === "farcaster") {
            if (credentials.farcasterDisplayName && credentials.farcasterDisplayName !== "undefined") {
              userData.name = credentials.farcasterDisplayName
            } else if (credentials.fid && credentials.fid !== "undefined") {
              userData.name = `FID:${credentials.fid}`
            }
            if (credentials.farcasterPfpUrl && credentials.farcasterPfpUrl !== "undefined") {
              userData.image = credentials.farcasterPfpUrl
            }
          }

          const user = await prisma.user.upsert({
            where: { walletAddress },
            update: userData,
            create: userData,
          })

          await prisma.userStat.upsert({
            where: { walletAddress },
            update: { userId: user.id },
            create: { walletAddress, userId: user.id },
          })

          if (authType === "farcaster") {
            revalidateTag("leaderboard", "default")
          }

          return {
            id: user.id,
            walletAddress: user.walletAddress,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
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
    signIn: "/",
    error: "/",
  },
  debug: process.env.NODE_ENV === "development",
}
