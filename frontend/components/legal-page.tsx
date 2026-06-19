import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";

/**
 * Shared chrome for the static legal pages (Terms, Privacy). Plain, readable,
 * and consistent with the app shell — a quiet header, a centered prose column,
 * and a footer that cross-links the two documents.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-2xl px-5 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))] lg:py-10">
      <header className="flex items-center justify-between gap-3">
        <Brand href="/" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md bg-card px-3 py-2 text-sm font-semibold text-muted-foreground shadow-clay-sm hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>
      </header>

      <article className="mt-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="legal-prose mt-6 space-y-5 text-[15px] leading-relaxed text-foreground/90">
          {children}
        </div>
      </article>

      <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
        </nav>
        <p className="mt-4">ClarityAI — making complex information, simple.</p>
      </footer>
    </main>
  );
}

/** A titled section within a legal document. */
export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold tracking-tight text-foreground">{heading}</h2>
      {children}
    </section>
  );
}
