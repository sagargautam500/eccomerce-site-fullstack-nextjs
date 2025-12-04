// src/app/actions/authAction.ts
"use server";
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"


export async function handleCredentialsSignIn(email: string, password: string) {
  try {
    await signIn("credentials", {
      email: email,
      password: password,
      redirectTo: "/",
    })

    // On success, a redirect is thrown; function won't reach here
    return { success: true }

  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error // Success redirect
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          throw new Error("Invalid email or password")
        default:
          throw new Error("Authentication failed")
      }
    }

    throw new Error(error instanceof Error ? error.message : "Sign in failed")
  }
}

export async function handleSignOut() {
  await signOut({
    redirectTo: "/auth/signin",
  })
}

export async function handleGoogleSignIn() {
  await signIn("google")
}
export async function handleGitHubSignIn() {
  await signIn("github")
}

export async function handleFacebookSignIn() {
  await signIn("facebook")
}