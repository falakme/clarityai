# ClarityAI — Devpost Submission Draft
> Fill in your Qualifier Approval Code, Track, and Challenge Number where marked.

---

## Qualifier Approval Code
`[YOUR 8-CHARACTER CODE HERE — e.g. XX26-Q7H9K2M1]`

---

## Project Description

Every day, people receive documents that can change their lives — eviction notices,
hospital discharge papers, benefit denial letters, utility shutoff warnings — written
in dense legal and bureaucratic language that most people cannot quickly parse.
Panic sets in, deadlines are missed, and people lose housing, benefits, or access to
care, not because they couldn't act, but because they couldn't *understand* what
they were supposed to do or by when.

**ClarityAI** is a mobile-first progressive web app that closes that gap. You paste or
upload any legal, medical, or administrative document — or photograph it with your
phone — and within seconds receive:

- An **urgency classification** (Urgent Action Required / Time Sensitive / Informational Only)
- A **plain-language summary** of what the document actually means
- A **step-by-step action plan** with tasks, deadlines, and explanations
- A **verified local support resource** — a real government agency or nonprofit — matched to your specific situation and location
- A **follow-up chat interface** anchored to your document so you can ask questions and get grounded answers

Everything is available in **15 languages** (English, Spanish, French, Arabic,
Chinese, Hindi, German, Portuguese, Vietnamese, Tagalog, Korean, Urdu, Bengali,
Russian, and Haitian Creole) with native-script labels, RTL support for Arabic and
Urdu, and multilingual read-aloud via Azure Neural TTS.

The app is anonymous, frictionless, and stateless — no login, no tracking, no
database. Documents are processed in memory and never stored. It is deployed as a
Progressive Web App installable from any browser, with offline support, so it works
on a low-end phone with an intermittent connection.

The people ClarityAI is built for are tenants facing eviction, patients trying to
understand medical bills, families navigating benefits applications, and immigrants
processing notices in a language that is not their first. The stakes are real and the
window for action is often short.

---

## Track & Challenge Selection

`[YOUR TRACK: High School / Undergraduate / Graduate]`
`[YOUR CHALLENGE NUMBER]`

---

## AI Architecture Explanation

### (1) Inputs — what data goes in

Users provide one or more of:
- **Text** typed or pasted directly into the input field
- **PDF documents** uploaded from their device
- **Images** (PNG / JPG / WEBP) — including mobile camera captures — of physical documents
- **Voice** transcribed client-side via the browser Web Speech API (no audio upload)

An optional language selector (15 languages) and an implicit IP-based geolocation
(used only for resource matching, never stored) complete the input surface.

### (2) AI Capabilities Used

ClarityAI uses **three distinct AI capabilities** in a coordinated pipeline:

| Capability | Where Used |
|---|---|
| **Multi-capability text extraction & classification** | `meta/llama-3.3-70b-instruct` via NVIDIA Build API — classifies urgency, summarizes, extracts action items, table data, and process steps from any document in one inference call |
| **Agentic recommendation** (Retrieval-Augmented Evaluation) | Brave Search retrieves live local resources; `llama-3.3-70b` evaluates them and selects the single most trustworthy one for the user's situation |
| **Conversational chat** | `llama-3.3-70b` answers follow-up questions strictly grounded in the user's analyzed document |

### (3) What Processing Happens

```
User Input
    │
    ▼
[Frontend] Multimodal intake
    │  POST multipart/form-data
    ▼
[Backend] Format routing
    ├── PDF → pypdf text extraction (threadpool)
    ├── Image → pytesseract OCR (threadpool)
    └── Text → passthrough
    │
    ▼
[Backend] PII redaction
    SSNs, email addresses, phone numbers → [REDACTED]
    │
    ▼
[NVIDIA llama-3.3-70b-instruct]  ← Inference Step 1
    System prompt enforces strict JSON schema output.
    Temperature 0.2 for consistency.
    Language instruction injected for non-English output.
    Returns: urgency_tier, document_category, plain_language_brief,
             plain_language_explanation_markdown, task_list,
             table_data, diagram_steps, ai_confidence_score,
             detected_location
    │
    ▼                                                (async, non-blocking)
[Backend] Agentic Recommendation ─────────────────────────────────────┐
    IP geolocation → city/region                                       │
    Brave Search → 8 live local support results                        │
    [NVIDIA llama-3.3-70b] evaluates results, selects single best      │
    Returns: recommended_resource_name, url, ai_reasoning             │
    ──────────────────────────────────────────────────────────────────┘
    │
    ▼
[Frontend] Dashboard hydration
    Result displayed across routed tabs:
    /dash (Summary), /dash/tasks, /dash/ask, /dash/resources,
    /dash/history, /dash/settings
    │
    ├── Optional: Azure Neural TTS → read-aloud in the document language
    └── Optional: Follow-up chat → llama-3.3-70b grounded in document context
```

