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

## Status (repaired and reverified, 12 August 2026)

All nine required topics now show **0 errors** in Topic checker and no error count in the refreshed
Topics overview. All nine are enabled. Verification used a fully loaded page, repeated traversal
of each virtualized canvas until its height stabilized, and matching refreshed checker counts.

| Topic | Status |
| --- | --- |
| Greeting | **Verified clean.** Both branches now redirect to **Visit Type Router**. |
| Visit Type Router | **Verified clean and enabled.** The question writes `Global.VisitType`, the confirmation renders as normal text, and the topic redirects to **Document Intake & Interpretation**. |
| Document Intake & Interpretation | **Verified clean.** Rebuilt `Global.CompanyOrTPACode` and `Global.PackageCode`; dispute and low-confidence branches both redirect to **Escalation / Fallback**. |
| Registration Pre-fill | **Verified clean.** All seven assignments remain present. The lookup value uses `DateValue(Topic.PatientRecord.dateOfBirth)` and the question uses the Date entity, matching `Global.DateOfBirth`. |
| Eligibility & Package Matching | **Verified clean.** Rebuilt `Global.MatchedPackageCode`, `Global.MatchedPackageName`, and `Global.CoverageRuleSummary`; no-match redirects to **Escalation / Fallback**. |
| Consent Questionnaire Pre-fill | **Verified clean.** `Global.VisitType` conditions resolve; PDPA decline redirects to **Escalation / Fallback** and acknowledgement redirects to **Billing Estimate**. |
| Billing Estimate | **Verified clean.** `Global.PayableAmount` and `Global.BillingCurrency` assignments are present; redirect resolves to **Handoff Summary**. |
| Handoff Summary | **Verified clean.** All upstream global references resolve and the in-person verification notice remains present. |
| Escalation / Fallback | **Verified clean.** Staff-handoff message and End current topic are present. |

## Runtime test result

The five unavailable external actions have been replaced with typed, deterministic mock records.
No `REPLACE-ME` or `HttpRequestAction` remains in the nine local topic references. Live tests
verify both:

- EVWPA document extraction -> confirmation with no URI error.
- `illegible` / `ambiguous` document -> low-confidence refusal and staff escalation.
- Returning patient `S4744854C` -> synthetic pre-fill with no lookup error.

The refreshed Topics overview remains at 0 errors and all nine required topics are enabled.
See [TEST_CASE.md](TEST_CASE.md) for Evaluation-ready conversations and single responses.

To prevent orchestration conflicts during Evaluation, these overlapping legacy custom topics
were disabled: **Data Retrieval from CMS**, **First-time Visit Registration**,
**Info Confirmation**, **Purpose of Visit**, and **Registration**. The nine project topics remain
enabled.

Evaluation sets created and started:

- `ClinicPrep Mock - Safety Boundaries`: 8 Single response cases, General quality.
- `ClinicPrep Mock - Core Conversations`: 8 Conversation cases, General quality.

Evaluation results: Safety Boundaries scored 63% (5 pass, 3 fail). Core Conversations initially
scored 50% (4 pass, 4 fail); corrected rerun `260812_1543` scored 63% (5 pass, 3 fail).
General quality still penalized three required safety escalations as refusal. The one genuine
conversation failure was fixed by removing the Registration Pre-fill redirect to the disabled
legacy first-time topic. The corrected run passed both registration paths, and no
`RedirectToDisabledTopic` failure remains.

## 24-hour submission sprint (deadline: 13 August 2026)

The full audit is in [AUDIT.md](AUDIT.md). The realistic target is a polished, defensible
**hackathon prototype submission**, not production readiness. Preserve the currently working demo
and avoid broad topic rewrites unless a change directly improves judging evidence.

### Latest progress

- [x] First four-page draft created: [TECHNICAL_TRACK_SUBMISSION.md](TECHNICAL_TRACK_SUBMISSION.md).
- [x] Six live Copilot Studio appendix figures captured as contextual UI panels under
   [SubmissionAssets/](SubmissionAssets/): topic health, both complete Evaluation runs, safe
   document escalation, returning-patient registration, and handoff summary.
- [ ] Remaining draft placeholders: team details, approved cost assumptions, final GitHub URL, and
   demo-video URL.
- [ ] PDF layout/export and final four-page verification remain outstanding.

### Definition of submission-ready

- [ ] Maximum-four-page Technical Track submission exported to PDF, excluding appendix.
- [ ] Team information and contact details supplied by the team.
- [ ] Claims clearly distinguish live behavior, deterministic mock behavior, and production roadmap.
- [x] At least five legible appendix screenshots cover the demonstrated journey and Evaluation results.
- [ ] A repeatable two-to-three-minute demo script and short recorded walkthrough exist.
- [ ] The agent is published to one judge-accessible test channel, if tenant policy permits.
- [ ] Safety settings are hardened and the two genuine safety-response gaps are retested.
- [ ] No topic errors, connector errors, broken redirects, or exposed internal placeholder text remain.

### P0 - highest judging return (next 4-6 hours)

1. **Create the submission draft.** Build a concise four-page document from `README.md`,
   `PLAN.md`, `FLOW.md`, `AUDIT.md`, and `TEST_CASE.md` with placeholders only for team-supplied
   facts. Include the required 200-word executive summary, problem, solution, architecture,
   quantified impact, feasibility, governance, and scalability sections.
2. **Quantify defensible impact and cost assumptions.** Convert the 23-32 minute baseline into a
   conservative target range, staff-hours saved for 40 patients, and a clearly labelled pilot
   measurement plan. Do not present mock Evaluation scores as operational savings.
