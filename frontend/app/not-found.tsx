"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { useStoredTranslator } from "@/lib/use-language";

export default function NotFound() {
  const { t, rtl } = useStoredTranslator();
  return (
    <main
      dir={rtl ? "rtl" : "ltr"}
      className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center px-5 py-10"
    >
      <Brand />
      <h1 className="mt-8 text-4xl font-extrabold tracking-tight">{t("not_found_title")}</h1>
      <p className="mt-3 text-xl text-muted-foreground">{t("not_found_body")}</p>
      <Link href="/" className={buttonVariants({ className: "mt-8" })}>
        {t("back_home")}
      </Link>
    </main>
  );
}
