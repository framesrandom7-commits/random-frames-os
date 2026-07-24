# Phase 6 Overview
**Objective:** Transition Random Frames OS from a collection of interconnected modules into a true event-driven operating system.
**Scope:** Implementing a centralized Event Bus, Workflow Engine, Background Job Queue, Notification Engine, Audit Logs, and Activity Timelines.
**Key achievements:**
- Complete decoupling of major system components (CRM, Storage, Shoots).
- Successful deployment of a robust Publish/Subscribe `EventBus`.
- Integration of a `JobQueue` backed by PostgreSQL for retrying and tracking background tasks (such as Google Drive automation).
- Centralized `AuditLog` that seamlessly tracks actions directly from the `EventBus`.
- New `/workflow` dashboard providing deep insights into system automation health.

# Architecture
```markdown
[Client/Project/Shoot Modules] -> (Publish Event)
       |
       v
   [Event Bus] ---> [Audit Logger] (Auto-Logs)
       |
       v
[Workflow Engine]
       |
       v
[Workflow Handlers (Storage, Timeline, etc)]
       |
       v
[Background Job Queue] -> [External APIs (Google Drive)]
       |
       v
[Notification Engine]
```

**Component responsibilities:**
- **Event Bus:** Acts as the central nervous system, receiving strongly-typed events and distributing them to registered handlers.
- **Workflow Engine:** Initializes handlers at startup and ensures separation of concerns.
- **Workflow Handlers:** Domain-specific modules (like `storage-handler.ts`) that react to generic events (like `PROJECT_CREATED`).
- **Job Queue:** Handles long-running or failure-prone tasks (Drive API) out-of-band to keep UI responsive.
- **Notification Engine & Audit Log:** Ensure persistent tracking and user visibility.

# Folder Structure
**New folders created:**
- `lib/workflow/`
- `lib/workflow/handlers/`
- `lib/jobs/`
- `lib/notifications/`
- `lib/audit/`
- `app/(dashboard)/workflow/`

**New files added:**
- `events.ts`, `event-bus.ts`, `workflow-engine.ts`
- `storage-handler.ts`, `timeline-handler.ts`
- `JobQueue.ts`, `notification-engine.ts`, `audit-logger.ts`
- `app/(dashboard)/workflow/page.tsx`

**Modified files:**
- `prisma/schema.prisma` (Added `BackgroundJob`, `AuditLog`, updated `Notification`)
- `app/actions/client.ts`
- `app/actions/project.ts`
- `app/actions/shoot.ts`
- `lib/storage/automation.ts`

# Database Changes
- **`BackgroundJob` Model:** Tracks `type`, `payload`, `status` (QUEUED, RUNNING, COMPLETED, FAILED, RETRYING), `progress`, `error`, `retryCount`.
- **`AuditLog` Model:** Tracks `action`, `module`, `entityId`, `entityType`, `userId`, `metadata`.
- **`Notification` Updates:** Added `SYSTEM`, `STORAGE`, `WORKFLOW`, `SUCCESS`, `INFO`, `WARNING`, `ERROR` to types. Added `isRead` and `actionUrl`.

# Event Bus
**Design:** Singleton Service implementing a basic Pub/Sub architecture.
**Publish/Subscribe mechanism:** Fully typed using `WorkflowEvent` and `WorkflowEventPayloads`. 
**Event lifecycle:** 
1. `publish()` is called non-blockingly.
2. Intercepted automatically by `auditLogEvent`.
3. Handlers execute concurrently using `Promise.allSettled` to isolate failures.

# Workflow Engine
**Internal architecture:** Registration broker.
**Execution flow:** Bootstraps on load, linking `EventBus` to domain-specific `handlers/`.
**Error handling:** Fails soft on individual handler crashes, protecting the core thread.

# Workflow Handlers
- `storage-handler.ts`: Listens to `CLIENT_CREATED`, `PROJECT_CREATED`, `SHOOT_SCHEDULED`, and `FOLDER_CREATED`. Maps them to JobQueue tasks.
- `timeline-handler.ts`: Automates creating `Activity` timeline objects without direct intervention in UI actions.

# Background Job System
**Queue architecture:** Simple Prisma-backed queue. `JobQueue.processNext(type)` picks oldest queued item.
**Job lifecycle:** `QUEUED` -> `RUNNING` -> `COMPLETED` / `FAILED` / `RETRYING`.
**Retry behavior:** Backoff mechanism using `setTimeout(..., 5000 * retryCount)` up to 3 times before failing permanently.

# Notification Engine
**Notification types:** `SYSTEM`, `STORAGE`, `SUCCESS`, `ERROR`, etc.
**UI integration:** Added `actionUrl` for quick navigation on click.

# Activity Timeline
**Event generation:** Handled transparently by `timeline-handler.ts`.
**Timeline rendering:** Rendered natively via existing timeline components, completely decoupled from Server Actions.

# Audit Log
**Logged actions:** Captures *every* event published through `EventBus.publish()`.
**Metadata structure:** Uses PostgreSQL `Json?` to store the exact `payload` of the event.

# Workflow Dashboard
**Dashboard components:** `/workflow`
**Live metrics:** Success Rate, Active Jobs, Queued Jobs, Failed Jobs.
**Health indicators:** Visually flags failing jobs and logs events chronologically.

# Integration Points
- **CRM / Projects / Shoots:** Replaced direct `createProjectStorageFolders()` and `logActivity()` calls with `EventBus.publish()`.
- **Storage / Google Drive:** Moved entirely into background queues.

# Testing & Validation
**TypeScript verification:** 100% strongly typed payloads for Event Bus. Next.js build passes.
**ESLint verification:** 100% passing.
**Build verification:** `next build` executed successfully without errors.

# Performance Considerations
- All expensive tasks (Storage sync, Drive API) are now decoupled and run asynchronously. User latency for `createProject` is now minimal.
- Simple timeout-based Background Job runner is used. For multi-instance scaling, we would move `JobQueue` to BullMQ/Redis.

# Known Limitations
- The Prisma-based Job Queue processor (`setTimeout` driven) is an in-memory trigger and relies on Node.js lifecycle. If the Vercel/Next serverless function terminates, the queue processor sleeps until explicitly called again. For full production durability, a cron or BullMQ is recommended.

# Next Phase Recommendations
- Migrate the `JobQueue` loop to a proper CRON endpoint (`/api/cron/process-jobs`) if deploying on Vercel, to guarantee Queue flushing.
- Move towards Finance and Business Operations (Phase 7), leveraging the new Workflow Engine for automated Invoice tracking.
