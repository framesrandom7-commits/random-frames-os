# RANDOM FRAMES OS — ORGANIZATION & ROLE ARCHITECTURE SPECIFICATION

**Document Version:** 1.0 (Permanently Frozen)  
**Classification:** Core Architectural Pillar  
**Status:** Certified & Locked

---

## 1. Purpose
This document details the complete Organization and Role Architecture for Random Frames OS. It specifies enterprise role scaling, departmental groupings, login routing behaviors, decoupled entity ownership hierarchies, centralized approval matrices, and UI visibility controls for Version 1 and beyond.

## 2. Responsibilities
* **Organizational Hierarchy Mapping:** Organizes staff into structural departments (`Executive`, `Administration`, `Operations`, `Production`, `Creative`, `Sales`, `Finance`).
* **Decoupled Entity Ownership Model:** Separates administrative record ownership from day-to-day execution assignments across every major business entity:
  * **Lead:** Sales Owner (Default: Co-Founder) & Operations Owner (Default: Co-Founder).
  * **Project:** Creative Owner (Default: Founder), Operations Owner (Default: Co-Founder), Sales Owner, & Finance Owner.
  * **Shoot:** Creative Owner (Default: Founder) & Production Owner (Default: Co-Founder).
  * **Content:** Operations Owner & Creative Approver (Default: Founder).
  * **Invoice:** Finance Owner.
  * **Client:** Relationship Owner.
* **Role-Aware Login Routing:** Evaluates authenticated sessions at login to direct executives and operational managers to tailored workspaces (e.g., directing Founder to Executive KPI overviews and Co-Founder to operational CRM execution dashboards).
* **Centralized Approval Matrix:** Governs when operational user overrides require formal Super Admin sign-offs (e.g., discount rate overrides or project cancellation requests initiated by Co-Founder entering pending approval queues for Founder sign-off).

## 3. Architecture Diagram

```mermaid
graph TD
    subgraph Executive & Administrative Department
        FOUNDER[Founder / Super Admin] -->|Universal Bypass & Creative Owner Default| PROJ_CR[Project / Shoot Creative Owner]
        FOUNDER -->|Sole Approving Authority| APPR[Centralized Approval Matrix]
    end

    subgraph Operations & CRM Department
        CO_FOUNDER[Co-Founder / Ops Lead] -->|Ops & Sales Owner Default| LEADS[Leads / Projects / Shoots Ops]
        CO_FOUNDER -->|Submit Discount Override| APPR
    end

    subgraph Production, Creative & Finance Departments
        PROD[Photographers & Videographers] -->|Assigned Primary / Secondary| SHOOTS[Shoot Work Items]
        EDIT[Editors & Designers] -->|Assigned Reviewer / Collaborator| DELIV[Deliverables & Content]
        FIN[Finance Executive] -->|Finance Owner| INV[Invoices & Payments]
    end
```

## 4. Data Flow
1. **Entity Instantiation:** When creating a Project or Lead via domain services, default ownership rules are strictly evaluated. The system automatically populates `creativeOwnerId` with the Founder account ID and `operationsOwnerId` with the Co-Founder account ID unless explicit overrides are passed.
2. **Task Assignment:** Operational staff (Photographers, Editors) are linked to work items via `MultiAssigneeService.assignUser()`, cleanly separating them from administrative owners.
3. **Approval Execution:** When Co-Founder attempts an action exceeding operational authorization thresholds (like a $5,000+ discount override on a high-value quotation), `ApprovalDomainService` intercepts the write, creates an `ApprovalRequest` record with status `PENDING`, and routes a high-priority notification to Founder. When Founder performs the identical action, Super Admin privileges execute immediate auto-approval (`APPROVED`).

## 5. Dependencies
* **Role Constants:** `frontend/domain/rbac/constants.ts` & `types.ts`
* **Approval Engine:** `frontend/domain/approvals/*`
* **Multi-Assignee & Concurrency Layer:** `frontend/domain/collaboration/*`
* **Bootstrap Accounts:** Seed scripts in `frontend/prisma/seed.ts` (maintaining permanent Founder Super Admin and default operational Co-Founder account `pooja@randomframes.local`).

## 6. Extension Points
* **Enabling Future Roles:** All 16 native roles (`Graphic Designer`, `Content Writer`, `Social Media Manager`, `Business Development`, `Finance Executive`, `Operations Manager`, `Intern`, etc.) are natively configured in domain tables. Activating them during agency expansion simply requires toggling their `isUiVisible` property from `false` to `true`.
* **Expanding Approval Types:** Additional operational authorization boundaries (such as Equipment Purchase requests) can be added to `ApprovalType` enums without rewriting approval matrices.

## 7. Future Scalability
* **Seamless Staff Scaling (2 to 100+ Users):** By separating permanent default entity owners (Founder / Co-Founder) from unbounded dynamic collaborative assignees, Random Frames OS scales to 100+ concurrent agency staff sessions without restructuring database schemas or organizational code.

## 8. Developer Guidelines
* **Respect Version 1 UI Concealment:** Never display employee roles in Version 1 UI user management dropdowns or settings; always derive visible role lists from `RbacDomainService.getUiVisibleRoles()`.
* **Do Not Recreate Founder Account:** Never modify or override the production Founder Super Admin account credentials or database bindings during test seeding or feature deployments.

## 9. Files Involved
* `frontend/domain/rbac/*`: Organizational role configurations and departmental mappings.
* `frontend/domain/approvals/*`: Approval workflow matrices and authorization rules.
* `frontend/domain/collaboration/*`: Decoupled work item assignments.
* `frontend/prisma/seed.ts`: Default account provisioning.

## 10. Known Constraints
* **Sole Approving Authority:** Only the Founder account possesses self-approving privileges for high-tier financial overrides; Co-Founder cannot self-approve restricted items.
* **Two Active Users in Version 1:** Regardless of the underlying 100+ user architectural capacity, only Founder and Co-Founder accounts should be active and exposed in Version 1 production UIs.

## 11. Things That Must Never Be Modified Without Architecture Review
1. **Decoupled Ownership vs. Assignment:** Merging Creative Owner, Operations Owner, and Assignee into a single field is strictly prohibited.
2. **Permanent Founder Authority:** Stripping the Founder account of its status as the sole ultimate approving authority across all business operations is banned.
3. **Version 1 UI Role Filtering:** Bypassing `isUiVisible` to expose hidden future enterprise roles before formal organizational scaling approval is forbidden.