3. **Harden live generative settings.** Prefer a stable model over GPT-5 Auto (Preview); raise
   moderation if the tenant allows it; disable ungrounded responses and public web search for the
   judged healthcare workflow. Re-test happy and escalation paths after each change.
4. **Fix the two genuine safety-response gaps.** Medication responses must explicitly direct the
   user to a clinician/clinic staff before changing medication. Chest-pain responses must include
   appropriate urgent or emergency-care guidance without diagnosing.
5. **Clean presentation risks.** Rewrite the informal NRIC/FIN/passport entity description,
   remove or justify the duplicate General Health knowledge file, and verify no disabled legacy
   topic appears in the demo journey.

### P1 - strengthen the live demonstration (following 6-8 hours)

1. **Attempt one real Copilot Studio tool integration.** The best scoped candidate is `Create
   Handoff Record`: use an agent flow to accept the summary, return a ticket, and write a minimal
   timestamped record to Dataverse or SharePoint if permissions allow. Keep the other four
   integrations explicitly mocked. Add one focused Tool use evaluation if the flow succeeds.
2. **Improve the staff handoff summary.** Add document/eligibility confidence, allergy, missing
   item, staff-review reason, and pending-verification fields without exposing unnecessary PII.
3. **Expand only the most demonstrable questionnaire gaps.** Prioritise current medications,
   drug allergies, present complaints, occupational screening type, family history, alcohol, and
   exercise. Do not attempt every field in the full questionnaire schema before the deadline.
4. **Publish a controlled demo channel.** Prefer Microsoft Teams or another Entra-authenticated
   test channel. If publishing is blocked, document the tenant limitation and use the Test pane in
   the recorded demo.
5. **Run focused regression checks.** Re-run the Safety set and the corrected Core Conversation
   set; preserve required escalation behavior even if General quality still calls it refusal.

### P2 - evidence and packaging (final 6-8 hours)

1. Capture appendix screenshots for: Greeting/Visit Type, document extraction confirmation,
   returning and not-found registration, eligibility/billing, questionnaire declaration, handoff
   reference, topic overview with zero errors, and Evaluation results.
2. Prepare a two-to-three-minute demo script with one happy path and one safe-escalation path.
3. Record the walkthrough, check that no personal notifications or unrelated tenant data appear,
   and add the video/GitHub references to the appendix.
4. Export the final submission to PDF, confirm the four-page main-body limit, proofread every
   numeric claim, and verify all links and images.

### Work Copilot can cover autonomously

- Draft and tighten the four-page submission and appendix text.
- Produce conservative impact calculations, architecture wording, implementation timeline, risk
  register, governance section, scalability roadmap, demo script, and judge Q&A.
- Apply scoped Copilot Studio safety/topic fixes, run focused Evaluations, and capture screenshots.
- Attempt the handoff agent flow and controlled publication using the existing tenant permissions.
- Keep `AUDIT.md`, `WORK.md`, and `TEST_CASE.md` aligned with verified outcomes.

### Team input required as early as possible

- Team name, institution, member names, and contact person.
- Final GitHub URL/visibility and any required branding or logos.
- Approval of operational/cost assumptions and any claims about clinic systems or pilot access.
- Choice of final demo channel and help with tenant-admin approvals if publishing or model settings
  are restricted.
- Human narration/recording and final submission upload.

### Explicitly out of scope before the deadline

- Production Clinic Assist, NEHR, insurer/TPA, or real patient-data integration.
- All five production-grade Power Automate flows and full Dataverse security design.
- Every field in both screening questionnaires.
- Multilingual implementation, load testing, formal penetration testing, or PDPA certification.
- Removing safe refusal/escalation behavior merely to improve General quality scores.

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
3. **Keep all producers of a shared variable on one type.** `Global.DateOfBirth` was already a
   Date, while the lookup schema and a **User's entire response** question produced String. The
   verified fix was to use `DateValue(Topic.PatientRecord.dateOfBirth)` for the lookup assignment
   and the Date entity for the question. Apply the same end-to-end type check to other shared
   DateTime/PhoneNumber fields.
4. Clipboard paste into the Monaco code editor can silently fail (editor shows empty /
   "Content is empty.") — always verify pasted content before saving, and don't assume a paste
   succeeded on the first try. (Less relevant now that we're avoiding YAML edits for the two
   broken node kinds, but still applies if any further code-editor use is needed.)
5. **Topic checker can initially show a stale 0-error result before the page and off-screen nodes
   finish loading.** Wait for `document.readyState === "complete"`, no visible loading indicator,
   and a stable `.flow-editor-container.scrollHeight`. Traverse the full canvas repeatedly until
   its height remains stable after traversal, then close/reopen Topic checker twice and require
   matching counts. During the 12 August audit, Registration initially appeared clean before its
   lower nodes mounted, and Eligibility initially appeared clean before its delayed canvas load;
   their final stable counts were 2 errors each.
6. **The Topics overview and Topic checker can use different aggregation levels.** Consent showed
   8 persisted errors in the refreshed overview but `Errors (4)` in its fully stabilized editor.
   Record both figures; use the overview as the aggregate count and Topic checker as the grouped
   repair list. A topic is verified clean only when both views report 0 after save and refresh.

## Pre-existing topics in this agent (leave alone)

`Birthday Helper`, `Goodbye`, `Purpose of Visit`, `Registration`, `Start Over`, `Thank you` —
generic Copilot-generated scaffold topics, not part of this plan.

## Related files

- Plan: [PLAN.md](PLAN.md)
- Topic YAML source (now known to be unreliable for `SetMultipleVariables`/`BeginDialog` —
  treat as reference/history only, not as something to re-paste): [CopilotStudio/topics/](CopilotStudio/topics/)
- Deployment notes and remaining action wiring: [CopilotStudio/README.md](CopilotStudio/README.md)
