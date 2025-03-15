import { type NextRequest, NextResponse } from "next/server"
import { getTokens } from "@/lib/google-calendar"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/dashboard?error=no_code", request.url))
    }

    const tokens = await getTokens(code)

    // Store tokens in cookies (encrypted in a real app)
    const cookieStore = cookies()
    cookieStore.set("google_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return NextResponse.redirect(new URL("/dashboard?success=google_connected", request.url))
  } catch (error) {
    console.error("Error exchanging code for tokens:", error)
    return NextResponse.redirect(new URL("/dashboard?error=auth_failed", request.url))
  }
}

