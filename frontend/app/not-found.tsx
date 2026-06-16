import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center px-5 py-10">
      <Brand />
      <h1 className="mt-8 text-4xl font-extrabold tracking-tight">Page not found</h1>
      <p className="mt-3 text-xl text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-8" })}>
        Back to home
      </Link>
    </main>
  );
}
