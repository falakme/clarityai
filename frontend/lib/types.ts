/** Shared domain types for ClearAid. */

export interface UserProfile {
  zipCode: string;
  city: string;
  familySize: number;
  notificationsEnabled: boolean;
  onboardedAt: string;
}

export interface Alert {
  id: number;
  zip_code: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "success";
  programs_open: number;
  is_active: boolean;
  created_at: string;
}

/** A mock relief program shown on the dashboard to-do list. */
export interface ReliefProgram {
  id: string;
  title: string;
  agency: string;
  description: string;
  /** Pre-filled sample form text used to demo the translator. */
  sampleFormText: string;
  officialUrl: string;
}

/** Structured output returned by POST /api/translate-form. */
export interface TranslateResult {
  bottom_line_summary: string;
  deadline: string | null;
  required_attachments: string[];
  signature_locations: string[];
  critical_warnings: string[];
  source_text_reference: string;
}
