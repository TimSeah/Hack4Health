# End-to-End Patient Process — Flowcharts

Visualizes the current (as-is) clinic registration process from [1. Technical Problem Statement.md](../ProblemStatement/1.%20Technical%20Problem%20Statement.md) and the proposed (to-be) flow using the `ClinicPrep Assistant` agent from [PLAN.md](PLAN.md).

## 1. As-Is Process (Current, Manual)

Red nodes = duplicate/paper-based pain points. Yellow nodes = administrative work that happens sequentially at the registration counter.

```mermaid
flowchart TD
    S1["Step 1 — Patient Arrives & Waits<br/>Variable, compounds"] --> S2
    S2["Step 2 — Identity Verification<br/>~1 min"] --> S3
    S3["Step 3 — Patient Registration<br/>~2-3 min<br/>(name, NRIC, DOB, address, contact typed by hand)"] --> S4
    S4["Step 4 — Document Interpretation<br/>~3-5 min"] --> S4a
    S4 --> S5
    S4a["If TPA patient: staff also writes<br/>attendance on a separate paper TPA form"]
    S5["Step 5 — Eligibility Check<br/>~3-5 min<br/>(CHAS / corporate insurance)"] --> S6
    S6["Step 6 — Screening Package Verification<br/>~2-4 min (checkup visits only)"] --> S6a
    S6 --> S7
    S6a["Patient fills 2 on-site forms:<br/>General / Occupational Health consent form<br/>(re-asks name, NRIC, DOB, contact, address)"]
    S7["Step 7 — Billing Determination<br/>~2 min"] --> S8
    S8["Step 8 — Queue Number Issued<br/>~1 min"] --> S9
    S9["Step 9 — Wait in Queue<br/>Variable, compounds"] --> S10
    S10["Step 10 — Consultation or Screening<br/>10-20 min"] --> S11
    S11["Step 11 — Medication Dispensed<br/>~2-3 min (pharmacist re-asks allergies)"] --> S12
    S12["Step 12 — Payment<br/>~5-8 min"] --> S12a
    S12a["If under insurance: staff logs into TPA<br/>portal to manually re-enter dispensed/checkup info"]

    classDef painPoint fill:#ffe0e0,stroke:#c0392b,stroke-width:1px;
    class S4a,S6a,S12a painPoint;
    classDef adminHeavy fill:#fff3cd,stroke:#b8860b,stroke-width:1px;
    class S3,S4,S5,S6,S7,S12 adminHeavy;
```

**Admin time per patient: ~23–32 minutes**, excluding the clinical visit itself (see Technical Problem Statement).

## 2. To-Be Process (With ClinicPrep Assistant)

Green = automated before the patient reaches the counter. Blue = must stay manual/in-person (identity + e-card verification are never automated).

```mermaid
flowchart TD
    subgraph PRE["Before Arrival — Automated (ClinicPrep Assistant)"]
        direction TB
        P1["Patient starts chat<br/>(web link / kiosk / Teams)"] --> P2{"Has a referral letter,<br/>voucher, or e-card?"}
        P2 -->|Yes| P3["Upload / paste document"]
        P2 -->|No / self-pay| P4["Provide basic details"]
        P3 --> P5["Document Parsing Action:<br/>extract company/TPA code, policy no.,<br/>requested package"]
        P5 --> P6
        P4 --> P6["Patient Lookup Action:<br/>pre-fill registration from existing record"]
        P6 --> P7["Eligibility & Package Matching Action"]
        P7 --> P8["Consent Questionnaire Pre-fill<br/>(General / Occupational Health)"]
        P8 --> P9["Billing Estimate Action"]
        P9 --> P10["Handoff Summary + Queue Ticket generated<br/>(status: Pending Verification)"]
    end

    P10 --> A1

    subgraph CLINIC["At Clinic — In-Person (Staff)"]
        direction TB
        A1["Patient arrives, shows queue ticket"] --> A2["Identity Verification<br/>(NRIC/FIN/Passport) — IN PERSON, MANUAL"]
        A2 --> A3["e-Card / Insurance Card Validation — IN PERSON, MANUAL"]
        A3 --> A4{"Pre-filled summary<br/>matches in-person check?"}
        A4 -->|Yes| A5["Staff confirms registration,<br/>package & billing"]
        A4 -->|No / mismatch| A6["Escalate for manual correction"]
        A5 --> A7["Queue for Consultation / Screening"]
        A6 --> A7
        A7 --> A8["Consultation or Screening"]
        A8 --> A9["Medication Dispensed"]
        A9 --> A10["Payment<br/>(pre-computed billing, minimal re-work)"]
    end

    classDef automated fill:#e0f7e9,stroke:#2e7d32,stroke-width:1px;
    class P1,P2,P3,P4,P5,P6,P7,P8,P9,P10 automated;
    classDef manual fill:#e0ecff,stroke:#1a5fb4,stroke-width:1px;
    class A2,A3 manual;
```

## 3. Sequence Diagram — Pre-Registration Interaction

Shows how the agent, its actions, Dataverse, and staff interact (maps to the topics/actions defined in [PLAN.md](PLAN.md)).

```mermaid
sequenceDiagram
    actor Patient
    participant Bot as ClinicPrep Assistant
    participant Doc as Document Parsing Action
    participant PL as Patient Lookup Action
    participant EL as Eligibility Lookup Action
    participant BC as Billing Calculation Action
    participant DB as Dataverse (Patients / CoverageRules / VisitTickets)
    actor Staff

    Patient->>Bot: Start chat, select visit type
    alt Has referral / voucher / e-card
        Patient->>Bot: Upload document
        Bot->>Doc: Parse document
        Doc-->>Bot: company/TPA code, policy no., package, confidence score
    else No document / self-pay
        Patient->>Bot: Provide basic details
    end
    Bot->>PL: Look up patient by ID
    PL->>DB: Query Patients table
    DB-->>PL: Existing record (or not found)
    PL-->>Bot: Pre-filled registration fields
    Bot->>Patient: Confirm / complete missing fields
    Bot->>EL: Match eligibility & package
    EL->>DB: Query CoverageRules table
    DB-->>EL: Matched package + coverage rule
    EL-->>Bot: Package match (or escalate flag)
    Bot->>Patient: Pre-fill consent questionnaire, ask for confirmation
    Bot->>BC: Calculate billing estimate
    BC-->>Bot: Covered / payable amount
    Bot->>DB: Create VisitTicket (status: Pending Verification)
    Bot->>Patient: Show summary + queue ticket
    Patient->>Staff: Arrive, present ticket
    Staff->>Patient: Verify identity (NRIC/FIN/Passport) — in person
    Staff->>Patient: Validate e-card / insurance card — in person
    Staff->>DB: Confirm VisitTicket (status: Verified)
    Staff->>Patient: Proceed to queue
```

## 4. Time Impact Summary

| Stage | As-Is | To-Be |
| --- | --- | --- |
| Registration + document interpretation + eligibility + package verification + billing | ~10–19 min at the counter | Done before arrival via chat; staff only confirms |
| TPA dual paper record | Extra manual write-up (step 4) | Eliminated — captured once digitally |
| Consent questionnaires (General/Occupational Health) | Filled on-site, re-asking known details | Pre-filled before arrival, patient just confirms |
| Post-visit TPA portal re-entry | ~5–8 min manual re-entry (step 12) | Same data reused from `VisitTicket`, no re-typing |
| Identity + e-card verification | ~1 min, manual | Unchanged — stays manual, in person (by design constraint) |

See [README.md](../README.md) for the full Technical Track requirements and [PLAN.md](PLAN.md) for the agent configuration that implements this flow.
