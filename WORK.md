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

## Status (repaired and reverified, 13 August 2026)

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
| Handoff Summary | **Verified clean with a live tool.** The topic calls `Create ClinicPrep Handoff Record`, writes a data-minimised SharePoint row, returns `H4H-{item ID}`, and retains the in-person verification notice. |
| Escalation / Fallback | **Verified clean.** Staff-handoff message and End current topic are present. |

## Runtime test result

Four unavailable external actions remain typed, deterministic mock records. `Create Handoff Record`
is now a published agent flow backed by the SharePoint list `ClinicPrep Handoff Queue`.
No `REPLACE-ME` or `HttpRequestAction` remains in the nine local topic references. Live tests
verify both:

- EVWPA document extraction -> confirmation with no URI error.
- `illegible` / `ambiguous` document -> low-confidence refusal and staff escalation.
- Returning patient `S4744854C` -> synthetic pre-fill with no lookup error.
- General Consult -> live flow -> queue reference `H4H-4` -> SharePoint item 4 with `Pending
   Verification` status.

The final SharePoint readback contained VisitType, PatientName, package/coverage, currency, amount,
and verification status. It did not contain the submitted identity number, date of birth, address,
or phone number. Handoff Topic checker and Flow checker both report 0 errors and 0 warnings.

### SharePoint handoff integration closure (completed 13 August 2026)

**Verdict: complete and manually validated end to end.**

- SharePoint list: `ClinicPrep Handoff Queue`, stored under the authenticated user's **My lists**
   area to avoid placing hackathon records in an unrelated team/course site.
- Published agent flow: `Create ClinicPrep Handoff Record`, flow ID
   `93526f13-ea96-f111-b8dc-7ced8dfec66f`.
- Live Handoff Summary uses `InvokeFlowAction`; the deterministic handoff mock is no longer present.
- The action normalises legitimate General Consult blanks before invocation and returns the
   SharePoint item ID plus `Pending Verification`.
- Final live run returned `H4H-4`; Microsoft Lists item 4 was reopened on 13 August and confirmed:
   `General Consult`, `Singh Amir`, `Not applicable`, `NIL`, `SGD`, `50`, and
   `Pending Verification`.
- The list contract excludes raw identity number, date of birth, address, phone, medical history,
   and questionnaire responses. `IDTypeAsReported`, `StaffReviewReason`, and `MissingItems` were
   blank in the verified record.
- Live Handoff Topic checker was reopened after the final save and reports **no errors or warnings**
   and `Errors (0)`. The published flow checker reports **0 errors / 0 warnings**.
- Source, tests, audit, architecture, screenshots, HTML, and PDF now distinguish the one live
   SharePoint handoff from the four remaining mocked action boundaries.

Manual behavior and data-contract testing are complete. The focused `T01` **Tool use Evaluation**
set/run is intentionally recorded as the next validation step; it has not yet received a formal
Copilot Studio score.

The refreshed Topics overview remains at 0 errors and all nine required topics are enabled.
See [TEST_CASE.md](TEST_CASE.md) for Evaluation-ready conversations and single responses.

To prevent orchestration conflicts during Evaluation, these overlapping legacy custom topics
were disabled: **Data Retrieval from CMS**, **First-time Visit Registration**,
**Info Confirmation**, **Purpose of Visit**, and **Registration**. The nine project topics remain
enabled.

Evaluation sets created and started:

- `ClinicPrep Mock - Safety Boundaries`: 8 Single response cases, General quality.
- `ClinicPrep Mock - Core Conversations`: 8 Conversation cases, General quality.
- `ClinicPrep Live - Handoff Tool`: focused Tool use case specified in [TEST_CASE.md](TEST_CASE.md);
   Evaluation set/run not yet created.

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
- [x] Eight contextual evidence images captured under [SubmissionAssets/](SubmissionAssets/),
   including the live `H4H-4` conversation and corresponding SharePoint record.
- [x] Published `Create ClinicPrep Handoff Record` agent flow connected to Handoff Summary.
- [x] Live agent run created and read back SharePoint item 4 with data-minimised fields and no raw
   identity number, date of birth, address, phone, or questionnaire data.
- [ ] Remaining draft placeholders: team details, approved cost assumptions, final GitHub URL, and
   demo-video URL.
- [x] PDF exported as [TECHNICAL_TRACK_SUBMISSION.pdf](TECHNICAL_TRACK_SUBMISSION.pdf): four-page
   A4 main body plus six appendix pages. All ten pages were raster-inspected; the updated Mermaid
   architecture and contextual Copilot Studio/SharePoint screenshots are fully visible without
   clipping.

### Definition of submission-ready

- [x] Maximum-four-page Technical Track submission exported to PDF, excluding appendix.
- [ ] Team information and contact details supplied by the team.
- [x] Claims clearly distinguish live behavior, deterministic mock behavior, and production roadmap.
- [x] At least five legible appendix screenshots cover the demonstrated journey and Evaluation results.
- [ ] A repeatable two-to-three-minute demo script and short recorded walkthrough exist.
- [ ] The agent is published to one judge-accessible test channel, if tenant policy permits.
- [ ] Safety settings are hardened and the two genuine safety-response gaps are retested.
- [ ] No topic errors, connector errors, broken redirects, or exposed internal placeholder text remain.

### Remaining priority order for the evening

1. **Fill submission-owned placeholders.** Team name, institution, members/contact, approved
   staff-cost assumptions, final GitHub URL, and demo-video URL require team input.
2. **Harden live generative safety.** Prefer an approved stable model over GPT-5 Auto (Preview),
   raise moderation if permitted, and disable ungrounded responses/public web search for the judged
   workflow. Make one setting change at a time and regression-test after each.
3. **Fix and retest the two genuine safety wording gaps.** Medication responses must explicitly
   direct the user to a clinician/clinic staff before changing medication. Chest-pain responses
   must include appropriate urgent/emergency-care guidance without diagnosing.
4. **Run focused Evaluations.** Create/run `ClinicPrep Live - Handoff Tool` using `T01`, then rerun
   Safety Boundaries and corrected Core Conversations after any safety setting/topic changes.
5. **Publish a controlled demo channel.** Prefer Microsoft Teams or another Entra-authenticated
   test channel. If tenant policy blocks publishing, record the limitation and use the Test pane.
6. **Prepare the demo package.** Produce a repeatable two-to-three-minute script, record the happy
   path plus safe escalation, verify no unrelated tenant data is visible, and update the video URL.
7. **Only if time remains:** rewrite the informal NRIC entity description, remove/justify duplicate
   knowledge, add high-value handoff flags, or extend selected questionnaire fields. Avoid broad
   topic rewrites before submission.

### Work Copilot can cover autonomously

- Draft and tighten the four-page submission and appendix text.
- Produce conservative impact calculations, architecture wording, implementation timeline, risk
  register, governance section, scalability roadmap, demo script, and judge Q&A.
- Apply scoped Copilot Studio safety/topic fixes and run focused Evaluations.
- Maintain the verified SharePoint handoff flow and attempt controlled publication using existing
   tenant permissions.
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
- The four remaining production action flows, replacement of the personal SharePoint queue with an
   assigned production work queue/Dataverse design, and full production security configuration.
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
