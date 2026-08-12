# WORK.md — Copilot Studio topic-fixing session (resume point)

## Context

The 9 topics in [CopilotStudio/topics/](CopilotStudio/topics/) were originally created by
pasting hand-authored YAML into the Copilot Studio code editor (see
[CopilotStudio/README.md](CopilotStudio/README.md)). The user reported the topics don't
actually work / have multiple errors. Root cause: **two YAML node kinds don't reliably survive
round-tripping through the code editor** even though they "parse" without a syntax error:

1. `kind: SetMultipleVariables` with a hand-written `variables:` map — the map gets silently
   dropped, producing an **empty "Set variables" node** in the canvas (error:
   `Missing required property 'Value'` / `EmptyCollection`).
2. `kind: BeginDialog` with a hand-typed topic GUID in `dialog:` — does **not** reliably
   resolve. Renders as a broken **"Topic" / redirect node** that shows the agent's own name
   ("ClinicPrep Assistant") instead of the target topic, with **"Selected topic is no longer
   available"**.

**Current directive (per user): do not keep hand-editing YAML for these two node kinds.**
Fix everything from here on using the **interactive low-code topic builder** (the canvas UI),
not the code editor. Full reliable click-by-click workflow is below.

## Environment

- Agent: **ClinicPrep Assistant**, environment "Singapore University of Technology and Design"
- Base URL: `https://copilotstudio.microsoft.com/environments/Default-3476b776-e990-4f72-b950-62489831623d/bots/2125bbaf-c794-f111-b8dc-7ced8dfec66f/`
- Open a topic directly: base URL + `adaptive/{GUID}`

| Topic | GUID |
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

## Status (as of this checkpoint)

