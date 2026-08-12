# Task Completion

- For each topic, wait for a complete document, no visible loading indicator, and stable canvas height; repeatedly traverse the full virtualized canvas until its post-traversal height stabilizes, then refresh Topic checker twice and require matching counts before resolving errors and saving.
- A 0-error checker result is insufficient by itself: verify response-variable bindings, Set variables assignments, and displayed redirect targets are present.
- After saving, refresh the Topics overview; require both its aggregate error count and Topic checker's grouped count to be 0, and confirm every required topic is enabled.
- For repaired Set variables nodes, visually verify every variable/value assignment and absence of red node errors before saving.
- For redirects, verify the displayed target topic name after recreating the node through the UI picker.
- In mock mode, verify no `REPLACE-ME` or `HttpRequestAction` remains, each replacement record has the expected type, and mock conversations run without connector/URI errors.
- Before Evaluation, disable overlapping legacy topics and test every required path that formerly redirected to one; a disabled target fails at runtime even when Topic checker reports 0.
- Record pass/fail details, distinguishing real agent defects from General quality penalizing intentional safety escalation.
- Before production, replace all five mock records with authenticated actions and then add Tool use evaluations.
- Run the full Copilot Studio Test panel flow from Greeting through Handoff Summary, covering document/registration, eligibility, consent, and billing; capture screenshots at each step.
- Confirm the handoff states that identity and card validation await in-person staff verification.
- Keep `WORK.md`, `PLAN.md`, `TEST_CASE.md`, and `CopilotStudio/README.md` explicit about verification scope: mock evaluation is not production integration proof.