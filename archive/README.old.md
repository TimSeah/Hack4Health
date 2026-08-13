> **Archived 13 August 2026.** This is the original working README, kept for history. It predates the
> repository reorganization and its relative links point at the old flat file layout — see the current
> [README.md](../README.md) for the up-to-date, submission-ready version.

# Hack4Health 2026 — Technical Challenge Track

This README summarizes what is required to build and submit a solution for the **Technical Track** of Hack4Health 2026, based on the source documents in this repository.

> Source documents (converted to Markdown for easy reading):
> - [1. Technical Problem Statement.md](1.%20Technical%20Problem%20Statement.md) — the challenge brief
> - [3. Hack4Health Judging Criteria.md](3.%20Hack4Health%20Judging%20Criteria.md) — submission template & scoring rubric
> - [4. Microsoft Copilot Guide.md](4.%20Microsoft%20Copilot%20Guide.md) — Copilot Studio / agents background
> - [Data/Parkway_Shenton_Questionnaires_Field_Reference.md](Data/Parkway_Shenton_Questionnaires_Field_Reference.md) — full field schema for the two screening questionnaires
> - [Data/Sample Medical Chit Letters (v2).md](Data/Sample%20Medical%20Chit%20Letters%20(v2).md) — sample insurer/TPA documents to parse
> - [Data/patient_registration_synthetic.csv](Data/patient_registration_synthetic.csv), [Data/general_health_questionnaire_mock_patients.csv](Data/general_health_questionnaire_mock_patients.csv), [Data/occupational_health_questionnaire_mock_patients.csv](Data/occupational_health_questionnaire_mock_patients.csv) — synthetic mock patient datasets

## 1. The Challenge

> **How might we automate pre-registration and eligibility verification for both scheduled appointments and walk-in patients, so the necessary information is retrieved and processed before they reach the front desk** — eliminating the need for staff to manually determine coverage, benefits, and screening packages — **while ensuring identity verification is still completed securely in person?**

Clinic staff currently spend **~23–32 minutes of administrative work per patient** (≈18 cumulative hours for 40 patients/morning) manually: identifying the patient, interpreting employer/insurer/TPA paperwork (which has no standard format), checking CHAS/insurance eligibility, matching screening packages, re-collecting details already on file across paper forms, determining billing, and re-keying data into TPA portals for claims. This bottleneck at the registration counter delays every patient behind it.

## 2. What the Solution Must Do (and Must Not Do)

| Constraint | Implication for your build |
| --- | --- |
| Must be **portable to Microsoft Copilot Studio** | Doesn't need to be built in Copilot Studio during the hackathon, but you must show how it maps to/integrates with Copilot Studio agents |
| **Identity verification & e-card validation stay manual, in person** | Do not automate away the counter staff's physical ID check — design around it, not through it |
| **Operational cost must be realistic** | Justify cost of AI/API/Azure usage vs. staff-time saved; avoid over-engineered or unaffordable architectures |
| **Everything else may be automated** | Document interpretation, eligibility checks, package matching, and registration data entry are all fair game |

## 3. Core Tasks to Build a Working Solution

1. **Ingest & interpret unstructured referral/authorisation documents** — parse the varied insurer/TPA letters, vouchers, and authorisation forms (see [Data/Sample Medical Chit Letters (v2).md](Data/Sample%20Medical%20Chit%20Letters%20(v2).md)) to extract: patient identity, policy/proposal number, company/TPA code, requested tests/package, and billing party.
2. **Pre-fill patient registration** using the extracted data plus any prior records, matching the fields in [Data/patient_registration_synthetic.csv](Data/patient_registration_synthetic.csv) (name, NRIC/FIN/passport, DOB, address, contact, drug allergy) so staff/patients aren't re-typing what's already known.
3. **Automate eligibility & package matching** — determine CHAS tier or corporate/insurer coverage, and match it to the correct screening package (General Health vs. Occupational Health, and package tier/code) before the patient reaches the counter.
4. **Pre-fill the consent/disclosure questionnaires** (medical history, family history, lifestyle, allergies, declaration) ahead of the visit, using the field schemas in [Data/Parkway_Shenton_Questionnaires_Field_Reference.md](Data/Parkway_Shenton_Questionnaires_Field_Reference.md), reusing data already captured at registration instead of asking again.
5. **Determine billing** — surface the applicable billing code and any patient-payable amount before/at arrival, rather than working it out live at the counter.
6. **Handle the TPA double-entry problem** — avoid/streamline the duplicate manual entry into a TPA portal after the visit (steps 4 and 12 of the as-is flow) by proposing how dispensed medication/checkup data could flow through automatically.
7. **Preserve the in-person steps** — design the hand-off so identity verification and e-card validation still happen physically at the counter, with your automation providing the staff a pre-verified summary to confirm against.
8. **Show the Copilot Studio integration path** — even if prototyped elsewhere (e.g. a custom app, Azure AI Foundry, LangChain), explain how the same logic/agents would be re-implemented or connected via Copilot Studio (see [4. Microsoft Copilot Guide.md](4.%20Microsoft%20Copilot%20Guide.md)).

