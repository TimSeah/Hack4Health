# Copilot Studio — Topic YAML Source

YAML reference source for the 9 topics described in [PLAN.md](../docs/PLAN.md) (Section 3). These
topics are deployed in the live "ClinicPrep Assistant" agent. `SetMultipleVariables` assignments
and `BeginDialog` redirects in these files are reference/history only: those nodes had to be
rebuilt in the low-code canvas because hand-authored YAML did not round-trip reliably.

## Status: topics clean; SharePoint handoff live (2026-08-13)

All 9 required topics are enabled and show **0 errors** in both Topic checker and the refreshed
Topics overview:

| Topic | Copilot Studio topic ID |
| --- | --- |
| Greeting (existing topic, overwritten) | `b29183e2-db26-4753-a8c9-c4a64f96724d` |
| Visit Type Router | `fa12cd4e-0c2e-4ec1-ba2e-aedfea707955` |
| Document Intake & Interpretation | `6260f546-ac97-42bf-9076-3a19bf3faa3c` |
| Registration Pre-fill | `28abeab0-65f8-4041-9fe2-8848e27f0859` |
| Eligibility & Package Matching | `05919c5f-7e22-41f4-b656-fa30abd53499` |
| Consent Questionnaire Pre-fill | `c8a63344-a351-471b-bde0-7c3b4a58ecf2` |
| Billing Estimate | `ea5b2fc8-a9ba-411c-a61b-63b30c357940` |
| Handoff Summary | `798f70c7-e80f-4b6a-a872-79610b04ca83` |
| Escalation / Fallback | `5d869520-458f-4616-94fb-1e6ad5ab1f97` |

The live canvas redirects were recreated through **Topic management -> Go to another topic**;
do not re-paste the hand-authored `BeginDialog` GUIDs from these files.

**Live-tested in the Test panel:** `Hi` triggers Greeting, both first-time branches route to
Visit Type Router, and the active journey captures `Global.VisitPurpose`. Document extraction,
low-confidence escalation, and returning-patient lookup run without URI errors. Handoff Summary
normalises the live variables, calls Power Automate, and returns a SharePoint-backed ticket.

## Hybrid mock/live action mode

Four unavailable external actions are replaced by typed `SetVariable` records. Handoff is live:

| Action | Mock behavior |
| --- | --- |
| Document Parsing | EVWPA/WELL2 fixture; `illegible` or `ambiguous` input returns confidence 0.4. |
| Patient Lookup | `S4744854C` returns the synthetic Tan Kai Xuan record; other IDs are not found. |
| Eligibility Lookup | Existing company code returns WELL2 Comprehensive Screen; missing context escalates. |
| Billing Calculation | WELL2 returns SGD 0 payable; other codes return SGD 75. |
| Create Handoff Record | Published agent flow writes to `ClinicPrep Handoff Queue` and returns `H4H-{SharePoint item ID}` with `Pending Verification`. |

Evaluation cases and pass criteria are in [TEST_CASE.md](../docs/TEST_CASE.md). Use **General
quality** for the four mocked boundaries and a focused **Tool use** case for handoff.

For isolated Evaluation runs, the overlapping legacy topics **Data Retrieval from CMS**,
**First-time Visit Registration**, **Info Confirmation**, **Purpose of Visit**, and
**Registration** are disabled. Copilot Studio imports at most 6 question-answer pairs per
conversation; split longer scenarios into focused cases.

## Still to do

### 1. Replace the remaining mock records before production

