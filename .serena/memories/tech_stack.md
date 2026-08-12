# Tech Stack

- Primary runtime/authoring platform: Microsoft Copilot Studio, using classic topics plus generative AI orchestration.
- Topic source/reference files: YAML under `CopilotStudio/topics/`; they are not a reliable deployment mechanism for every node kind.
- Planned integrations: Power Automate flows/connectors; AI Builder, Azure AI Document Intelligence, or Azure OpenAI for parsing; Dataverse/SQL for patients, coverage, questionnaires, tickets, and audit records; Entra ID service principals.
- Repository artifacts are primarily Markdown specifications, Copilot Studio YAML, and synthetic CSV datasets.
- No local application runtime, dependency manifest, build system, or automated test runner is documented in `README.md`, `PLAN.md`, or `WORK.md`.