# NETFIX AI — Backend Architecture & AI Engine Specifications

This document outlines the detailed architecture, security middleware flow, database model relationships, and AI Orchestration loop in the **NETFIX AI Backend**.

---

## 🏛️ Comprehensive Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients ["Client Layer"]
        AdminApp["Admin Portal (Port 3001)"]
        UserApp["User Web App (Port 3000)"]
    end

    subgraph EntryPoint ["Express API Gateway (index.ts)"]
        CorsHelmet["CORS Policy & Helmet Security Headers"]
        Parser["Cookie & Body Parsers"]
    end

    subgraph SecurityMiddleware ["Security & RBAC Enforcement"]
        AuthMid["requireUserAuth / requireAdminAuth"]
        RevocationCheck["Session Revocation Check"]
        RBACEngine["rbacService.verifyAccess()"]
    end

    subgraph BusinessControllers ["Controllers"]
        AuthCtrl["authController"]
        AdminCtrl["adminController"]
        AgentCtrl["agentRoutes Handler"]
        DomainCtrl["domainIntelligenceController"]
    end

    subgraph AIOrchestrator ["Ultron AI Engine (ultronOrchestrator.ts)"]
        Classifier["Task Classifier & Router"]
        BundleBuilder["RBAC Context Bundle Builder"]
        AgentExec["Agent Executor (13 Agents)"]
        GeminiService["geminiService (Gemini 1.5 Flash / Pro)"]
        RAGService["ragService (Cosine Embedding Search)"]
        VerificationPass["Self-Correction Verification Loop"]
        HumanReviewGate["Human-in-the-Loop Review Gate"]
        RoleOutputFilter["Role-Based Response Filter"]
    end

    subgraph DataStorage ["Data & Audit Layer"]
        SupabaseDB[("Supabase / Postgres Database")]
        AuditLogger["auditService (Immutable Log)"]
        PDFGenerator["pdfGeneratorService (PDFKit)"]
    end

    AdminApp --> CorsHelmet
    UserApp --> CorsHelmet
    CorsHelmet --> Parser
    Parser --> AuthMid
    AuthMid --> RevocationCheck
    RevocationCheck --> RBACEngine
    RBACEngine --> BusinessControllers

    AgentCtrl --> Classifier
    Classifier --> BundleBuilder
    BundleBuilder --> AgentExec
    AgentExec --> GeminiService
    AgentExec --> RAGService
    AgentExec --> VerificationPass
    VerificationPass --> HumanReviewGate
    HumanReviewGate --> RoleOutputFilter
    RoleOutputFilter --> PDFGenerator

    BusinessControllers --> SupabaseDB
    BusinessControllers --> AuditLogger
    UltronOrchestrator --> AuditLogger
```

---

## 🔑 Request & Response Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Staff
    participant Gateway as Express API Gateway
    participant Auth as Auth & RBAC Middleware
    participant Agent as Agent Route Handler
    participant Ultron as UltronOrchestrator
    participant Gemini as Gemini AI Service
    participant DB as Supabase DB / Audit

    User->>Gateway: POST /api/agent/tax-intelligence (with Cookie/Bearer)
    Gateway->>Auth: Verify JWT & Check Revocation Status
    Auth->>Auth: rbacService.verifyAccess(user, 'case', caseId, 'read')
    
    alt Unauthorized Access
        Auth-->>User: 403 Forbidden (Audit log recorded)
    end

    Auth->>Agent: Route Authorized
    Agent->>Ultron: orchestrate({ taskDescription, agentKey: 'tax_intelligence', caseId })
    Ultron->>Ultron: buildContextBundle(user, caseId, documentId)
    Ultron->>Gemini: call({ agentKey: 'tax_intelligence', modelTier: 'PRO', prompt })
    
    alt Gemini Success
        Gemini-->>Ultron: Return JSON Result + ai_source: 'ai'
    else Rate Limited / API Error
        Gemini-->>Ultron: Return ai_source: 'rule_based_fallback'
    end

    Ultron->>Ultron: runVerificationPass(result)
    
    alt Verification Pass
        Ultron->>Ultron: Filter output by user.role
    else Verification Fail (Attempts <= 3)
        Ultron->>Gemini: Re-invoke with corrective feedback
    end

    Ultron->>DB: Save Task Record & Audit Event
    Ultron-->>Agent: Return OrchestrateResult & PDF Download Link
    Agent-->>User: 200 OK Response Payload
```

---

## 🗄️ Database Schema ERD

```mermaid
erDiagram
    USERS ||--o{ CASES : manages
    USERS ||--o{ DOCUMENTS : owns
    USERS ||--o{ AGENT_TASKS : initiates
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ MFA_SECRETS : authenticates

    CASES ||--o{ DOCUMENTS : contains
    CASES ||--o{ AGENT_TASKS : references

    AGENT_TASKS ||--o| GENERATED_REPORTS : produces

    USERS {
        uuid id PK
        string email
        string password_hash
        string role
        string status
        string tenant_id
        timestamp created_at
    }

    CASES {
        string id PK
        string title
        string client_id
        string assigned_employee_id
        string tenant_id
        string status
        string priority
    }

    DOCUMENTS {
        string id PK
        string name
        string case_id FK
        string owner_user_id FK
        string tenant_id
        boolean is_confidential
    }

    AGENT_TASKS {
        string id PK
        string user_id FK
        string case_id FK
        string agent_key
        string status
        string ai_source
        string human_review_status
    }

    AUDIT_LOGS {
        uuid id PK
        string actor_name
        string resource
        string event_type
        jsonb metadata
        timestamp created_at
    }
```
