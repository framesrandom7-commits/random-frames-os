# Random Frames OS - Implementation Plan

This roadmap tracks the development of modules based on `BUSINESS_RULES.md`.
A module is not complete until UI, Backend, Database, Validation, Automations, Timeline, Search, Filters, PDFs, WhatsApp, Email, Notifications, and QA are fully production-ready.

## Currently Active Module
**Universal Timeline & Dashboards** (Next step based on previous completion of Finance, Shoots, and Reports).

## Module Roadmap

### [x] 1. Lead Management & Webhooks
- Strict status pipeline (`NEW` to `CONVERTED_TO_CLIENT`).
- Web3Forms webhook integration.

### [x] 2. Client Onboarding & Form Automation
- Automated Resend emails on `QUOTATION_ACCEPTED`.
- Atomic transaction wizard (Client -> Project -> Shoot -> Invoice).

### [x] 3. Finance Module (Invoices, Payments, Expenses)
- Required `projectId` linking for all financials.
- Auto-calculating `profitAmount`, `balanceAmount`, and `paymentStatus`.

### [x] 4. Shoot Operations Module
- Pre-shoot logistics (requirements, weather, crew).
- Post-shoot tracking (editing, delivery, approval statuses).
- Automated project dependency syncing.

### [x] 5. Reports & Analytics
- Live dashboard metrics (Revenue, Profit, Leads, Projects).
- Recharts visualizations matching real DB stats.

### [x] 6. Universal Timeline & Activity Logging
- Centralized tracking for transitions across all modules.

### [ ] 7. WhatsApp Integration
- One-click strict templates (First Response, Quotation, Booking, Payment).

### [ ] 8. PDF Generation
- Professional non-placeholder PDF rendering for Invoices and Quotations.

### [ ] 9. Final Quality Assurance
- End-to-end testing of every workflow step.

### [ ] 10. End-to-End Workflow Certification
- Full manual walkthrough strictly following: Website Lead -> Lead Management -> Quotation -> Negotiation -> Client Form -> Client Creation -> Project Creation -> Shoot Scheduling -> Expense Entry -> Invoice -> Payment -> Profit Calculation -> Project Completion.
