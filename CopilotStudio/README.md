# Copilot Studio — Topic YAML Source

YAML source for the 9 topics described in [PLAN.md](../PLAN.md) (Section 3). **These have
already been deployed** into the live "ClinicPrep Assistant" agent in Copilot Studio and
verified working (see Status below) — this folder is the source-controlled copy.

## Status: deployed and verified (2026-08-11)

All 9 topics were created directly in Copilot Studio via the code editor and saved:

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

All `BeginDialog` redirects in these files already reference the **real GUIDs** above (not
placeholder names) — no manual patching needed.

**Live-tested in the Test panel:** Greeting fires on "Hi" → asks visit type → asks about a
document → (no document) → generative orchestration correctly hands off to Registration
Pre-fill → asks ID type → ID number → calls the Patient Lookup action. That last call fails
because it hits the placeholder URL (`https://REPLACE-ME...`) — expected, see "Still to do".

## Still to do

### 1. Replace the 5 placeholder action URLs

Each of these topics calls one backend action via an `HttpRequestAction` node pointed at
`https://REPLACE-ME.azurewebsites.net/...` (confirmed to fail with `InvalidUriContent` until
replaced):

| Action (plan §5) | Topic |
| --- | --- |
| Document Parsing | Document Intake & Interpretation |
| Patient Lookup | Registration Pre-fill |
| Eligibility Lookup | Eligibility & Package Matching |
| Billing Calculation | Billing Estimate |
| Create Handoff Record | Handoff Summary |

Build each flow in Power Automate (see
[Create an agent flow as a tool](https://learn.microsoft.com/microsoft-copilot-studio/advanced-flow-create)),
then either replace the placeholder URL with the flow's HTTP-trigger URL, or (recommended)
delete the `HttpRequestAction` node in the canvas and use **Add an action → Flow** instead,
which Studio wires up with the correct connection reference.

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

### 3. Ignore-or-fix: "Identifier not recognized" warnings on some `Global.*` variables

Topics show a handful of non-blocking Topic checker warnings like `Identifier not recognized in
expression 'Global.MatchedPackageName'`. Root cause (confirmed in Studio): a `Global.X`
variable only gets registered in the agent's global variable schema when it's first set via a
**Question** node; setting it only via `SetVariable`/`SetMultipleVariables` (as done here, e.g.
`MatchedPackageCode`, `MatchedPackageName`, `CoverageRuleSummary`, `PayableAmount`,
`BillingCurrency`) doesn't register it, even though the assignment itself saves fine. These
warnings didn't block saving and the variables are still written/read at runtime — but if you
want a clean Topic checker, open each source topic's **Variables** panel, find the variable,
and it should get properly registered once you interact with it there (or via **Variable
properties → convert to global**, the same path used for any topic-scoped variable).

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