| Topic | Status |
| --- | --- |
| Billing Estimate | ✅ **Fixed & verified** — Set variables (PayableAmount, BillingCurrency) rebuilt via UI, redirect rebuilt via UI → **Handoff Summary**. Saved clean, 0 errors. |
| Registration Pre-fill | ✅ **Fixed & verified** — 7-field Set variables node rebuilt via UI (FullName, DateOfBirth, Address, PostalCode, ContactMobile, Email, DrugAllergy). Also had to change the `DateOfBirth` Question's "Identify" entity from **Date and time** to **User's entire response** (see Gotcha #3 below) to fix a type-mismatch error. Saved clean, 0 errors. |
| Document Intake & Interpretation | 🔴 **In progress, NOT verified clean.** See "Next immediate steps" below — last screenshot shows the `storeParsedFields` Set variables node is genuinely **empty** (no CompanyOrTPACode/PackageCode assignments present despite earlier work in this direction — re-do from scratch, don't assume prior partial progress survived). The low-confidence-branch redirect (elseActions of `checkParsingConfidence`) is still showing broken ("ClinicPrep Assistant" / topic picker never completed). The dispute-branch redirect (inside `checkConfirmation`, on "No" to "Does this look correct?") status is **unconfirmed** — it may or may not still be there; scroll to it and check before assuming either way. |
| Eligibility & Package Matching | ⬜ Not yet started this pass. Known to need: Set variables fix (MatchedPackageCode, MatchedPackageName, CoverageRuleSummary) + 1 redirect fix (no-match branch → Escalation / Fallback). |
| Handoff Summary | ⬜ Not yet started this pass. Likely needs Set variables review (this topic mostly reads Global.* rather than setting them, but re-check with Topic checker). |
| Consent Questionnaire Pre-fill | ⬜ Not yet started this pass. Known to need: 2 redirect fixes (PDPA-decline branch → Escalation / Fallback; acknowledgement → Billing Estimate). |
| Visit Type Router | ⬜ Not checked in this pass (previously saved with 0 errors when first created — verify it's still clean). |
| Greeting | ⬜ Not checked in this pass (previously saved with 0 errors when first created — verify it's still clean). |
| Escalation / Fallback | ⬜ Not checked in this pass (previously saved with 0 errors when first created — verify it's still clean). |

## Next immediate steps (resume here)

1. Open Document Intake & Interpretation (GUID above). Open **Topic checker** to see the
   current live error count/list (don't trust old assumptions).
2. Fix the `storeParsedFields` Set variables node: add 2 assignments —
   `Global.CompanyOrTPACode = Topic.ParsedDocument.companyOrTpaCode`,
   `Global.PackageCode = Topic.ParsedDocument.requestedPackageCode` — using the UI workflow
   below.
3. Scroll down to find both redirect nodes (dispute branch + low-confidence branch). Fix
   whichever are still broken so both point to **Escalation / Fallback**, using the redirect
   workflow below.
4. Save. Confirm 0 errors (no "Save topic with errors?" dialog).
5. Repeat the same diagnose → fix Set variables → fix redirects → save → verify pattern for:
   **Eligibility & Package Matching**, **Consent Questionnaire Pre-fill**, **Handoff Summary**.
6. Re-check **Visit Type Router**, **Greeting**, **Escalation / Fallback** with Topic checker
   just in case (they were clean before, shouldn't have regressed, but verify).
7. Once all 9 show 0 errors, do a full end-to-end Test panel run (Greeting → Visit Type →
   Document/Registration → Eligibility → Consent → Billing → Handoff) and take screenshots at
   each step to visually confirm, per the user's instruction to keep using the screenshot tool
   to verify.
8. Update [CopilotStudio/README.md](CopilotStudio/README.md) status section once everything is
   confirmed clean (it currently overstates completeness from the previous pass).

## Reliable UI workflow — fixing a "Set variables" node

1. Click **New assignment** for each key/value pair needed.
2. Click the empty **"Set variable"** button to open the picker (only works while empty; once a
   variable is already chip-referenced, clicking it opens "Variable properties" instead — if
   that happens, use `evaluate_script` to `.click()` the specific
   `button[aria-label="Set variable"]` DOM node by index to reliably reopen the picker).
3. In the **"Select a variable"** dialog: use the `fill` tool on the search textbox to filter
   (typing via `type_text` sometimes doesn't register), then use `evaluate_script` to find and
   `.click()` the exact `[role="menuitem"]` whose textContent includes the target `Global.X`
   name, then click **"Dismiss"** (`button[aria-label="Dismiss"]`) to close — pressing Enter is
   unreliable.
4. If the Global variable doesn't exist yet: click **"Create a new variable"** (creates
   `Var1:unknown`), then click the `Var1` chip to open **Variable properties**, rename it, and
   set the scope radio to **Global (any topic can access)**.
5. For **"To value"**: click it, then use the `fill` tool with a leading `=` (e.g.
   `=Topic.PatientRecord.fullName`) — this opens an **"Enter formula"** dialog pre-filled and
   showing a Type/Output preview; click **Insert** to commit. Typing plain text with no `=` via
   `type_text` does NOT work (leaves "Missing required property 'Value'" even though text is
   visible in the box).
6. After all assignments, take a screenshot to visually confirm no red error text under any
   node, then **Save**. A clean save (no "Save topic with errors?" dialog) confirms success.

## Reliable UI workflow — fixing a "Redirect" / Topic node

1. Scroll the canvas to find it — broken redirect nodes can render far down/right and are easy
   to miss (`document.querySelector('.flow-editor-container').scrollTop += N` via
   `evaluate_script`, or use the Mini-map).
2. Click its **"More"** menu → **Delete**.
3. Click the **"+ Add node"** button where it used to be → **Topic management** → **Go to
   another topic** → pick the real topic by name from the full picker list (includes both
   custom and system topics with descriptions). This is the only reliable way — hand-typed
   GUIDs in `dialog:` are not trustworthy even when copied from the topic's own browser URL.

## Gotchas encountered

1. **`SetMultipleVariables` YAML → empty canvas node.** See above; always rebuild via UI.
2. **`BeginDialog` YAML → broken redirect.** See above; always rebuild via UI.
3. **DateTime/PhoneNumber prebuilt entity type mismatch.** A Question node using
   `DateTimePrebuiltEntity` (or similar typed prebuilt entities) resolves to a non-string type
   (e.g. `DateTime`) at the node level. If a `Global` variable of the same name is later also
   assigned a `String` value elsewhere (e.g. from an `HttpRequestAction` response schema
   declared as `String`), Copilot Studio raises **"Variable is being set to an incorrect type.
   Assigned: DateTime, expected: String."** Fix: change the Question node's **"Identify"**
   entity to **"User's entire response"** (plain string, no extraction) to keep the field
   consistently typed as String end-to-end. Watch for this on any other
   `DateTimePrebuiltEntity`/`PhoneNumberPrebuiltEntity` fields that feed into a later
   `SetVariable`/`SetMultipleVariables` assignment.
4. Clipboard paste into the Monaco code editor can silently fail (editor shows empty /
   "Content is empty.") — always verify pasted content before saving, and don't assume a paste
   succeeded on the first try. (Less relevant now that we're avoiding YAML edits for the two
   broken node kinds, but still applies if any further code-editor use is needed.)

## Pre-existing topics in this agent (leave alone)

`Birthday Helper`, `Goodbye`, `Purpose of Visit`, `Registration`, `Start Over`, `Thank you` —
generic Copilot-generated scaffold topics, not part of this plan.

## Related files

- Plan: [PLAN.md](PLAN.md)
- Topic YAML source (now known to be unreliable for `SetMultipleVariables`/`BeginDialog` —
  treat as reference/history only, not as something to re-paste): [CopilotStudio/topics/](CopilotStudio/topics/)
- Prior status write-up (overstates completeness — superseded by this file):
  [CopilotStudio/README.md](CopilotStudio/README.md)
