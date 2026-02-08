# CIA-259: Visual Feedback Loop — PM-Dev Workflow Integration

## Where the Visual Loop Fits

```mermaid
flowchart LR
    subgraph Ideation ["Stage 1: Ideation"]
        S1[Cowork / Voice memo]
    end

    subgraph Analytics ["Stage 2: Analytics"]
        S2[Evidence gathering]
    end

    subgraph Spec ["Stage 3: PR/FAQ + Spec"]
        S3[Spec draft]
        S3a{Approval<br/>Gate 1}
    end

    subgraph Review ["Stage 4: Adversarial Review"]
        S4[Multi-LLM review]
        S4a{Approval<br/>Gate 2}
    end

    subgraph Visual ["Stage 5: Visual Prototype ★"]
        direction TB
        S5[v0 generate]
        S5a[Adapt D7]
    end

    subgraph Impl ["Stage 6: Implementation ★"]
        S6[Claude Code<br/>business logic]
    end

    subgraph Verify ["Stage 7: Verification ★"]
        direction TB
        S7[Chrome capture]
        S7a[Multimodal analysis]
        S7b{Human<br/>review}
    end

    subgraph Deploy ["Stage 8: Async Handoff"]
        S8[Merge + Deploy]
        S8a{Approval<br/>Gate 3}
    end

    S1 --> S2 --> S3 --> S3a
    S3a -->|Approved| S4 --> S4a
    S4a -->|Approved| S5

    S5 --> S5a --> S6 --> S7 --> S7a --> S7b

    S7b -->|"Visual issue"| S5
    S7b -->|"Logic issue"| S6
    S7b -->|Approved| S8 --> S8a

    style Visual fill:#1e293b,stroke:#3b82f6,stroke-width:3,color:#fff
    style Impl fill:#1e293b,stroke:#3b82f6,stroke-width:3,color:#fff
    style Verify fill:#1e293b,stroke:#3b82f6,stroke-width:3,color:#fff
    style S3a fill:#f59e0b,stroke:#d97706,color:#0f172a
    style S4a fill:#f59e0b,stroke:#d97706,color:#0f172a
    style S7b fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style S8a fill:#f59e0b,stroke:#d97706,color:#0f172a
```

**★ Stages 5-7 form the Visual Feedback Loop sub-cycle defined by CIA-259.**

## Tool Mapping by Stage

```mermaid
flowchart TD
    subgraph Tools ["Tool Ownership"]
        direction LR

        subgraph V0 ["v0 MCP"]
            T1[generate_component]
            T2[iterate_component]
            T3[get_rate_limits]
        end

        subgraph Claude ["Claude Code"]
            T4[Adapt patterns D7]
            T5[Write files]
            T6[Git push]
            T7[Logic implementation]
        end

        subgraph Chrome ["Chrome MCP"]
            T8[browser_open]
            T9[browser_screenshot]
            T10[browser_snapshot]
            T11[browser_eval]
        end

        subgraph GitHub ["GitHub MCP"]
            T12[PR comments]
            T13[PR review]
            T14[Merge]
        end

        subgraph Vercel ["Vercel"]
            T15[Preview deploy]
            T16[Build logs]
        end
    end

    style V0 fill:#0f172a,stroke:#8b5cf6,color:#e2e8f0
    style Claude fill:#0f172a,stroke:#3b82f6,color:#e2e8f0
    style Chrome fill:#0f172a,stroke:#22c55e,color:#e2e8f0
    style GitHub fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
    style Vercel fill:#0f172a,stroke:#ef4444,color:#e2e8f0
```

## Decision Routing Detail

```mermaid
flowchart TD
    Feedback["Human Feedback"] --> Classify{Classify<br/>feedback type}

    Classify -->|"Layout, colour, spacing,<br/>typography, visual hierarchy"| VisualRoute
    Classify -->|"State, API, data flow,<br/>validation, business rules"| LogicRoute
    Classify -->|"ARIA, keyboard nav,<br/>screen reader, contrast"| A11yRoute
    Classify -->|"Looks good, ship it"| ApproveRoute

    subgraph VisualRoute ["Visual Route"]
        VR1["v0 iterate_component<br/>(maintains chat context)"]
        VR2["Re-adapt D7"]
        VR3["Push → new preview"]
    end

    subgraph LogicRoute ["Logic Route"]
        LR1["Claude Code edits<br/>(direct file modification)"]
        LR2["Push → new preview"]
    end

    subgraph A11yRoute ["Accessibility Route"]
        AR1{Structural<br/>or visual?}
        AR1 -->|"Structural (ARIA, semantics)"| LR1
        AR1 -->|"Visual (contrast, sizing)"| VR1
    end

    subgraph ApproveRoute ["Approve"]
        AP1["Merge PR"]
        AP2["Update Linear: spec:complete"]
    end

    VR1 --> VR2 --> VR3
    LR1 --> LR2

    style Classify fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style AP1 fill:#22c55e,stroke:#16a34a,color:#0f172a
    style AR1 fill:#f59e0b,stroke:#d97706,color:#0f172a
```

## Entry Criteria Guard

```mermaid
flowchart TD
    Spec[Approved Spec] --> Check{Has UI<br/>requirements?}

    Check -->|Yes| VFL["Enter Visual Feedback Loop<br/>(Stages 5-7)"]
    Check -->|No| Skip["Skip to Stage 6<br/>(direct implementation)"]

    VFL --> Stage5["Stage 5: v0 + Adapt"]
    Skip --> Stage6Direct["Stage 6: Claude Code only"]

    Stage5 --> Stage6["Stage 6: Business logic"]
    Stage6 --> Stage7["Stage 7: Chrome capture + analysis"]

    Stage6Direct --> Stage7b["Stage 7: Standard verification<br/>(tests, type-check, lint)"]

    style Check fill:#f59e0b,stroke:#d97706,color:#0f172a
    style VFL fill:#3b82f6,stroke:#2563eb,color:#fff
    style Skip fill:#475569,stroke:#334155,color:#fff
```
