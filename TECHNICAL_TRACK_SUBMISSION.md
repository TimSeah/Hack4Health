# Hack4Health 2026 - Technical Track Submission

## Page 1 of 4 - Team, Problem and Solution

### 1. Team Information

| Field | Details |
| --- | --- |
| Team name | **[Team Name]** |
| Institution | **[Institution]** |
| Members | **Member 1; Member 2; Member 3; Member 4** |
| Contact person | **[Name and email]** |

### 2. Executive Summary

Clinic registration is slowed less by identity checking than by the administrative work around it:
staff interpret inconsistent referral or insurer documents, search for patient records, determine
eligibility and screening packages, repeat information across forms, estimate billing, and prepare a
queue entry. The challenge brief estimates 23-32 minutes of administrative work per patient.

**ClinicPrep Assistant** is a Microsoft Copilot Studio prototype that moves these tasks before the
counter while retaining the two steps that must remain physical: identity verification and e-card or
insurance-card validation. A patient selects the visit type, supplies a referral or voucher, confirms
pre-filled registration details, completes a focused health questionnaire, receives a billing estimate,
and obtains a handoff reference. Unclear documents, missing eligibility context, declined consent, and
medical questions are escalated rather than guessed.

The live prototype contains nine enabled, error-free topics, curated synthetic knowledge, Entra ID
authentication, and two eight-case Evaluation sets. Five external actions are represented by typed,
deterministic mocks because production connectors were unavailable; the architecture replaces these
with Power Automate and Dataverse. The corrected Core Conversations run and Safety Boundaries run each
scored 63% under General quality. Three conversation failures reflect intentional safety escalation,
not fabricated answers. The result is a credible, human-supervised prototype with a practical path to a
controlled clinic pilot.

### 3. Problem Understanding

The current counter workflow is sequential and fragmented. Staff re-enter registration details, read
non-standard medical chits and TPA authorisations, identify the correct corporate or insurer code, match
packages, determine payment, and later re-key visit information into insurer portals. Screening
patients also repeat known details in General or Occupational Health questionnaires. For 40 patients in
a morning, the brief estimates about 18 cumulative staff-hours of administrative effort.

The root causes are:

- heterogeneous documents and coding schemes;
- disconnected patient, eligibility, questionnaire, billing, and TPA systems;
- administrative processing beginning only when the patient reaches the counter;
- duplicate data collection and no reusable, structured handoff record; and
- safety-critical identity and card checks being mixed with automatable clerical work.

The design therefore automates preparation, not approval. Staff retain authority over identity,
eligibility, coverage, billing, and correction of exceptions.

### 4. Proposed AI Solution

ClinicPrep Assistant supports scheduled and walk-in GP, General Health Screening, and Occupational
Health Screening journeys. Its innovation is a single pre-arrival conversation that transforms varied
inputs into a structured **pending-verification visit record**. Fixed topics control consent, safety,
and handoff; generative orchestration handles natural-language routing and explanation.

The patient experience is concise: provide or upload once, confirm reused data, answer only missing
questions, and arrive with a reference. The staff experience is a summary of claimed identity, source
document, package, estimated payable amount, allergies and outstanding checks. Low-confidence or
missing-context cases enter a review path instead of receiving a guessed answer.

<div style="page-break-after: always;"></div>

## Page 2 of 4 - Workflow and Technical Architecture

### 5. User Journey and Workflow

1. **Route the visit.** Capture GP Consultation, General Health Screening, or Occupational Health
   Screening and whether a document is available.
2. **Interpret the document.** Extract company/TPA code, policy number, patient details, requested
   package, dates, and confidence. Low confidence routes to staff review.
3. **Pre-fill registration.** Look up the claimed NRIC/FIN or passport and ask only for missing or
   changed details. The physical identity check remains at the clinic.
4. **Match eligibility and package.** Apply curated coverage rules using visit type and relevant
   demographics. Ambiguous or absent context routes to staff.
5. **Complete the questionnaire.** Reuse registration data and collect visit-relevant medical,
   family, lifestyle, allergy, and occupational information, followed by PDPA acknowledgement.