## 4. Submission Deliverable (Technical Track Submission Template)

Max **4 pages** (excluding appendix). Required sections, per [3. Hack4Health Judging Criteria.md](3.%20Hack4Health%20Judging%20Criteria.md):

1. **Team Information** — team name, institution(s), members (1–5), contact person
2. **Executive Summary** (~200 words) — solution in plain English
3. **Problem Understanding** — current clinic workflow, pain points, root causes, why it matters
4. **Proposed AI Solution** — AI used, workflow, user journey, how clinicians/patients interact with it (diagrams encouraged)
5. **Technical Architecture** — LLM, AI models, APIs, databases, Azure services, conceptual integration with Clinic Assist/NEHR
6. **Operational Impact** — quantify improvements (waiting time, admin workload, vaccination uptake, revenue, safety)
7. **Feasibility** — why it's realistic with Copilot Studio; resources required; timeline; dependencies
8. **Governance & Safety** — PDPA compliance, human oversight, AI hallucination mitigation, audit trail, security
9. **Scalability** — how it expands across Parkway Shenton and IHH
10. **Appendix** (optional) — prototype, GitHub, video, screenshots, poster

## 5. Judging Rubric (Technical Track — /100)

| Criterion | Weight |
| --- | --- |
| Problem Understanding | 20 |
| Operational Impact | 20 |
| Technical Feasibility & Integration | 15 |
| Innovation | 15 |
| User Experience | 10 |
| Governance & Safety | 10 |
| Scalability | 10 |

## 6. Suggested Checklist

- [ ] Team info + contact person confirmed
- [ ] Synthetic dataset built/extended from the provided CSVs and reference docs
- [ ] Document-parsing approach defined for at least the sample chit/letter types provided
- [ ] Eligibility + package-matching logic defined (rules and/or LLM-based)
- [ ] Pre-fill flow designed for registration + consent questionnaires (no duplicate data entry)
- [ ] Billing determination logic defined
- [ ] Identity verification/e-card validation explicitly kept as an in-person, manual step in the workflow diagram
- [ ] Architecture diagram covering LLM/models/APIs/DB/Azure services + Clinic Assist/NEHR integration (conceptual)
- [ ] Cost/operational feasibility estimated
- [ ] PDPA, human-oversight, hallucination-mitigation, audit-trail, and security measures described
- [ ] Quantified expected impact (time saved, workload reduced, etc.)
- [ ] Scalability story across Parkway Shenton / IHH
- [ ] Copilot Studio portability explained
- [ ] Submission fits within 4 pages (excl. appendix); optional appendix (prototype/GitHub/video/screenshots/poster) prepared

## 7. Reference Materials in This Repo

| File | Purpose |
| --- | --- |
| [Data/patient_registration_synthetic.csv](Data/patient_registration_synthetic.csv) | Synthetic patient registration records (identity, contact, drug allergy) |
| [Data/general_health_questionnaire_mock_patients.csv](Data/general_health_questionnaire_mock_patients.csv) | Mock completed General Health screening questionnaires |
| [Data/occupational_health_questionnaire_mock_patients.csv](Data/occupational_health_questionnaire_mock_patients.csv) | Mock completed Occupational Health screening questionnaires |
| [Data/Parkway_Shenton_Questionnaires_Field_Reference.md](Data/Parkway_Shenton_Questionnaires_Field_Reference.md) | Full field-by-field schema for both questionnaires |
| [Data/Sample Medical Chit Letters (v2).md](Data/Sample%20Medical%20Chit%20Letters%20(v2).md) | Sample synthetic insurer/TPA referral letters, vouchers, and authorisation forms to parse |
| [TEST_CASE.md](TEST_CASE.md) | Copilot Studio Evaluation cases, mock contracts, and semantic pass criteria |
| [1. Technical Problem Statement.md](1.%20Technical%20Problem%20Statement.md) | Full challenge brief, as-is process flow, and admin-impact figures |
| [2. Non-Technical Problem Statement.md](2.%20Non-Technical%20Problem%20Statement.md) | The other track's brief (vaccination uptake), for reference |
| [3. Hack4Health Judging Criteria.md](3.%20Hack4Health%20Judging%20Criteria.md) | Submission templates and judging sheets for both tracks |
| [4. Microsoft Copilot Guide.md](4.%20Microsoft%20Copilot%20Guide.md) | Background on Copilot Studio and agents |
| [5. Agnes AI Set Up Guide.md](5.%20Agnes%20AI%20Set%20Up%20Guide.md) | Model showcase deck (Agnes AI) referenced as an available model/API provider |
| [Resources/](Resources/) | Programme briefing, intro video, and workflow-visual links (external NotebookLM artifacts) plus the event playbook deck |

## 8. Note on PDPA & Synthetic Data

All CSVs and sample documents in this repository are **synthetic/fictional** (explicitly labelled where applicable) and intended only for building and testing your prototype. Any real patient or insurer data must never be used without proper authorisation, and your submitted solution must still address PDPA compliance as required in the Governance & Safety section above.
