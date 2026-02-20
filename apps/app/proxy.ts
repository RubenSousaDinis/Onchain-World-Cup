import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_BASIC_AUTH_USER
  const password = process.env.ADMIN_BASIC_AUTH_PASSWORD

  if (!user || !password) {
    return new NextResponse("Admin auth not configured", { status: 503 })
  }

  const authHeader = request.headers.get("authorization")

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ")
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded)
      const [u, p] = decoded.split(":")
      if (u === user && p === password) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  })
}

export const config = {
  matcher: "/admin/:path*",
}