6. **Estimate billing.** Explain covered and patient-payable amounts as estimates pending staff
   verification.
7. **Create the handoff.** Give the patient a reference and provide staff a structured record marked
   `Pending Verification`.
8. **Verify in person.** Staff inspect identity and the e-card/insurance card, resolve flags, and only
   then confirm the visit in the clinic system.

### 6. Technical Architecture

The diagram below is the **target pilot architecture**. The current hackathon prototype implements
the Copilot Studio and knowledge layers; its five action boundaries are deterministic mocks.

```mermaid
flowchart LR
    P[Patient: Teams / web / kiosk] --> C[ClinicPrep Assistant]
    K[Curated knowledge] --> C
    C --> D[Document Parsing Flow]
    C --> L[Patient Lookup Flow]
    C --> E[Eligibility Rules Flow]
    C --> B[Billing Flow]
    C --> H[Handoff Flow]
    D --> DV[(Dataverse)]
    L --> DV
    E --> DV
    B --> DV
    H --> DV
    DV --> S[Staff verification work queue]
    S --> CA[Clinic Assist / clinic system]
    S -. approved clinical workflow only .-> N[NEHR]
```

| Layer | Prototype | Pilot/production path |
| --- | --- | --- |
| Conversation | Copilot Studio generative orchestration plus nine classic topics | Stable, organisation-approved model with fixed compliance topics |
| Knowledge | Parkway Shenton website, synthetic records, questionnaire reference, sample chits | Versioned, approved package and policy knowledge |
| Document parsing | Typed EVWPA/WELL2 mock with confidence branch | Power Automate plus Azure AI Document Intelligence or approved multimodal model |
| Patient/eligibility | Deterministic found/not-found and package mocks | Power Automate querying Dataverse/approved clinic APIs |
| Billing | Deterministic covered/payable record | Rules flow using versioned package and coverage tables |
| Handoff | Deterministic reference | Dataverse `VisitTicket`, staff queue, timestamp and audit record |
| Security | Microsoft Entra ID; multi-tenant access disabled | Least-privilege service principals, row-level access and retention controls |

The proposed Dataverse model contains `Patients`, `CoverageRules`, `Questionnaires`, `VisitTickets`,
and `AuditLog`. Each action records timestamp, action, minimum necessary input summary, confidence,
outcome, and rule/model version. Raw identifiers should not be copied into logs unnecessarily.

**Clinic Assist/NEHR boundary:** after staff verification, an approved connector may create or update
the administrative visit in Clinic Assist. The bot does not write directly to NEHR or create clinical
facts. Any NEHR exchange remains within authorised clinical workflows after human confirmation.

### Prototype evidence and limitations

The nine required topics are enabled with no listed topic errors. The prototype demonstrates document
confirmation, returning and new-patient registration, safe escalation, questionnaire branching,
billing, and handoff using synthetic data. It is not yet published, has no live agent tools, and uses
representative questionnaire fields. These are disclosed limitations, not production claims.

<div style="page-break-after: always;"></div>

## Page 3 of 4 - Operational Impact and Feasibility

### 7. Operational Impact

The challenge baseline is **23-32 administrative minutes per patient**. Within that total, registration,
document interpretation, eligibility, package verification, and billing account for approximately
10-19 counter minutes. ClinicPrep Assistant moves most preparation before arrival, leaving staff to
verify identity/card, review the summary, and handle exceptions.

Because the current implementation is a prototype, the following are **pilot targets**, not measured
outcomes:

| Pilot measure | Baseline | Conservative target/hypothesis |
| --- | --- | --- |
| Counter time for in-scope preparation | 10-19 min | Reduce by 6-10 min for successfully pre-registered patients |
| Staff effort for 40 completed pre-registrations | Not separated from 18-hour total | Avoid 240-400 minutes, or **4.0-6.7 staff-hours**, per morning |
| Duplicate entry | Registration, forms and TPA re-keying | Reuse one verified `VisitTicket`; measure fields re-keyed per visit |
| Package/billing corrections | Not supplied | Track mismatch and override rates before and after pilot |
| Safety | Manual interpretation risk | 100% staff confirmation; 100% low-confidence cases escalated |

