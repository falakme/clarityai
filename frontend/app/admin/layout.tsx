import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { CLERK_ENABLED } from "@/lib/auth";
import { AdminShell } from "./admin-shell";

/**
 * Server-side hard lock for the entire /admin area.
 *
 * Access is restricted to Clerk users whose privateMetadata is { "admin": true }.
 *  - Not signed in  -> bounced to the sign-in wall.
 *  - Signed in, not admin -> redirected to the home page.
 *
 * privateMetadata is server-only, so it's read via the Clerk Backend API here
 * (the matching middleware check is the first line of defense; this is the
 * authoritative gate). When Clerk isn't configured, the console stays open as
 * a local dev convenience.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (CLERK_ENABLED) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn({ returnBackUrl: "/admin" });

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.privateMetadata?.admin !== true) redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