Build the other four flows in Power Automate (see
[Create an agent flow as a tool](https://learn.microsoft.com/microsoft-copilot-studio/advanced-flow-create)),
then replace each mock `SetVariable` node with **Add an action -> Flow**. Expand Tool use
evaluations for action selection, input mapping, failure handling, and audit logging. The current
handoff flow is suitable for hackathon evidence but still needs production access control,
retention, queue ownership, and monitoring.

### 2. Optional: upgrade closed-list fields from free text

`VisitType`, `IDType`, and hazard type are currently captured as `StringPrebuiltEntity` (free
text) rather than real closed-list entities, because a custom entity must already exist in the
agent before a topic can reference it (`entity:` cannot bare-reference an entity name that
doesn't exist yet — see Verified facts below). To upgrade: **Agent → Entities → New entity →
Closed list**, create `VisitType` (GP Consultation / General Health Screening / Occupational
Health Screening), `IDType` (NRIC/FIN / Passport), etc., per plan §4, then change the
corresponding `Question` node's `entity:` value in the canvas (the exact YAML for a closed-list
reference wasn't reverse-engineered here — easiest done by picking the entity in the UI and
reading back the generated YAML).

## Verified facts about the Copilot Studio topic-YAML schema

These were confirmed empirically while deploying (not just from docs) — see
`/memories/copilot-studio.md` for the full notes:

- **The folded block scalar `>-` is not supported** and silently breaks the parser (error
  surfaces as `UnexpectedCharacter` at end-of-file). Use a single-line quoted string, or the
  literal block `|-` for real multi-line text.
- **`HttpRequestAction.body.kind`** must be `JsonRequestContent`, `RawRequestContent`, or
  `NoRequestContent` (PascalCase) — not `json`/`raw`/`none`.
- **`Question.entity:`** only accepts a bare string for *prebuilt* entity kinds (e.g.
  `StringPrebuiltEntity`, `BooleanPrebuiltEntity`, `PersonNamePrebuiltEntity`,
  `DateTimePrebuiltEntity`, `EmailPrebuiltEntity`, `PhoneNumberPrebuiltEntity` — note these
  exact names, not `Email`/`DateTime`/`Person.FullName`). A custom closed-list entity requires
  an object (`{ kind: ClosedListEntityReference, ... }`) and the entity must already exist in
  the agent.
- `inputType: {}` / `outputType: {}` top-level keys are **not required** for normal topics.
- Pasting into the code editor via clipboard (`navigator.clipboard.writeText` + paste) preserves
  exact formatting; typing character-by-character risks Monaco auto-indent corrupting YAML.
- Hand-authored `SetMultipleVariables.variables` maps can disappear after round-trip, leaving an
  empty Set variables node (`EmptyCollection`). Rebuild these assignments in the canvas.
- Hand-authored `BeginDialog.dialog` GUIDs can render as unavailable Topic nodes. Rebuild each
  redirect through the topic picker in the canvas.

## File → topic map

| File | Topic name in Copilot Studio |
| --- | --- |
| `greeting.topic.yaml` | Greeting |
| `visit-type-router.topic.yaml` | Visit Type Router |
| `document-intake.topic.yaml` | Document Intake & Interpretation |
| `registration-prefill.topic.yaml` | Registration Pre-fill |
| `eligibility-package-matching.topic.yaml` | Eligibility & Package Matching |
| `consent-questionnaire-prefill.topic.yaml` | Consent Questionnaire Pre-fill |
| `billing-estimate.topic.yaml` | Billing Estimate |
| `handoff-summary.topic.yaml` | Handoff Summary |
| `escalation-fallback.topic.yaml` | Escalation / Fallback |

## Variable scope

- `Topic.*` — local to that topic only (default).
- `Global.*` — used for `VisitType`, `FullName`, `IDType`, etc. so later topics can read values
  captured earlier (e.g. set in Greeting/Registration, read in Handoff Summary). See "Still to
  do #3" above for the known gap on variables set only via `SetVariable`.
- `System.*` — built-in system variables.

## Pre-existing topics in this agent (not part of this plan)

The agent already had some auto-generated scaffold topics before this work: `Birthday Helper`,
`Goodbye`, `Purpose of Visit`, `Registration`, `Start Over`, `Thank you`. These were left
untouched — only `Greeting` (overwritten, since it matches plan §3.1) and the 9 new topics above
were touched.
