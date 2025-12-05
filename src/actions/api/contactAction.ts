// src/actions/contactAction.ts
"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email"; // ✅ Import email function
import prisma from "@/lib/prisma";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContactForm(formData: FormData) {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get("name")?.toString().trim(),
    email: formData.get("email")?.toString().trim(),
    subject: formData.get("subject")?.toString().trim(),
    message: formData.get("message")?.toString().trim(),
  });

  if (!validatedFields.success) {
    return {
      success: false as const,
      message: "Please fix the form errors.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  try {
    // ✅ 1. Save to database
    await prisma.contact.create({
      data: { name, email, subject, message },
    });

    // ✅ 2. Send email (fire-and-forget — don't block response)
    await sendContactEmail({ name, email, subject, message });

    return {
      success: true as const,
      message: "Thank you! We'll get back to you soon.",
    };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      success: false as const,
      message: "Failed to send message. Please try again later.",
      errors: null,
    };
  }
}