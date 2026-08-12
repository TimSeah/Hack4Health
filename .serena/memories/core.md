# Hack4Health Core

- Hack4Health 2026 Technical Track prototype: `ClinicPrep Assistant`, a Microsoft Copilot Studio pre-registration and eligibility assistant for Parkway Shenton / IHH clinic workflows.
- Automates document interpretation, registration pre-fill, eligibility/package matching, questionnaire pre-fill, billing estimates, and staff handoff.
- Invariant: identity verification and e-card/insurance-card validation remain manual, in-person staff steps; all automated results remain pending staff verification.
- Source map: `README.md` summarizes the challenge/submission requirements; `PLAN.md` defines the intended agent architecture and topics; `WORK.md` is the authoritative live implementation/repair checkpoint; `CopilotStudio/topics/` contains topic YAML reference/history; `Data/` contains synthetic test data and questionnaire/document references.
- As of 2026-08-12, all nine required live topics are enabled and report 0 errors in Topic checker and the refreshed overview; `WORK.md` and `CopilotStudio/README.md` contain the verified repair record.
- Mock mode is active: five unavailable external actions are replaced by typed in-topic records, with no `REPLACE-ME` or `HttpRequestAction` remaining in the nine local topic references. Use `TEST_CASE.md` for Evaluation; replace mocks with Power Automate actions before production.
- Read `mem:tech_stack` for platform/data formats, `mem:conventions` for Copilot Studio authoring constraints, `mem:suggested_commands` for available validation operations, and `mem:task_completion` for completion criteria.