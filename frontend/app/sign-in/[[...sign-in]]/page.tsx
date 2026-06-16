"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { Brand } from "@/components/brand";
import { ThemeMode } from "@/components/theme";
import { CLERK_ENABLED } from "@/lib/auth";

/**
 * Sign-in surface for everyday (non-emergency) use. After authenticating,
 * Clerk redirects to /dashboard (configured on ClerkProvider). Admins are
 * then bounced to /admin by the middleware. When Clerk isn't configured
 * (demo mode) there is nothing to sign into, so we fall through to /dashboard.
 */
export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    if (!CLERK_ENABLED) router.replace("/dashboard");
  }, [router]);

  if (!CLERK_ENABLED) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-5 py-10">
      <ThemeMode theme="default" />
      <Brand href="/" />
      <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
    </main>
  );
}
