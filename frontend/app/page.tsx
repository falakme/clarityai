"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Lock, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeMode } from "@/components/theme";
import { Stagger, Item } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { popIn } from "@/lib/motion";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-8">
      {/* Landing always uses the calm default (blue) scheme. */}
      <ThemeMode theme="default" />
      <Brand />

      <Stagger className="flex flex-1 flex-col justify-center py-12">
        <Item>
          <p className="mb-3 text-lg font-semibold text-primary">
            Paperwork, made plain
          </p>
        </Item>
        <Item>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Confusing letter? We&apos;ll explain it.
          </h1>
        </Item>
        <Item>
          <p className="mt-5 max-w-xl text-xl text-muted-foreground">
            ClearAid turns eviction notices, school letters, housing forms, medical bills,
            and disaster relief paperwork into clear, plain-language steps. Describe your
            situation, upload a PDF, or snap a photo — we read it and explain what to do.
          </p>
        </Item>

        <Item className="mt-10">
          <Button
            size="lg"
            className="h-20 w-full text-2xl sm:h-24 sm:text-3xl"
            onClick={() => router.push("/onboarding")}
          >
            Begin <ArrowRight className="h-7 w-7" />
          </Button>
        </Item>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <Feature icon={<Lock />} title="Private by design" body="Your details stay on your device — never on our servers." />
          <Feature icon={<FileText />} title="Plain language" body="We translate legalese into clear, doable steps." />
          <Feature icon={<ShieldCheck />} title="You stay in control" body="ClearAid never submits anything for you." />
        </div>
      </Stagger>

      <footer className="pt-8 text-center text-base text-muted-foreground">
        Built for the USAII Global AI Hackathon · Crisis-to-Action Translator
      </footer>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <motion.div
      className="clay-card p-5"
      variants={popIn}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary shadow-clay-sm">
        {icon}
      </span>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-1 text-base text-muted-foreground">{body}</p>
    </motion.div>
  );
}