A defensive JSON parser strips markdown fences, balances braces, and repairs
trailing commas. If the model returns malformed output, one corrective retry is
attempted before failing gracefully with a clean error message.

The recommendation step runs asynchronously after the first response is shown,
so users see their summary and task list immediately (typically 2–4 seconds)
while the resource recommendation loads in.

### (4) Outputs — what the user receives

| Output | Description |
|---|---|
| **Urgency classification** | Color-coded banner: Urgent / Time Sensitive / Informational Only |
| **Plain-language summary** | 1–2 sentence brief of what the document means |
| **Full explanation** | Markdown explanation with key dates, amounts, and what to expect |
| **Action plan** | Numbered task list with descriptions, interactive checkboxes, and a process diagram |
| **Data table** | Extracted when the document contains itemized charges, eligibility brackets, etc. |
| **Verified local support** | One AI-evaluated, real government agency or nonprofit matched to the user's situation and location, with the model's one-line reasoning for the choice |
| **Chat** | Follow-up Q&A grounded in the analyzed document |
| **Audio read-aloud** | Azure Neural TTS (6 languages) with Web Speech fallback |
| **Printable takeaway** | Clean print view of the full action plan |
| **Source transparency** | The exact extracted text the explanation was derived from, for verification |

---

## Human-in-the-Loop Design

**The AI never opens, contacts, or submits anything on the user's behalf.**

Every external action — opening the verified local support resource, sharing the
action plan — is gated behind a mandatory **Responsible AI acknowledgement
checkbox**. The button stays disabled until the user explicitly confirms:

> *"I understand that ClarityAI organizes information only. It is not a substitute for
> legal, medical, or financial advice, and I will verify important decisions with a
> qualified professional."*

The AI also surfaces its own **confidence score** (`High / Medium / Low`) and the
underlying `confidence_percent` alongside every result. When confidence is low, the
user can see exactly why — the model's explanation is shown — and is implicitly
prompted to seek verification before acting.

This gate exists because the stakes are high. An eviction or a medical decision made
on the basis of a misread document can have irreversible consequences. The AI may
have misread a blurry scan, misclassified a document category, or missed a local
procedural nuance. The human must decide whether the summary is accurate enough to
act on, and must consciously accept that responsibility before the app takes them to
a resource or helps them share the plan.

---

## Responsible AI Guardrail

**Risk: Over-reliance on AI-generated summaries for high-stakes legal or medical decisions.**

A person facing eviction or a complex medical bill might follow the AI's task list
as if it were verified legal advice — and miss a critical step, deadline, or local
exception that the model got wrong.

**How we reduced this risk:**

1. **Mandatory acknowledgement gate** — All external action buttons are disabled
   until the user checks a box confirming they understand the output is
   organizational guidance, not professional advice. The gate cannot be bypassed.

2. **Visible AI confidence score** — Every result displays the model's own
   `ai_confidence_score` (High / Medium / Low) and a numeric `confidence_percent`.
   Low-confidence results are visually distinguished so users know when to be more
   cautious.

3. **Source Transparency** — The exact text the AI read is shown in a collapsible
   panel on the Tasks tab. Users can verify every claim against the original.

4. **Grounded chat** — Follow-up questions are answered strictly from the document
   context, not from the model's general knowledge. When the document doesn't
   contain an answer, the model says so explicitly and suggests who to ask
   (a lawyer, caseworker, the issuing office).

5. **Consistent disclaimer** — "ClarityAI explains and organizes. It is not a
   substitute for a lawyer, doctor, or caseworker." appears in the chat composer
   and on the Settings tab on every session.

6. **No autonomous action** — ClarityAI never submits forms, makes calls, sends
   emails, or takes any external action. It is a read-only organizer.

---

## Tools Used

