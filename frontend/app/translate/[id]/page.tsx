"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { TranslatorView } from "@/components/translator/translator-view";
import { getProgram } from "@/lib/mock-programs";

export default function TranslatePage({ params }: { params: { id: string } }) {
  const program = getProgram(params.id);
  if (!program) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <header className="flex items-center justify-between">
        <Brand href="/dashboard" />
        <Link
          href="/dashboard"
          className="flex min-h-tap items-center gap-1 rounded-md px-2 text-base font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </Link>
      </header>

      <div className="mb-6 mt-6">
        <Badge variant="info">{program.agency}</Badge>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{program.title}</h1>
        <p className="mt-1 text-lg text-muted-foreground">{program.description}</p>
      </div>

      <TranslatorView program={program} />
    </main>
  );
}
