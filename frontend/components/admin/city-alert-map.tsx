"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Loader2, MapPin, TriangleAlert } from "lucide-react";
import { reverseGeocodeArea, type GeoArea } from "@/lib/geo";
import type { LatLng } from "./city-map";

// Leaflet needs `window`, so load the map only on the client.
const CityMap = dynamic(() => import("./city-map"), {
  ssr: false,
  loading: () => <div className="skeleton h-[360px] w-full rounded-md" />,
});

/**
 * Map-based city picker for triggering alerts. Click anywhere on the map; the
 * point is reverse-geocoded to a city/region/country (the SAME resolver used
 * for user onboarding, so the targeted city matches residents' detected city)
 * and handed back via `onArea`.
 */
export function CityAlertMap({
  area,
  onArea,
}: {
  area: Pick<GeoArea, "city" | "region" | "country" | "label"> | null;
  onArea: (a: GeoArea) => void;
}) {
  const [marker, setMarker] = useState<LatLng | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(p: LatLng) {
    setMarker(p);
    setBusy(true);
    setErr("");
    try {
      const resolved = await reverseGeocodeArea(p.lat, p.lng);
      if (!resolved.city) {
        setErr("No city found there. Try clicking on a town or city.");
        return;
      }
      onArea(resolved);
    } catch {
      setErr("Couldn't resolve that location. Try clicking a populated area.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <CityMap marker={marker} onPick={pick} />

      <div className="mt-3 flex items-center gap-2 rounded-md bg-white/60 p-3 text-base">
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Resolving city…</span>
          </>
        ) : area?.city ? (
          <>
            <MapPin className="h-5 w-5 text-primary" />
            <span>
              Targeting <strong>{area.label}</strong>
            </span>
          </>
        ) : (
          <>
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Click the map to select the city to alert.
            </span>
          </>
        )}
      </div>

      {err && (
        <p className="mt-2 flex items-center gap-2 rounded-md bg-warning/15 p-3 text-base text-amber-800">
          <TriangleAlert className="h-5 w-5" /> {err}
        </p>
      )}
    </div>
  );
}
