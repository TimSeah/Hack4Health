# ClinicPrep Assistant - Hack4Health Audit

Audit date: 12 August 2026

Scope: the live `ClinicPrep Assistant` in Microsoft Copilot Studio, repository topic references,
Evaluation results, the Technical Problem Statement, questionnaire field reference, and the
Technical Track judging criteria.

## Overall Verdict

The hackathon goal is **achieved as a functional mock prototype**, but it is **not yet a complete
solution or submission**.

The Copilot Studio implementation demonstrates the intended patient journey, safety boundaries,
registration pre-fill, deterministic package matching, billing, and staff-verification handoff.
However, the central integrations are simulated, the questionnaires cover only a representative
subset, the agent is not published, and several judging/submission requirements remain partial or
missing.

## Live Copilot Studio Results

### Verified strengths

- All nine required topics are enabled with no listed topic errors.
- `Consent Questionnaire Pre-fill` reports no errors or warnings in Topic checker.
- The overlapping legacy topics **Data Retrieval from CMS**, **First-time Visit Registration**,
  **Info Confirmation**, **Purpose of Visit**, and **Registration** are disabled.
- The agent-level instructions preserve in-person identity and e-card/insurance-card verification,
  prohibit medical advice and fabricated coverage, and require pending-verification language.
- Microsoft Entra ID authentication is enabled and multi-tenant access is off.
- Seven knowledge entries are ready, including the Parkway Shenton website, sample medical chits,
  questionnaire reference, and synthetic datasets.
- File upload support is enabled.
- Two eight-case Evaluation sets are present and completed.

### Evaluation evidence

| Test set | Run | Result | Interpretation |
| --- | --- | --- | --- |
| Core Conversations | `260812_1543` | **63% (5 pass, 3 fail)** | Both registration paths and the principal mock journeys pass. Three intentional safety escalations are penalized by the General quality rubric. |
| Safety Boundaries | `260812_1532` | **63% (5 pass, 3 fail)** | Boundaries generally hold, but medication and chest-pain responses need more explicit clinical/urgent-care guidance. |

The corrected conversation rerun removed the genuine `RedirectToDisabledTopic` defect. General
quality remains a poor sole judge for required refusal/escalation behavior; the safe behavior must
not be weakened merely to increase this score.

## Critical Findings

### 1. Core automation is simulated

The live Tools page says **Create your first tool**. Document parsing, patient lookup, eligibility,
billing, and handoff creation are deterministic in-topic records rather than Power Automate tools.
Consequently, the prototype does not prove real API calls, action selection, connector failure
handling, persistence, or audit logging.

### 2. No operational data persistence exists

The planned Dataverse `Patients`, `CoverageRules`, `Questionnaires`, `VisitTickets`, and `AuditLog`
contracts are architectural only. PDPA acknowledgement, questionnaire responses, confidence,
ticket state, and action history are not persisted or timestamped.

### 3. Questionnaire coverage is incomplete

The live and source-controlled `Consent Questionnaire Pre-fill` topic implements five General
Health questions and three Occupational Health questions, followed by PDPA acknowledgement. The
field reference contains a much larger medical, family, lifestyle, immunisation, pain, sexual,
occupational, and declaration schema. Hazard selection is free text rather than a validated
multi-select entity.

### 4. Eligibility and billing demonstrate one main fixture

Successful document parsing normally returns EVWPA/WELL2. Eligibility is a flat match, and billing
is SGD 0 for WELL2 or SGD 75 otherwise. CHAS tiers, alternative insurers/packages, age/gender
rules, occupational hazard panels, add-ons, and itemised estimates are not demonstrated.

### 5. Escalation is not a real staff handoff

The fallback topic explains that staff will help and then ends the conversation. It is not connected
to Omnichannel, Teams, a callback queue, email, or another engagement hub. Conversation context is
therefore not delivered to a staff work queue.

### 6. The agent is not deployed

The Channels page reports **Not published**. No web, Microsoft Teams, kiosk, or patient-portal
channel is configured, so the before-arrival user journey currently exists only in the internal Test
pane.

### 7. Generative safety settings do not match the documented posture

- Model: **GPT-5 Auto (Preview)**. Copilot Studio warns that it is not recommended for production.
- Content moderation: **Low**.
- Ungrounded responses: **On**.
- Public Bing web search: **On**.

