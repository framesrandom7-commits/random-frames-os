# RANDOM FRAMES OS — FILE STRUCTURE & REPOSITORY SPECIFICATION

**Document Version:** 1.0 (Permanently Frozen)  
**Classification:** Core Architectural Pillar  
**Status:** Certified & Locked

---

## 1. Purpose
This document specifies the standardized directory hierarchy and repository organization of Random Frames OS. It enforces separation of concerns across application presentation, server mutation boundaries, core domain business logic, integration queues, and database persistence layers.

## 2. Responsibilities & Core Directory Breakdown
* `/architecture/`: Contains all permanently frozen system architectural specifications, diagrams, governance policies, and certification reports.
* `/frontend/app/`: Governs the Next.js App Router presentation architecture:
  * `/app/(dashboard)/*`: Role-aware UI dashboard layouts, module pages (`leads`, `clients`, `projects`, `shoots`, `finance`, `content`, `storage`, `calendar`, `settings`).
  * `/app/actions/*`: Next.js Server Actions acting as exclusive bridges between React client interactions and underlying domain logic.
  * `/app/api/*`: REST Route Handlers processing webhooks, OAuth authentication callbacks, scheduled cron queue harvesters, and PDF document streaming routes.
* `/frontend/components/`: Pure React Client UI representation layers grouped by functional module (`leads/`, `clients/`, `shoots/`, `finance/`, `notifications/`, `shared/`). Zero database coupling or business calculation logic is permitted here.
* `/frontend/domain/`: The single source of truth for all enterprise business calculations, permissions, and collaboration rules:
  * `/domain/services/*`: Core Domain logic (`LeadService`, `ProjectService`, `FinanceService`, etc.).
  * `/domain/collaboration/*`: Optimistic Concurrency Engine, Multi-Assignee Service, Live Presence, and Versioning Snapshot History engines.
  * `/domain/rbac/*`: Role authorization engine, permissions tables, and departmental boundaries.
  * `/domain/approvals/*`: Executive oversight matrices and discount override processing.
  * `/domain/integrations/*`: Queue Manager, Notification Manager, and automatic retry workers.
  * `/domain/repositories/*`: Database database persistence layer insulating domain services from ORM implementations.
* `/frontend/lib/`: Low-level system utilities, database client initialization (`prisma.ts`), application logging, and the decentralized Workflow Event Bus (`lib/workflow/*`).
* `/frontend/prisma/`: Relational Database Schema definition (`schema.prisma`) and account bootstrapping scripts (`seed.ts`).

## 3. Architecture Diagram

```mermaid
graph TD
    ROOT[Root /random-frames-os] --> ARCH[/architecture : Frozen Specifications & Governance]
    ROOT --> FE[/frontend : Application Workspace Root]
    
    FE --> APP[/app : Next.js App Router & Server Actions & API Routes]
    FE --> COMP[/components : Pure React Client Presentation UI]
    FE --> DOM[/domain : 100% Core Business Logic & Collaboration Engine]
    FE --> LIB[/lib : Prisma Singleton, Logger & Workflow Event Bus]
    FE --> PRIS[/prisma : Database Schema.prisma & Seed Scripts]

    APP -->|Calls| DOM
    APP -->|Renders| COMP
    DOM -->|Persists Via| LIB
```

## 4. Data Flow
1. **Module Import Path Verification:** Code in `/components/*` may strictly import presentation types from `"@prisma/client"` and server actions from `/app/actions/*`. It must never import from `/lib/prisma` or `/domain/repositories/*`.
2. **Action Translation:** Files inside `/app/actions/*` import and invoke business methods residing solely inside `/domain/*`.
3. **Domain Execution:** Code in `/domain/*` references models defined in `/prisma/schema.prisma` and persists data by calling Repository abstractions or `/lib/prisma`.

## 5. Dependencies
* **Workspace Resolution:** Configured via TypeScript path mapping (`@/*` -> `/frontend/*` in `tsconfig.json`).
* **Package Management:** NPM workspace structure running under standard macOS server filesystem configurations.

## 6. Extension Points
* **Adding New Feature Folders:** New domain concepts (such as an Inventory or HR system) must instantiate dedicated subdirectories under `/frontend/domain/<feature>/`, housing isolated `types.ts`, `service.ts`, and repository helpers.
* **UI Module Expansions:** Additional user views should be added as clean page routes under `/app/(dashboard)/<module>/` accompanied by isolated presentational components in `/components/<module>/`.

## 7. Future Scalability
* **Modular Domain Growth:** By segregating 100% of business domain logic into `/domain/*`, the repository supports scaling from a localized mono-app into enterprise micro-service deployments simply by detaching `/domain/` sub-directories into standalone worker services without rewriting presentation UI code.

## 8. Developer Guidelines
* **No Stray File Spaced Out of Place:** Never drop scratch test scripts or temporary JSON dumps into production UI directories; store tests cleanly in dedicated scratch or test folders.
* **Strict Barrel Indexing:** Maintain clear imports and avoid circular dependency loops between `/domain/` services and `/lib/workflow/` event handlers.

## 9. Files Involved
* Whole system workspace tree under `/Users/savansomaiahtp/Documents/random-frames-os/`.

## 10. Known Constraints
* **Singleton Prisma Binding:** Only `/frontend/lib/prisma.ts` is authorized to invoke `new PrismaClient()` to prevent database connection exhaustion in serverless runtimes.

## 11. Things That Must Never Be Modified Without Architecture Review
1. **Directory Responsibility Boundaries:** Moving business calculation logic out of `/domain/` into React UI folders (`/components/` or `/app/`) is strictly prohibited.
2. **Root Architecture Reference Folder:** The contents of `/architecture` represent permanent foundation documents and must not be altered without formal architectural review approval.
