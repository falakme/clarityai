"use client";

/**
 * Browser geolocation + reverse geocoding.
 *
 * PRIVACY: coordinates are resolved to a coarse area (ZIP / city / region)
 * entirely in the browser and stored ONLY in localStorage. Nothing here is
 * transmitted to or stored by the ClearAid backend. We never ask the user to
 * type a ZIP code or city — the area is derived from the device location.
 */

export interface GeoArea {
  latitude: number;
  longitude: number;
  zipCode: string;
  city: string;
  region: string;
  /** Best-effort human label for display, e.g. "Houston, TX". */
  label: string;
}

export class GeoError extends Error {
  constructor(
    message: string,
    public code: "unsupported" | "denied" | "unavailable" | "timeout" | "geocode",
  ) {
    super(message);
    this.name = "GeoError";
  }
}

/** Promisified navigator.geolocation.getCurrentPosition. */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new GeoError("Location isn't supported on this device.", "unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (err) => {
      const code =
        err.code === err.PERMISSION_DENIED
          ? "denied"
          : err.code === err.TIMEOUT
            ? "timeout"
            : "unavailable";
      const message =
        code === "denied"
          ? "Location access was blocked. Allow it in your browser to continue."
          : code === "timeout"
            ? "We couldn't pin your location in time. Please try again."
            : "We couldn't read your location. Please try again.";
      reject(new GeoError(message, code));
    }, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}

/**
 * Reverse-geocode coordinates to a coarse area using BigDataCloud's free,
 * key-less, CORS-enabled client endpoint. Returns empty fields (rather than
 * throwing) so the flow can degrade gracefully if geocoding is unavailable.
 */
async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{ zipCode: string; city: string; region: string }> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new GeoError("Reverse geocoding failed.", "geocode");
    const data = await res.json();
    return {
      zipCode: String(data.postcode ?? "").trim(),
      city: String(data.city || data.locality || "").trim(),
      region: String(data.principalSubdivisionCode || data.principalSubdivision || "").trim(),
    };
  } catch {
    return { zipCode: "", city: "", region: "" };
  }
}

function buildLabel(city: string, region: string, zipCode: string): string {
  // principalSubdivisionCode comes back like "US-TX"; show just the state.
  const state = region.includes("-") ? region.split("-").pop() ?? region : region;
  const place = [city, state].filter(Boolean).join(", ");
  if (place) return place;
  if (zipCode) return `ZIP ${zipCode}`;
  return "your area";
}

/**
 * Full pipeline: request browser location, then reverse-geocode it to a
 * coarse area. Throws a GeoError if the user denies or location is
 * unavailable; geocoding failures degrade to coordinates-only.
 */
export async function locateUser(): Promise<GeoArea> {
  const position = await getCurrentPosition();
  const { latitude, longitude } = position.coords;
  const { zipCode, city, region } = await reverseGeocode(latitude, longitude);
  return {
    latitude,
    longitude,
    zipCode,
    city,
    region,
    label: buildLabel(city, region, zipCode),
  };
}
