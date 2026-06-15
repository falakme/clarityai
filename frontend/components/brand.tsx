import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white shadow-glass">
        <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <span className="text-2xl font-extrabold tracking-tight text-foreground">
        Clear<span className="text-primary">Aid</span>
      </span>
    </Link>
  );
}
