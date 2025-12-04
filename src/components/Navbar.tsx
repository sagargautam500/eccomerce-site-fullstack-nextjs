import { auth } from "@/auth";
import NavbarUI from "./NavbarUI";

export default async function Navbar() {
  const session = await auth();   // 🔥 Works perfectly in Next.js 16

  return <NavbarUI session={session} />;
}
