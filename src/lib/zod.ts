import { z } from "zod";

// Form validation schema
export const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;



// Sign in form validation schema
export const signinSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export type SigninFormData = z.infer<typeof signinSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;