# Phase 6.4 Website & CRM Automation Architecture

## 1. Overview
The Website Automation module completely eliminates manual data entry and bridges the gap between public client intake and internal Business Operating System workflows. By leveraging the existing EventBus architecture, we ensure zero code duplication while maintaining strict separation of concerns.

## 2. Core Components

### 2.1 Unified Forms Controller
**Path:** `frontend/app/api/website/forms/route.ts`
A single API endpoint handles all website submissions (Contact, Booking, Quote, Requirements). It performs security validation and offloads the data to the `WebsiteLeadIntakeService`.

### 2.2 Website Lead Intake Service
**Path:** `frontend/domain/website/website-lead-intake.ts`
Responsible for processing the raw form data, enforcing basic data hygiene, detecting duplicates, and publishing `WEBSITE_ENQUIRY_RECEIVED` events to the core Event Bus.

### 2.3 Website Workflow Handlers
**Path:** `frontend/domain/website/website-workflow-handlers.ts`
Listens for intake events and orchestrates the CRM response:
- Automatically synthesizes `Lead` records in Prisma.
- Uses `ClientTelemetryAdapter` (which aliases `PortalEventBus`, `AuditLogger`, etc.) to log timeline activities.
- Checks Google Calendar for availability on booking requests.
- Triggers notifications to the production team.

### 2.4 Website Analytics Engine
**Path:** `frontend/domain/website/website-analytics-engine.ts`
Records page views and conversion interactions internally, pushing this telemetry into the Event Bus where the Reporting Engine will aggregate it.

## 3. Architecture Alignment
- **No Database Duplication**: `WebsiteWorkflowHandlers` utilizes the existing `prisma.lead` model.
- **Workflow Decoupling**: The website is purely an event producer; it has no direct dependencies on CRM logic.
- **Security Validation**: All inputs are sanitized before entering the domain layer.

## 4. Frontend Application Structure
The Next.js `app/(website)` directory houses all static and dynamic public pages. 
- The root `page.tsx` was restored to point to the website. 
- Form submissions are routed via `fetch` to `/api/website/forms`.

## 5. Certification Status
- **Runtime Integrity:** Tested via `test-website-runtime.ts` (15-point check passed).
- **SEO Optimization:** Implemented `sitemap.ts`, `robots.ts`, and JSON-LD schema metadata.