Pilot evaluation should measure median and 90th-percentile counter time, completion/abandonment,
percentage of fields pre-filled, staff overrides, false package matches, escalation rate, and patient
and staff satisfaction. A matched baseline period is required before claiming realised savings.

For 40 patients, the calculation is:

$$40 \times (6\text{-}10\text{ minutes saved}) = 240\text{-}400\text{ minutes} = 4.0\text{-}6.7\text{ staff-hours}$$

### Cost and operational viability

The architecture controls cost by using deterministic rules for eligibility and billing, reserving AI
for document interpretation and conversational assistance. It reuses Microsoft Power Platform rather
than adding a separate application stack. Before pilot approval, the team will validate Copilot Studio
licensing, Power Automate premium connectors, Dataverse capacity, document-processing volume, support,
and security-review cost against the following break-even model:

$$\text{Monthly benefit} = \frac{\text{patients} \times \text{adoption} \times \text{minutes saved}}{60}
\times \text{loaded staff hourly cost}$$

A pilot proceeds only if measured operational benefit, safety and patient experience justify the
platform and implementation cost. **Pricing and loaded staff-cost assumptions: [confirm with sponsor].**

### 8. Feasibility, Resources and Delivery

The prototype demonstrates that the workflow fits Copilot Studio topics, variables, knowledge,
Evaluation, authentication, and Power Platform integration boundaries. The main dependencies are
access to approved clinic/TPA interfaces, authoritative coverage rules, a privacy/security review,
clinical and operations sign-off, and tenant permissions for tools and channels.

| Phase | Indicative duration | Deliverable |
| --- | --- | --- |
| Hackathon | Complete | Synthetic-data prototype, nine topics, safety paths and Evaluation evidence |
| Hardening | 2-4 weeks | Stable model/settings, complete priority fields, accessibility review and test channel |
| Integration | 4-8 weeks | Five flows, Dataverse tables, audit logging and sandbox clinic-system interface |
| Limited pilot | 8-12 weeks | One or two clinics, trained staff, monitored KPIs and rollback process |
| Scale decision | After evidence review | Expand rules, languages and clinics only if safety/ROI thresholds are met |

Indicative pilot team: product/operations owner, Copilot Studio/Power Platform engineer, integration
engineer, clinic subject-matter expert, privacy/security reviewer, and part-time UX/accessibility
support.

<div style="page-break-after: always;"></div>

## Page 4 of 4 - Governance, Scalability and Recommendation

### 9. Governance and Safety

- **Human authority:** the assistant prepares drafts only. Identity, e-card, eligibility, coverage and
  billing remain pending until staff confirmation.
- **Hallucination control target:** use approved knowledge and versioned rules; disable
   ungrounded/public-web responses; route low-confidence or missing-context cases to staff.
- **Clinical boundary:** do not diagnose, interpret results or advise medication changes. Urgent
  symptoms receive appropriate emergency/urgent-care direction and human escalation.
- **Consent and PDPA:** explain purpose, minimise collection, capture acknowledgement before storage,
  and stop the automated path when consent is declined.
- **Security:** Entra ID authentication, single-tenant access, least-privilege connectors, per-clinic
  row security, encryption, environment separation and approved retention/deletion periods.
- **Auditability:** record the action, timestamp, confidence, rule/model version, output and human
  override without duplicating unnecessary identifiers.
- **Operational controls:** staff training, exception queue, monitoring, incident response, rollback,
  periodic rule review and a named owner for coverage-table changes.

The current prototype already enforces pending-verification language and safe escalation. Its live
configuration still uses GPT-5 Auto (Preview), Low moderation, ungrounded responses and public web
search. Before judging/pilot use, it must move to an approved stable model, strengthen moderation,
disable ungrounded/public-web answers, connect a real audit trail, and validate all patient-facing
safety text.

