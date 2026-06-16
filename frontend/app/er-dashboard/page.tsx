"use client";

import { useCallback, useEffect, useState } from "react";
import { Radio, Send } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeMode } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Alert } from "@/lib/types";

type Severity = "info" | "warning" | "success";

interface AlertForm {
  zip_code: string;
  title: string;
  message: string;
  severity: Severity;
  programs_open: number;
}

const BLANK: AlertForm = {
  zip_code: "",
  title: "",
  message: "",
  severity: "warning",
  programs_open: 0,
};

/**
 * ER responder console (RBAC Tier 2). Strictly protected by middleware:
 * unauthenticated visitors are redirected home. ER teams post localized,
 * non-PII disaster alerts that surface on residents' dashboards. Writes are
 * proxied server-side so the admin key never reaches the browser.
 */
export default function ErDashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [form, setForm] = useState<AlertForm>(BLANK);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/alerts", { cache: "no-store" });
      if (res.ok) setAlerts(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("Alert posted — live for residents in that area within seconds.");
        setForm(BLANK);
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus(`Failed: ${data.detail ?? res.status}`);
      }
    } catch {
      setStatus("Failed: backend unreachable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <ThemeMode theme="default" />
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brand href="/er-dashboard" />
          <Badge variant="warning">
            <Radio className="h-4 w-4" /> ER Team
          </Badge>
        </div>
      </header>

      <h1 className="mb-1 mt-6 text-3xl font-extrabold tracking-tight">
        Post a localized alert
      </h1>
      <p className="mb-6 text-base text-muted-foreground">
        Broadcast a non-PII disaster alert to residents in a specific ZIP code.
      </p>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-semibold">ZIP code</span>
            <Input
              value={form.zip_code}
              maxLength={5}
              placeholder="e.g. 77001"
              onChange={(e) =>
                setForm({ ...form, zip_code: e.target.value.replace(/\D/g, "") })
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">Programs open</span>
            <Input
              type="number"
              min={0}
              value={form.programs_open}
              onChange={(e) =>
                setForm({ ...form, programs_open: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block font-semibold">Title</span>
          <Input
            value={form.title}
            placeholder="e.g. Flood recovery assistance open"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block font-semibold">Message</span>
          <Textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </label>

        <div className="mt-4">
          <span className="mb-1 block font-semibold">Severity</span>
          <div className="flex gap-2">
            {(["info", "warning", "success"] as Severity[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={form.severity === s ? "primary" : "outline"}
                onClick={() => setForm({ ...form, severity: s })}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {status && <p className="mt-4 rounded-md bg-primary/5 p-3 text-base">{status}</p>}

        <Button
          size="lg"
          className="mt-5 w-full"
          onClick={submit}
          disabled={busy || !form.title.trim() || !form.message.trim() || !form.zip_code}
        >
          <Send className="h-5 w-5" />
          {busy ? "Posting…" : "Post alert"}
        </Button>
      </Card>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">Active alerts ({alerts.filter((a) => a.is_active).length})</h2>
        <ul className="space-y-3">
          {alerts
            .filter((a) => a.is_active)
            .map((a) => (
              <li key={a.id} className="clay-card flex items-start gap-3 p-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{a.title}</h3>
                    <Badge variant={a.severity}>{a.severity}</Badge>
                    <Badge variant="neutral">ZIP {a.zip_code}</Badge>
                  </div>
                  <p className="mt-1 text-base text-muted-foreground">{a.message}</p>
                </div>
              </li>
            ))}
          {alerts.filter((a) => a.is_active).length === 0 && (
            <p className="text-muted-foreground">No active alerts right now.</p>
          )}
        </ul>
      </section>

      <footer className="mt-10 text-center text-sm text-muted-foreground">
        ER responder console · all data here is non-PII
      </footer>
    </div>
  );
}
