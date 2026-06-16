"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Radio, Send } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeMode } from "@/components/theme";
import { CityAlertMap } from "@/components/admin/city-alert-map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { GeoArea } from "@/lib/geo";
import type { Alert } from "@/lib/types";

type Severity = "info" | "warning" | "success";

interface AlertForm {
  city: string;
  region: string;
  country: string;
  label: string;
  title: string;
  message: string;
  severity: Severity;
  programs_open: number;
}

const BLANK: AlertForm = {
  city: "",
  region: "",
  country: "",
  label: "",
  title: "",
  message: "",
  severity: "warning",
  programs_open: 0,
};

/**
 * ER responder console (RBAC Tier 2). Strictly protected by middleware:
 * unauthenticated visitors hit the sign-in wall. ER teams pick a city on the
 * map and broadcast a localized, non-PII disaster alert that surfaces on
 * residents' dashboards in that city.
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

  function applyArea(a: GeoArea) {
    setForm((f) => ({
      ...f,
      city: a.city,
      region: a.region,
      country: a.country,
      label: a.label,
    }));
  }

  async function submit() {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city,
          region: form.region,
          country: form.country,
          title: form.title,
          message: form.message,
          severity: form.severity,
          programs_open: form.programs_open,
        }),
      });
      if (res.ok) {
        setStatus(`Alert posted — live for residents in ${form.label} within seconds.`);
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

  const canSubmit = !busy && !!form.city && !!form.title.trim() && !!form.message.trim();

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
        Trigger a localized alert
      </h1>
      <p className="mb-6 text-base text-muted-foreground">
        Select a city on the map, then broadcast a non-PII disaster alert to residents there.
      </p>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
          <MapPin className="h-5 w-5 text-primary" /> 1 · Pick the city
        </h2>
        <CityAlertMap area={form.city ? form : null} onArea={applyArea} />

        <h2 className="mb-3 mt-6 text-xl font-bold">2 · Compose the alert</h2>

        <label className="block">
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
          <div>
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
        </div>

        {status && <p className="mt-4 rounded-md bg-primary/5 p-3 text-base">{status}</p>}

        <Button size="lg" className="mt-5 w-full" onClick={submit} disabled={!canSubmit}>
          <Send className="h-5 w-5" />
          {busy ? "Posting…" : form.city ? `Post alert for ${form.label}` : "Pick a city first"}
        </Button>
      </Card>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          Active alerts ({alerts.filter((a) => a.is_active).length})
        </h2>
        <ul className="space-y-3">
          {alerts
            .filter((a) => a.is_active)
            .map((a) => (
              <li key={a.id} className="clay-card flex items-start gap-3 p-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{a.title}</h3>
                    <Badge variant={a.severity}>{a.severity}</Badge>
                    <Badge variant="neutral">
                      {[a.city, a.region, a.country].filter(Boolean).join(", ") ||
                        `ZIP ${a.zip_code}`}
                    </Badge>
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