### 10. Scalability Across Parkway Shenton and IHH

The design separates reusable orchestration from local configuration. A centrally governed
`CoverageRules` service can version insurer, TPA, employer and package mappings while each clinic owns
its staff queue, operating hours and escalation contacts. Dataverse records are partitioned by clinic
with role-based access; common topics and test suites are packaged as managed solutions and promoted
through development, test and production environments.

Scale occurs in controlled stages: one workflow and clinic, then additional packages, clinics and
languages after threshold review. Singapore English and local phone/address formats are prioritised
for the pilot, followed by Chinese, Malay and Tamil where validated translations and support processes
exist. New insurer or occupational rules require an owner, source, effective date, regression cases and
rollback version.

This configuration-driven approach supports Parkway Shenton first and wider IHH adoption without
allowing one clinic's data or unapproved rules to leak into another. Capacity, latency, completion,
escalation and override metrics are monitored by clinic and package.

### 11. Current Evidence and Next Decision

The corrected mock Evaluation produced **5/8 passes (62.5%, displayed as 63%)** for Core Conversations
and **5/8 passes (62.5%, displayed as 63%)** for Safety Boundaries. Both registration cases, the
principal document path, full mock path and
occupational branch passed. Three conversation failures were intentional refusal/escalation cases that
General quality treated as non-answers; this behavior should be judged against explicit safety criteria,
not weakened to optimise a generic score. Two genuine safety wording gaps are being corrected and
retested.

ClinicPrep Assistant demonstrates that pre-registration can be orchestrated safely in Copilot Studio
while keeping physical verification with staff. The recommendation is a limited, synthetic/sandbox
pilot focused on measurable counter-time reduction, data quality, override rates and safe escalation.
Production deployment is contingent on real integrations, governance approval and evidence from that
pilot.

## Appendix - Prototype Evidence

Appendix material does not count toward the four-page main body.

### Figure A1 - Topic health and conflict isolation

Required topics are enabled with blank error/blocked columns; overlapping legacy topics shown in
the table are disabled.

![Copilot Studio topic table showing enabled project topics and disabled legacy topics](SubmissionAssets/A1-topics-enabled.png)

### Figure A2 - Corrected Core Conversations Evaluation

Run `260812_1543`: 63% (5 pass, 3 fail) after the registration redirect defect was removed.

![Core Conversations Evaluation result showing five passes and three failures](SubmissionAssets/A2-core-evaluation-63.png)

### Figure A3 - Safety Boundaries Evaluation

Run `260812_1532`: 63% (5 pass, 3 fail), including successful identity, billing, PDPA-purpose,
human-handoff, and counter-workflow boundaries.

![Safety Boundaries Evaluation result showing responses and score](SubmissionAssets/A3-safety-evaluation-63.png)

### Figure A4 - Safe document escalation

The assistant refuses to guess from an ambiguous document and routes it to staff. General quality
labels the required refusal as a failure, illustrating why explicit safety criteria are needed.

![Conversation detail showing refusal to guess an ambiguous package and staff escalation](SubmissionAssets/A4-safe-document-escalation.png)

### Figure A5 - Returning-patient registration

The synthetic returning-patient path finds the existing record and proceeds without an external
connector error.

![Conversation detail showing returning-patient registration path](SubmissionAssets/A5-returning-patient-registration.png)

### Figure A6 - Staff handoff contract

The Handoff Summary topic produces `MOCK-H4H-001` and explicitly retains in-person identity and
e-card/insurance-card verification.

![Handoff Summary topic showing queue reference and pending in-person verification notice](SubmissionAssets/A6-handoff-summary.png)

- Repository evidence: [AUDIT.md](AUDIT.md), [TEST_CASE.md](TEST_CASE.md), [FLOW.md](FLOW.md),
  [PLAN.md](PLAN.md), and [CopilotStudio/](CopilotStudio/).

> Draft placeholders to resolve before submission: team details, sponsor-approved pricing/staff-cost
> assumptions, final GitHub URL, and demo-video URL.
