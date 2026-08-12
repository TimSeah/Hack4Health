# Copilot Studio Agent Setup Plan — Pre-Registration & Eligibility Assistant

Implementation plan for the Technical Track solution (see [README.md](README.md) and [1. Technical Problem Statement.md](1.%20Technical%20Problem%20Statement.md)). This describes how to configure the agent directly in **Microsoft Copilot Studio**.

## 1. Agent Identity

| Setting | Value |
| --- | --- |
| **Name** | `ClinicPrep Assistant` |
| **Description** | "Prepares patients for their GP consultation or health screening before they reach the registration counter — reads referral/insurance documents, checks eligibility, matches the right screening package, pre-fills registration and consent forms, and gives staff a ready-to-verify summary. Identity/e-card verification is always completed in person by staff." |
| **Icon** | Clinic/checklist icon (brand-neutral, avoid implying it replaces clinical staff) |
| **Language(s)** | English (add Chinese/Malay/Tamil later for scalability) |
| **Orchestration mode** | Generative AI orchestration (classic topics for the fixed/compliance-critical steps: consent, handoff, escalation) |

## 2. System Prompt (Agent Instructions)

Paste into **Settings → Generative AI → Instructions** (or the agent's top-level instructions):

```
You are ClinicPrep Assistant, a pre-registration assistant for a Parkway Shenton / IHH clinic.

Your job is to prepare a patient's visit BEFORE they reach the registration counter, so staff
spend less time on paperwork. You support two visit types: GP Consultation and Health Screening
(General Health or Occupational Health).

You MUST:
- Collect or confirm the patient's basic details (full name, NRIC/FIN/Passport, date of birth,
  contact number, email, address) using prior records where available, only asking for what is
  missing or has changed.
- Interpret uploaded or pasted referral/insurance documents (medical chits, TPA authorisation
  forms, insurer vouchers, HR emails) to extract: company/insurer/TPA code, policy or proposal
  number, requested tests or screening package, and billing party.
- Use the eligibility lookup action to match the patient to the correct screening package or
  consultation billing arrangement (e.g. CHAS tier, corporate panel, insurer package code).
- Pre-fill the relevant consent/disclosure questionnaire (General Health or Occupational Health)
  using details already captured, and only ask the patient to confirm or add new information
  (medical history, family history, lifestyle, allergies).
- Produce a clear pre-registration summary for counter staff containing: patient identity as
  claimed, matched package/coverage, any outstanding/uncovered cost, and any missing document.
- Always state that identity verification and e-card/insurance-card validation will still be
  completed in person by clinic staff — never claim to have verified identity yourself.

You MUST NOT:
- Confirm, approve, or finalise a patient's identity, eligibility, or billing — you only
  prepare a draft for staff to confirm. Always use language like "pending staff verification".
- Provide medical advice, diagnoses, or interpret clinical results.
- Store, repeat back, or log more personal data than necessary for the current visit
  (data minimisation, PDPA).
- Guess or fabricate a company/insurer/TPA code, package match, or billing figure when the
  source document is unclear — escalate to a human instead.

If a document cannot be confidently interpreted, or the patient's coverage/package cannot be
matched with high confidence, say so explicitly and hand off to front-desk staff rather than
guessing.

Tone: concise, reassuring, plain English, suitable for patients of varying digital literacy.
```

## 3. Topics

Use classic Topics for the compliance-critical / fixed steps, and let generative orchestration handle free-form document Q&A in between.

### 3.1 `Greeting` (system topic, customized)
- Trigger: conversation start
- Action: ask whether this is for a **GP Consultation** or a **Health Screening**, and whether the patient has a referral letter/voucher/e-card to upload
- Routes to `Visit Type Router`

### 3.2 `Visit Type Router`
- Trigger phrases: "GP consultation", "health screening", "checkup", "pre-employment medical"
- Slots to fill: `VisitType` (GP Consultation | General Health Screening | Occupational Health Screening)
- Branches to `Document Intake` topic

### 3.3 `Document Intake & Interpretation`
- Trigger: patient uploads a file / pastes text of a referral, voucher, authorisation form, or HR email
- Action: call the **Document Parsing** action (Section 5) to extract:
  - Company/Insurer/TPA code (e.g. `MRDEB`, `EVWPA`, `EVWME`, `BLPDE`, `BLPHS`, `NSTNBU`, `MOL0199VME`)
  - Policy/Proposal/Contract number
  - Patient name + ID number as printed on the document
  - Requested tests / package code (e.g. `WELL1/2/3`, `PEE224/225/226`)
  - Expiry date / appointment date, if present
- On low-confidence extraction: ask the patient to confirm the extracted fields, or escalate
- Routes to `Registration Pre-fill`

### 3.4 `Registration Pre-fill`
- Trigger: after document intake, or directly if patient has no document (self-pay/walk-in)
- Slots: `FullName`, `IDType` (NRIC/FIN | Passport), `IDNumber`, `DateOfBirth`, `Address`, `PostalCode`, `ContactMobile`, `Email`, `DrugAllergy`
- Action: call **Patient Lookup** action against existing records (`patient_registration_synthetic.csv` / Dataverse table) to pre-fill and only prompt for missing/changed fields
- Routes to `Eligibility & Package Matching`

### 3.5 `Eligibility & Package Matching`
- Trigger: after registration details are confirmed
- Action: call **Eligibility Lookup** action with `{CompanyCode | TPACode | InsurerCode, VisitType, DOB, Gender}` to determine:
  - Applicable package (e.g. `WELL2 — Comprehensive Screen`, CHAS tier, occupational hazard panel)
  - Any age/gender-conditional inclusions (e.g. mammogram, PSA, gynaecological history)
- On no match / ambiguous match: flag for staff review rather than guessing
- Routes to `Consent Questionnaire Pre-fill`

### 3.6 `Consent Questionnaire Pre-fill`
- Trigger: package/eligibility confirmed
- Branches by `VisitType`:
  - **General Health Screening** → walks through Medical History, Family History, Lifestyle sections from [Data/Parkway_Shenton_Questionnaires_Field_Reference.md](Data/Parkway_Shenton_Questionnaires_Field_Reference.md), pre-filled from prior visits where available
  - **Occupational Health Screening** → shorter Personal/Family history + lifestyle Yes/No set, plus hazard-specific screening type multi-select
- Ends with the PDPA declaration statement and asks the patient to acknowledge (equivalent of the signature step) — **this acknowledgement is captured, not the physical signature**
- Routes to `Billing Estimate`

### 3.7 `Billing Estimate`
- Trigger: after eligibility + package are set
- Action: call **Billing Calculation** action to return covered vs. patient-payable amount
- Presents a plain-English estimate ("Your Comprehensive Screen is fully covered by [Insurer]; no out-of-pocket cost expected, pending verification")
- Routes to `Handoff Summary`

### 3.8 `Handoff Summary` (always ends here)
- Compiles a single staff-facing summary card: claimed identity, visit type, matched package/coverage, billing estimate, any flags/missing items
- Explicit note: **"Awaiting in-person identity verification and e-card/insurance card check by staff."**
- Generates a queue ticket / reference number for the patient

### 3.9 `Escalation / Fallback`
- Trigger: low-confidence document parsing, no eligibility match, sensitive question (medical advice, complaints), or user asks for a human
- Action: hand off to front-desk staff / live agent, retain conversation context

## 4. Entities

Define these as Copilot Studio entities (or Dataverse choice columns) so slots resolve consistently:

| Entity | Type | Example values |
| --- | --- | --- |
| `VisitType` | Closed list | GP Consultation, General Health Screening, Occupational Health Screening |
| `IDType` | Closed list | NRIC/FIN, Passport |
| `CompanyOrTPACode` | Closed list (extendable) | MRDEB, EVWPA, EVWME, BLPDE, BLPHS, NSTNBU, MOL0199VME |
| `PackageCode` | Closed list (extendable) | WELL1, WELL2, WELL3, PEE224, PEE225, PEE226 |
| `Gender` | Closed list | Male, Female |
| `PainLevel` | Number (1–10) | — |
| Prebuilt entities | — | `Person.FullName`, `DateTime`, `Email`, `PhoneNumber`, `Age` |

## 5. Actions (Power Automate flows / connectors)

| Action | Type | Input → Output |
| --- | --- | --- |
| **Document Parsing** | Power Automate flow using AI Builder / Azure AI Document Intelligence (or Azure OpenAI prompt) | Uploaded file or pasted text → structured JSON (company/TPA code, policy no., requested package, patient name/ID, dates) |
| **Patient Lookup** | Power Automate flow → Dataverse/SQL table seeded from `patient_registration_synthetic.csv` | ID number → existing registration record (or "not found") |
| **Eligibility Lookup** | Power Automate flow → Dataverse table mapping company/TPA/insurer codes to packages & coverage rules | Company/TPA code + visit type + demographics → matched package + coverage rule |
| **Billing Calculation** | Power Automate flow (simple rules engine) | Package + coverage rule → covered amount / payable amount |
| **Create Handoff Record** | Power Automate flow → Dataverse/SharePoint list (+ optional Teams notification to front desk) | Summary payload → ticket/reference number |

> All actions should log to a Dataverse **audit table** (timestamp, action, input hash, output, confidence score) to support the Governance & Safety section of the submission.

## 6. Knowledge Sources

Add as generative-answers knowledge (read-only, for Q&A like "what does WELL2 cover?"):

- [Data/Parkway_Shenton_Questionnaires_Field_Reference.md](Data/Parkway_Shenton_Questionnaires_Field_Reference.md)
- [Data/Sample Medical Chit Letters (v2).md](Data/Sample%20Medical%20Chit%20Letters%20(v2).md) *(as few-shot reference for document formats, not real data)*
- [1. Technical Problem Statement.md](1.%20Technical%20Problem%20Statement.md) *(for the agent to explain "why" if asked)*
- A curated **package/coverage rules table** (build from the sample chits: package codes, inclusions, age bands)

## 7. Variables & Data Model (Dataverse tables to create)

- `Patients` — mirrors `patient_registration_synthetic.csv` columns
- `CoverageRules` — CompanyOrTPACode, VisitType, PackageCode, InclusionsList, AgeMin, AgeMax, GenderRestriction
- `Questionnaires` — links to `Patients`, stores General/Occupational Health responses (schema per field reference doc)
- `VisitTickets` — VisitType, PatientId, MatchedPackage, BillingEstimate, Status (Pending Verification | Verified | Escalated), CreatedOn
- `AuditLog` — Action, InputSummary, OutputSummary, ConfidenceScore, Timestamp

## 8. Governance & Safety Configuration

- **Human-in-the-loop**: every topic ends in "pending staff verification" language; no topic can mark a `VisitTicket` as `Verified` — only staff/back-office system can.
- **PDPA**: consent/declaration topic must run before any questionnaire data is stored; store only fields required for the visit; set Dataverse row-level security so patient data is only visible to the originating clinic.
- **Hallucination mitigation**: Document Parsing action returns a confidence score; anything below threshold (e.g. 0.8) routes to `Escalation / Fallback` instead of presenting extracted data as fact.
- **Audit trail**: every action call writes to `AuditLog` (Section 7).
- **Security**: connectors authenticated via Azure AD/Entra ID service principals; no PII in Copilot Studio analytics/transcripts beyond default retention; restrict channel to clinic-managed devices/kiosk or authenticated patient portal (not public web).

## 9. Test Scenarios (use synthetic data)

1. Walk-in, no document, self-pay GP consultation → registration pre-fill only, no package match needed.
2. Corporate screening with a TPA authorisation form (e.g. `MOL0199VME`, package `PEE226`) → full flow through billing estimate.
3. Insurer voucher (`EVWPA`, `WELL2`) nearing expiry → agent flags expiry risk.
4. Illegible/ambiguous document → escalation path triggered, no fabricated package match.
5. Returning patient (exists in `Patients` table) → registration fields pre-filled, only confirmation asked.
6. Occupational hazard screening with multiple hazard types selected → correct multi-select questionnaire branch.

## 10. Deployment / Channels

- Primary channel: clinic-managed **kiosk/tablet** at pre-registration, or a **patient-facing web/Teams link** sent ahead of a scheduled appointment.
- Secondary: embed in **Microsoft Teams** for internal staff testing during the hackathon demo.
- Publish to a **test environment** first; require sign-off against the Governance & Safety checklist before any production/pilot deployment.