These settings increase variability and weaken the requirement to use curated evidence and avoid
guessing in an administrative healthcare workflow.

### 8. Controlled entities and localisation are incomplete

The planned VisitType, IDType, company/package, gender, and hazard closed-list entities are absent.
Only one custom NRIC/FIN/passport regex entity is visible, and its informal internal description
should be rewritten before judging. The primary language is English (United States), with no
secondary languages; prebuilt phone/address entities are therefore not Singapore-tailored.

### 9. Knowledge configuration needs cleanup

The General Health synthetic CSV appears twice, with one copy associated with `New Patient
Registration Agent`. This duplication should be removed or clearly justified. The Technical
Problem Statement is not present as a knowledge source despite being listed in the plan.

### 10. The formal submission package is missing

There is no consolidated maximum-four-page Technical Track submission. Team information, a
200-word executive summary, final architecture presentation, implementation timeline, resource and
cost assumptions, multi-clinic scalability narrative, screenshots, poster, and demo video are not
assembled into submission artifacts.

## Core Task Coverage

| Challenge task | Audit status | Evidence/gap |
| --- | --- | --- |
| Interpret unstructured documents | **Partial** | Deterministic EVWPA/WELL2 record and confidence keyword test; no OCR/AI action. |
| Pre-fill registration | **Partial** | Returning and not-found paths work; only one returning-patient fixture. |
| Eligibility/package matching | **Partial** | WELL2 demonstration works; broader rules and demographics are absent. |
| Pre-fill consent questionnaires | **Not met in full** | Representative subset only; no prior-visit persistence. |
| Determine billing | **Partial** | Simplified deterministic estimate; no real coverage rules or itemisation. |
| Eliminate TPA double entry | **Not implemented** | Proposed in diagrams only; no TPA or post-visit integration. |
| Preserve in-person verification | **Met** | Instructions, topics, and handoff messaging retain the manual staff check. |
| Show Copilot Studio integration | **Met** | Nine live topics, knowledge, instructions, variables, tests, and architecture plan exist. |

## Judging Criteria Assessment

| Criterion | Weight | Audit status | Rationale |
| --- | ---: | --- | --- |
| Problem Understanding | 20 | **Met** | Clear workflow, root causes, 23-32 minute baseline, and duplicate-entry problem. |
| Operational Impact | 20 | **Partial** | Impact pathway is clear, but expected time/cost/error savings are not validated or fully quantified. |
| Technical Feasibility & Integration | 15 | **Partial** | Strong Copilot Studio prototype; no tools, Dataverse, Clinic Assist/NEHR, or TPA integration. |
| Innovation | 15 | **Partial to strong** | Pre-counter document interpretation and reuse of captured data are compelling, but differentiation is not written. |
| User Experience | 10 | **Partial** | Key journeys work internally; no published channel, accessibility evidence, or complete form experience. |
| Governance & Safety | 10 | **Partial** | Entra authentication and human oversight are strong; no audit trail and live generative settings are too permissive. |
| Scalability | 10 | **Weak/partial** | Multi-clinic data isolation, rollout, localisation, language support, and coverage-rule operations are not developed. |

Evidence-based current estimate: **55-65/100**, not an official judge score.

## Submission Readiness

| Required section/artifact | Status |
| --- | --- |
| Team information | Missing |
| Executive summary | Missing as a submission-ready section |
| Problem understanding | Strong source material; needs compression |
| Proposed AI solution | Strong source material; needs submission formatting |
| Technical architecture | Partial; live/mock boundary and conceptual integrations must be explicit |
| Quantified operational impact | Partial |
| Feasibility, timeline, resources, dependencies | Missing/partial |
| Governance and safety | Partial; implementation limitations must be disclosed |
| Parkway Shenton/IHH scalability | Missing/partial |
| Four-page final document | Missing |
| Appendix screenshots | Missing except one internal repair screenshot |
| Demo video/poster | Missing |

## Conclusion

ClinicPrep Assistant is a credible **hackathon prototype** and should be presented honestly as one.
The strongest 24-hour strategy is to polish and evidence the working prototype, add one credible
tool/persistence integration if tenant access permits, harden safety, publish a demo channel, and
assemble the required submission. Attempting full production integration or every questionnaire
field before the deadline would add regression risk without proportionate judging value.

See [WORK.md](WORK.md) for the time-boxed submission sprint.