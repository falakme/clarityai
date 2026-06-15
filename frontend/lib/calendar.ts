/** Build a downloadable .ics calendar reminder for a relief deadline. */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toICSDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
  );
}

/** Try to parse a free-text deadline string into a Date. Returns null if not parseable. */
export function parseDeadline(deadline: string | null): Date | null {
  if (!deadline) return null;
  const parsed = new Date(deadline);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  // Try to pull a "Month Day, Year" out of a longer sentence.
  const match = deadline.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i,
  );
  if (match) {
    const d = new Date(match[0]);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export function downloadDeadlineICS(title: string, deadline: string | null): void {
  const date = parseDeadline(deadline) ?? new Date(Date.now() + 7 * 86400000);
  const start = toICSDate(date);
  const end = toICSDate(new Date(date.getTime() + 30 * 60000));
  const uid = `${Date.now()}@clearaid`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClearAid//Relief Deadline//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Deadline — ${title}`,
    `DESCRIPTION:Relief application deadline tracked by ClearAid. Original: ${(deadline ?? "see program").replace(/\n/g, " ")}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:ClearAid reminder: relief deadline tomorrow",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clearaid-deadline.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
