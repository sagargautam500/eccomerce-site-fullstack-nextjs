//src/app/api/custom-auth/forgot-password/route.ts
import { NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 })
    }

    // ✅ Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

   

    // ✅ Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // ✅ Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