| Tool / Service | Purpose | Free or Paid |
|---|---|---|
| **NVIDIA Build API** — `meta/llama-3.3-70b-instruct` | Document extraction, resource evaluation, follow-up chat | **Free** (NVIDIA NIM free tier) |
| **Brave Search API** | Live retrieval of local support resources | **Free** (free tier) |
| **Microsoft Azure Cognitive Services TTS** | Neural read-aloud in 6 languages | **Free** (F0 tier, 500k chars/month) |
| **Next.js 14** | Frontend framework (App Router, PWA, SSG) | **Free** (open source) |
| **FastAPI + Python** | Backend API, async routing, inference orchestration | **Free** (open source) |
| **pytesseract + Tesseract OCR** | Image and camera-capture OCR | **Free** (open source) |
| **pypdf** | PDF text extraction | **Free** (open source) |
| **Framer Motion** | Fluid micro-interactions and animations | **Free** (open source) |
| **Tailwind CSS + shadcn/ui** | UI design system | **Free** (open source) |
| **Coolify** | Self-hosted deployment platform | **Free** (self-hosted open source) |
| **Kiro (Amazon)** | AI coding assistant used during development | **Free** (used for coding assistance) |

> No paid services were required to run ClarityAI in production. All AI capabilities
> use free tiers of NVIDIA NIM, Brave, and Azure.

---

## Data Disclosure

ClarityAI **does not use any training dataset** and does not store or persist any
user data.

**How data is handled:**

- **User-uploaded documents** — processed entirely in memory for the lifetime of a
  single API request. Never written to disk, never logged, never persisted. The
  extracted text is sent to the NVIDIA API only after PII (SSNs, email addresses,
  phone numbers) is redacted by `app/services/pii.py`.
- **IP address** — used only for city/region geolocation (via `ip-api.com`) to
  scope the local resource search. The IP is validated as a public address, used
  for one lookup, and discarded. No IP is stored.
- **localStorage (client-side only)** — the processed result, checklist progress,
  and chat history are stored in the user's browser `localStorage` only. The server
  never sees this data. The "Erase my data" button clears all of it, including
  Cache Storage and the service worker registration.
- **No database** — the system has no database service. There is nothing to breach.

**Demo documents (synthetic):** The Judge Demo Mode carousel uses three
entirely synthetic documents created by hand specifically for this project:

1. *Eviction Crisis* — a fictional eviction notice for a fictional tenant
2. *Hospital Discharge* — a fictional discharge summary with fictional billing
3. *Food Assistance* — a fictional SNAP eligibility letter

These are bundled in `frontend/lib/demo-docs.ts` and contain no real personal data.

**NVIDIA API:** Documents are sent to `api.build.nvidia.com` for inference under
NVIDIA's standard API terms of service. No data is retained by ClarityAI on the
server side.

---

## 3–5 Minute Pitch Video

**Suggested structure for your recording:**

**[0:00 – 0:45] The problem and the user**
> Show a real eviction notice or hospital bill (use a synthetic demo doc).
> Describe: the person has 10 days to respond. They don't know what the notice
> means. They miss the deadline. They lose their home.
> "ClarityAI gives them the 30 seconds of clarity they need to act."

**[0:45 – 1:30] How the AI works**
> Walk through the architecture briefly — multimodal intake, PII redaction,
> llama-3.3-70b extraction, agentic RAG for local resources, multilingual output.
> Show the urgency banner, the task list, the verified resource.

**[1:30 – 3:30] Live walkthrough**
> Use the Judge Demo Mode ("Load Eviction Crisis" button).
> Show the loading skeleton → Summary tab → Tasks tab (check a box) → Resources
> tab (the Responsible AI gate) → Ask tab (type a follow-up question).
> Switch the language to Arabic or Spanish to demonstrate multilingual output.
> Show the read-aloud button.

**[3:30 – 4:30] Responsible AI choice**
> Explain the acknowledgement checkbox gate — why it exists, what risk it addresses.
> Show the confidence score and Source Transparency panel.
> Emphasize: the AI never acts. The human decides.

**[4:30 – 5:00] Close**
> "ClarityAI is live, stateless, and free. No login. No data stored. Just clarity."

---

## Working Demo

**Live URL:** `[your Coolify deployment URL]`

**Or use Judge Demo Mode:**
1. Visit the app
2. Click "Judge Demo Mode" at the top of the intake screen
3. Click any of the three one-tap demo loaders:
   - **Load Eviction Crisis** — a complex eviction notice
   - **Load Hospital Discharge** — a hospital discharge summary with billing
   - **Load Food Assistance** — a SNAP eligibility letter
4. The full pipeline runs automatically and navigates to the dashboard

**Languages:** Use the language selector (top right) on the dashboard to see
real-time multilingual output. Arabic and Urdu switch the interface to RTL.

**Source code:** `https://github.com/falakme/clarityai`
