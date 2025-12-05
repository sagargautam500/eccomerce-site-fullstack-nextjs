// src/app/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile, getUserStats } from "@/actions/api/userApi";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  // Redirect if not authenticated
  if (!session || !session.user?.email) {
    redirect("/auth/signin");
  }

  // Fetch user data and stats
  const [userProfile, userStats] = await Promise.all([
    getUserProfile(session.user.email),
    getUserStats(session.user.email),
  ]);

  if (!userProfile) {
    redirect("/auth/signin");
  }

  return (
    <ProfileClient
      user={userProfile}
      stats={userStats}
      session={session}
    />
  );
}