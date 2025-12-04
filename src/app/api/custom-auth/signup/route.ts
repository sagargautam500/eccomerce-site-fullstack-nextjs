import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import prisma  from "@/lib/prisma";
import { signupSchema } from "@/lib/zod";




export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate input
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { fullName, email,password } = parsed.data;

    // ✅ Check existing user
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    return NextResponse.json(
      { message: "User registered successfully!", userId: newUser.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "Something went wrong during signup" },
      { status: 500 }
    );
  }
}
