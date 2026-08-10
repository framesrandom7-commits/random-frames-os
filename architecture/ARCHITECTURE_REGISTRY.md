# RANDOM FRAMES OS v1.0 — SYSTEM ARCHITECTURE REGISTRY

================================================================================
ARCHITECTURE STATUS: PERMANENTLY FROZEN & CERTIFIED
================================================================================

This directory contains the physical, authoritative architectural specifications for Random Frames OS v1.0. All code changes, system improvements, and third-party integrations must strictly align with the documented architectural pillars without exception or duplication.

## DIRECTORY CONTENTS

| Document Name | Scope & Description | Status | Certification Score |
| :--- | :--- | :--- | :--- |
| **`GOOGLE_WORKSPACE_ARCHITECTURE.md`** | Complete Phase 6.1 Enterprise Google Workspace Production Integration specification covering Gmail, Calendar, Drive, Contacts, Unified Auth, Workflow Automations, and Preference Engine. | **FROZEN** | 100/100 (17-Point Verified) |
| **`FINANCE_OPERATIONS_ARCHITECTURE.md`** | Complete Phase 6.2 Enterprise Finance & Business Operations module covering Quotations, Invoices, Multi-Bank Accounts, Immutable Financial Ledger, Dynamic GST/Taxation, Project Profitability, and Executive RBAC Dashboards. | **FROZEN** | 100/100 (21-Point Verified) |
| **`REPORTING_ARCHITECTURE.md`** | Complete Phase 6.3 Enterprise Reporting & Business Intelligence module covering KPI Engine, Business Snapshots, Executive Alerts, Productivity Telemetry, 4-Tier Drill-Down Navigation, and Multi-Format Exports. | **FROZEN** | 100/100 (14-Point Verified) |
| **`CLIENT_PORTAL_ARCHITECTURE.md`** | Complete Phase 7.0 Client Portal & External Collaboration Engine covering secure onboarding invitations, magic link authentication, RBAC self-record isolation, deliverable approval workflows, brand asset library, meeting center, extended payment center with QR codes, requirement forms, automated CRM lead creation, executive analytics, and mobile-first PWA architecture. | **FROZEN** | 100/100 (15-Point Verified) |

---

## THE 12 IMMUTABLE PILLARS OF RANDOM FRAMES OS

1. **RBAC (Role-Based Access Control)**: Enforces precise operational permissions across Founder, Co-Founder, Executive, and Crew staff tiers.
2. **Workflow Engine**: Autonomous, asynchronous processing across CRM events (Leads, Projects, Quotations, Invoices, Shoots).
3. **Event Bus**: Distributed, resilient in-memory event streaming via `@/domain/workflow/event-bus`.
4. **Notification Engine**: Multi-channel real-time alerts and toast announcements via `@/domain/integrations/notification-manager`.
5. **Queue Manager**: High-availability asynchronous task execution, offline buffer management, and exponential backoff retry system.
6. **Repository Layer**: Pure database logic encapsulation utilizing Prisma ORM over PostgreSQL.
7. **Domain Services**: Business logic engines translating system workflows into concrete data transformations.
8. **Collaboration Domain**: Client portal synchronization and shared production workflows.
9. **Audit Manager**: Immutable cryptographic transaction and security audit trail.
10. **Activity Manager**: User and automated system action logging via `@/domain/activity/activity-logger`.
11. **Timeline Manager**: Master scheduling coordination across Calendar, Production projects, and delivery targets.
12. **Integration Layer**: Cohesion engine unifying Google Workspace, Meta WhatsApp Business, and Web3Forms under unified security protocols.
