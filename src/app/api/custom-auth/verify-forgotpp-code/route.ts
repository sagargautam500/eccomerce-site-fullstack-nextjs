//src/app/api/custom-auth/verify-forgotpp-code/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
// Zod schema
const schema = z.object({
  email: z.string().email(),
  code: z.string().length(4, "Code must be 4 digits"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, code } = parsed.data;

    // ✅ Find matching code
    const record = await prisma.user.findFirst({
      where: { email, resetToken: code },
      select: { resetExpires: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // ✅ Check expiration
    if (!record.resetExpires || record.resetExpires < new Date()) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: { resetToken: null, resetExpires: null },
    });

  return NextResponse.json({ success: true});
  } catch (error: any) {
    console.error("Verify Forgot Password Code Error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}