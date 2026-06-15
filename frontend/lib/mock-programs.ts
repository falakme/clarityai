import type { ReliefProgram } from "./types";

/**
 * Mock relief programs for the dashboard "Relief To-Do List".
 * The sampleFormText fields are realistic-but-fictional government legalese
 * used to demo the translator. They contain NO real PII.
 */
export const RELIEF_PROGRAMS: ReliefProgram[] = [
  {
    id: "emergency-housing",
    title: "Emergency Housing Check",
    agency: "FEMA",
    description:
      "Temporary housing assistance for households displaced by a declared disaster.",
    officialUrl: "https://www.disasterassistance.gov/",
    sampleFormText: `FEDERAL EMERGENCY MANAGEMENT AGENCY — INDIVIDUALS AND HOUSEHOLDS PROGRAM (IHP)
TEMPORARY HOUSING ASSISTANCE — TERMS AND CONDITIONS

Pursuant to Section 408 of the Robert T. Stafford Disaster Relief and Emergency Assistance Act, as amended (42 U.S.C. 5174), applicants may be eligible for financial assistance to address disaster-caused housing needs.

DEADLINE: Applications for disaster DR-4729 must be received no later than 11:59 PM Central Time on August 30, 2025. Late applications will not be considered absent a documented showing of extraordinary circumstances.

REQUIRED SUPPORTING DOCUMENTATION: Applicant must provide (1) a government-issued photo identification; (2) proof of occupancy such as a utility bill or lease agreement dated within the disaster incident period; and (3) proof of identity for all household members listed.

By signing below at Part D, Line 17 (page 4), the applicant certifies under penalty of perjury that all information is true. Co-applicants must additionally sign at Part E (page 5).

NOTICE: Acceptance of IHP funds may affect eligibility for certain Small Business Administration disaster loans. Duplication of benefits is prohibited under Section 312 of the Stafford Act.`,
  },
];


RELIEF_PROGRAMS.push({
  id: "red-cross-food",
  title: "Red Cross Food Aid",
  agency: "American Red Cross",
  description:
    "Emergency food and essential supplies distribution for affected residents.",
  officialUrl: "https://www.redcross.org/get-help/disaster-relief-and-recovery-services.html",
  sampleFormText: `AMERICAN RED CROSS — DISASTER FOOD & ESSENTIAL SUPPLIES ASSISTANCE
PROGRAM ENROLLMENT AGREEMENT

The American Red Cross, a nonprofit humanitarian organization, provides emergency feeding and bulk distribution of essential relief items to individuals impacted by qualifying disaster events.

ENROLLMENT WINDOW: On-site enrollment closes September 12, 2025. Residents must enroll in person at a designated distribution center during this period to receive a household supply card.

WHAT TO BRING: Bring one form of photo identification and any document showing your current local address (a piece of mail, lease, or utility statement is acceptable). One enrollment per household.

SIGNATURE: Enrollee signs the acknowledgment box on the reverse side of the supply card upon first pickup.

PLEASE NOTE: Supplies are distributed while quantities last; enrollment does not guarantee a specific item. This assistance is provided free of charge — never pay anyone to enroll you.`,
});

RELIEF_PROGRAMS.push({
  id: "utility-relief",
  title: "Utility Bill Relief",
  agency: "State Disaster Recovery Office",
  description:
    "One-time credit toward electricity and water bills for disaster-affected accounts.",
  officialUrl: "https://www.usa.gov/disaster-financial-help",
  sampleFormText: `STATE DISASTER RECOVERY OFFICE — UTILITY ARREARAGE RELIEF GRANT
APPLICATION TERMS

This program offers a one-time credit applied directly to a qualifying residential utility account for service addresses located within the declared disaster area.

SUBMISSION DEADLINE: Completed applications must be postmarked or submitted electronically by October 1, 2025.

DOCUMENTS REQUIRED: (a) your most recent utility bill showing the account number and service address; (b) a valid photo ID; and (c) proof of residency at the service address.

SIGN HERE: Applicant signature is required in the certification block on Page 2, bottom right. Unsigned applications are returned without processing.

IMPORTANT: Funds are paid directly to the utility provider, not to the applicant. Accepting this credit does not waive your eligibility for federal housing assistance.`,
});

export function getProgram(id: string): ReliefProgram | undefined {
  return RELIEF_PROGRAMS.find((p) => p.id === id);
}
