# Conventions

- Treat `CopilotStudio/topics/*.yaml` as reference/history for `SetMultipleVariables` and `BeginDialog`; do not repair those node kinds by hand-editing/re-pasting YAML.
- Rebuild Set variables assignments and cross-topic redirects in the Copilot Studio low-code canvas UI.
- Topic checker can report a stale 0 before the page or virtualized nodes finish loading. Require `document.readyState === "complete"`, no visible loading indicator, and stable `.flow-editor-container.scrollHeight`; repeatedly traverse the full canvas until its post-traversal height stabilizes, then refresh Topic checker twice and require matching counts.
- The Topics overview and Topic checker can aggregate differently: Consent showed 8 persisted overview errors but 4 grouped editor diagnostics. Record both; treat the overview as the aggregate and the checker as the actionable grouping.
- Select actual target topics from Topic management > Go to another topic; hand-typed topic GUIDs may render as unavailable redirects.
- Enter assignment formulas with a leading `=` and commit through the formula dialog; visible plain text can still leave a missing Value error.
- Keep shared field types consistent. The verified `Global.DateOfBirth` fix converts the lookup string with `DateValue(...)` and uses the Date entity for the question so every producer supplies Date.
- A hand-authored `SendActivity` Power Fx expression rendered literally during testing; use a canvas-authored formula or plain confirmation text and verify the actual Test panel output.
- Never guess identity, eligibility, package, or billing values. Route ambiguous/low-confidence outcomes to Escalation / Fallback.
- In mock mode, preserve each action's typed record contract with `SetVariable`; keep fixtures synthetic and deterministic, document the fixture matrix, and avoid Tool use evaluation because no tool call occurs.
- Isolate Evaluation by disabling overlapping legacy custom topics: Data Retrieval from CMS, First-time Visit Registration, Info Confirmation, Purpose of Visit, and Registration. Verify no required topic redirects to a disabled legacy topic.
- General quality can mark required safe refusal/escalation as failure. Treat evaluator-policy mismatch separately from behavioral defects; use targeted expected-response methods where appropriate.
- Use synthetic repository data only; preserve PDPA data minimization, human oversight, confidence-based escalation, and auditability.
- Leave generic pre-existing scaffold topics outside the nine-topic project flow unchanged.