/**
 * Location-aware emergency number lookup.
 *
 * The `detected_location` field (e.g. "London, England, GB") is produced by
 * either the IP geolocation service (always "City, Region, CC" format) or the
 * AI model (varies — may include the full country name instead of a code).
 * We try the ISO-3166-1 alpha-2 code first, then fall back to name matching.
 */

interface EmergencyInfo {
  /** Primary emergency / police number. */
  primary: string;
  /** Ambulance number if different from primary. */
  ambulance?: string;
}

const BY_CODE: Record<string, EmergencyInfo> = {
  // North America
  US: { primary: "911" },
  CA: { primary: "911" },
  MX: { primary: "911" },
  // UK & Ireland
  GB: { primary: "999", ambulance: "999" },
  IE: { primary: "999", ambulance: "999" },
  // Australia / NZ / Pacific
  AU: { primary: "000" },
  NZ: { primary: "111" },
  // EU / Europe (most use 112)
  DE: { primary: "112" },
  FR: { primary: "112" },
  ES: { primary: "112" },
  IT: { primary: "112" },
  NL: { primary: "112" },
  BE: { primary: "112" },
  PT: { primary: "112" },
  PL: { primary: "112" },
  SE: { primary: "112" },
  NO: { primary: "112" },
  DK: { primary: "112" },
  FI: { primary: "112" },
  CZ: { primary: "112" },
  SK: { primary: "112" },
  HU: { primary: "112" },
  RO: { primary: "112" },
  GR: { primary: "112" },
  AT: { primary: "133", ambulance: "144" },
  CH: { primary: "117", ambulance: "144" },
  // South Asia
  IN: { primary: "112", ambulance: "108" },
  PK: { primary: "15", ambulance: "115" },
  BD: { primary: "999" },
  LK: { primary: "119" },
  // East / Southeast Asia
  CN: { primary: "110", ambulance: "120" },
  JP: { primary: "110", ambulance: "119" },
  KR: { primary: "112", ambulance: "119" },
  SG: { primary: "999", ambulance: "995" },
  HK: { primary: "999" },
  PH: { primary: "117" },
  VN: { primary: "113", ambulance: "115" },
  TH: { primary: "191", ambulance: "1669" },
  MY: { primary: "999" },
  ID: { primary: "110", ambulance: "118" },
  // Middle East
  AE: { primary: "999" },
  SA: { primary: "999" },
  TR: { primary: "155", ambulance: "112" },
  IL: { primary: "100", ambulance: "101" },
  // Africa
  ZA: { primary: "10111", ambulance: "10177" },
  NG: { primary: "199" },
  KE: { primary: "999" },
  EG: { primary: "122", ambulance: "123" },
  // Latin America
  BR: { primary: "190", ambulance: "192" },
  AR: { primary: "911" },
  CO: { primary: "123" },
  CL: { primary: "133", ambulance: "131" },
  PE: { primary: "105", ambulance: "117" },
};

/** Common name aliases → ISO code (for AI-generated location strings). */
const NAME_ALIASES: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  "canada": "CA",
  "united kingdom": "GB",
  "uk": "GB",
  "england": "GB",
  "scotland": "GB",
  "wales": "GB",
  "northern ireland": "GB",
  "australia": "AU",
  "new zealand": "NZ",
  "india": "IN",
  "pakistan": "PK",
  "germany": "DE",
  "france": "FR",
  "spain": "ES",
  "italy": "IT",
  "netherlands": "NL",
  "brazil": "BR",
  "mexico": "MX",
  "south africa": "ZA",
  "nigeria": "NG",
  "kenya": "KE",
  "egypt": "EG",
  "china": "CN",
  "japan": "JP",
  "south korea": "KR",
  "korea": "KR",
  "singapore": "SG",
  "hong kong": "HK",
  "philippines": "PH",
  "vietnam": "VN",
  "thailand": "TH",
  "malaysia": "MY",
  "indonesia": "ID",
  "uae": "AE",
  "united arab emirates": "AE",
  "saudi arabia": "SA",
  "turkey": "TR",
  "israel": "IL",
  "argentina": "AR",
  "colombia": "CO",
  "chile": "CL",
  "peru": "PE",
};

function extractCountryCode(detectedLocation: string): string | null {
  if (!detectedLocation.trim()) return null;

  // Try the last comma-separated segment as a 2-letter ISO code (geolocation format).
  const parts = detectedLocation.split(",").map((p) => p.trim());
  const last = parts[parts.length - 1].toUpperCase();
  if (/^[A-Z]{2}$/.test(last) && BY_CODE[last]) return last;

  // Try full-string name matching (AI-generated format like "London, England").
  const lower = detectedLocation.toLowerCase();
  for (const [name, code] of Object.entries(NAME_ALIASES)) {
    if (lower.includes(name)) return code;
  }

  return null;
}

/** Return the primary emergency number for a detected location (default "911"). */
export function getEmergencyNumber(detectedLocation: string): string {
  const code = extractCountryCode(detectedLocation);
  return code ? (BY_CODE[code]?.primary ?? "911") : "911";
}

/**
 * Replace "911" references in AI-generated text with the location-appropriate
 * emergency number so users see "call 999" in the UK, "call 112" in Germany, etc.
 */
export function localizeEmergencyNumbers(text: string, detectedLocation: string): string {
  const num = getEmergencyNumber(detectedLocation);
  if (num === "911") return text; // nothing to change for US/CA/MX
  return text
    .replace(/\b911\b/g, num)
    .replace(/call 911 or equivalent/gi, `call ${num}`)
    .replace(/dial 911/gi, `dial ${num}`);
}
