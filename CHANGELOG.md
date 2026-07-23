# Random Frames OS - Changelog

All completed changes, bug fixes, workflow improvements, and database migrations are documented here.

## [v1.0.0-alpha] - Core Workflow Engine
- **Database:** Migrated to strict enums (`LeadStatus`, `ShootDeliveryStatus`, etc.). Required `projectId` on all financials. Added `profitAmount` to Project.
- **Leads:** Implemented Web3Forms webhook and automated Resend email triggers on `QUOTATION_ACCEPTED`.
- **Clients:** Built atomic Onboarding Wizard connecting Client -> Project -> Shoot -> Invoice seamlessly.
- **Shoots:** Expanded Shoot model to track Pre-Shoot Planning (logistics, crew, requirements) and Post-Shoot Delivery (editing, delivery, approval statuses).
- **Finance:** Built `syncProjectFinancials` to dynamically calculate Balance, Status, and Profit across Invoices, Payments, and Expenses.
- **Projects:** Added `completeProject` automated verification to ensure zero balance and completed shoots before closure.
- **Reports:** Integrated live, auto-generated analytical logic for Dashboard and Reports pages using Recharts.

## [v1.0.0-rc1] - Documentation Initialization
- Initialized `BUSINESS_RULES.md`, `IMPLEMENTATION_PLAN.md`, `TEST_CASES.md`, and `CHANGELOG.md` in the project root to enforce strict production development guidelines.
