import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { isAdminAddress } from "@/lib/admin"
import { execSync } from "child_process"
import path from "path"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.walletAddress || !isAdminAddress(session.user.walletAddress)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appDir = path.resolve(process.cwd())

    let output: string
    try {
      output = execSync("npx prisma migrate deploy", {
        cwd: appDir,
        env: { ...process.env },
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      })
    } catch (err: unknown) {
      const execError = err as { stdout?: string; stderr?: string; message?: string }
      const stderr = execError.stderr || ""
      const stdout = execError.stdout || ""
      const message = execError.message || "Unknown error"
      console.error("prisma migrate deploy failed:", stderr || message)
      return NextResponse.json(
        {
          error: "Migration failed",
          details: stderr || message,
          output: stdout,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, output })
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/migrate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
