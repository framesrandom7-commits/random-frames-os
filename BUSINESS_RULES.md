# Random Frames OS - Business Rules

This document is the permanent source of truth for Random Frames OS. Every module, automation, database change, workflow, UI, relation, and business logic MUST follow this document.

## CORE BUSINESS LIFECYCLE

The entire application must follow this lifecycle:

Lead
↓
Client
↓
Project
↓
Shoot
↓
Deliverables
↓
Client Review / Approval
↓
Invoice
↓
Payments
↓
Expenses
↓
Profit Calculation
↓
Reports
↓
Dashboard
↓
Project Archived

This lifecycle is mandatory. Every module must integrate with this workflow. No module should function independently.

## 1. LEAD WORKFLOW

A Lead represents a potential customer. Every enquiry enters ONLY through Leads.

**Possible Sources:** Website (Web3Forms), Instagram, WhatsApp, Phone Call, Referral, Walk-in, Manual Entry, Cold Call, Email.

**Lead Data Tracking:**
- Notes
- Interactions
- Follow-ups
- Attachments
- Source
- Priority

**Strict Status Flow:**
1. `NEW` (Enquiry received)
2. `ATTENDED` (I review and contact the customer)
3. `REQUIREMENT_DISCUSSION` (Discuss requirements via WhatsApp/Phone)
4. `QUOTATION_SENT` (Send formal quotation)
5. `NEGOTIATION` (Discuss pricing/deliverables)
6. `QUOTATION_ACCEPTED` (Customer agrees to terms)
7. `CLIENT_FORM_SENT` (System automatically sends Client Information Form via Resend)
8. `CLIENT_FORM_RECEIVED` (Customer submits the form)
9. `CONVERTED_TO_CLIENT` (Lead is converted to a formal Client)

*(Alternative branch: `CLOSED_LOST` at any stage if the lead falls through)*

During conversion, all relevant data must be preserved.

## 2. CLIENT ONBOARDING WORKFLOW

Every Client originates from either a converted Lead or a manually created Client.

- Triggered after Lead reaches `QUOTATION_ACCEPTED`.
- System emails a secure form link to the client.
- Form collects: Name, Business Name, Phone, Email, GST, Address, Instagram, Website.
- Submission updates lead to `CLIENT_FORM_RECEIVED`.
- Studio manager converts Lead via "Client Onboarding Wizard", which natively and atomically creates: Client -> Project -> Shoot -> Revenue.
- **Ensure rollback protection exists if any step fails.**

A Client may own one or more Projects. Client history should include Previous Projects, Shoots, Invoices, Payments, Timeline, and Notes.

## 3. PROJECT WORKFLOW

**Project Scope:** Every Project belongs to exactly one Client. Projects may own multiple Shoots.

Projects must maintain:
- Budget
- Revenue
- Expenses
- Profit
- Outstanding Balance
- Timeline
- Deliverables

**Official Project Lifecycle:**
`Planning` ↓ `Scheduled` ↓ `In Production` ↓ `Editing` ↓ `Client Review` ↓ `Completed` ↓ `Archived`

## 4. SHOOT WORKFLOW

Shoots are individual sessions within a Project. 

**Shoot Tracking:**
Each Shoot should support:
- Schedule
- Location
- Google Maps
- Team
- Equipment
- Shot List
- Client Notes
- Attachments
- Weather
- Deliverables

**Shoot Status Workflow:**
`Planned` ↓ `Confirmed` ↓ `In Progress` ↓ `Editing` ↓ `Ready for Review` ↓ `Completed`

**Dependencies:** Marking shoots as complete/delivered automatically updates Calendar Events and the overarching Project Status.

## 5. DELIVERABLES

Each Shoot may generate multiple Deliverables.
Examples: Edited Photos, Reels, Brand Films, Walkthrough Videos, Social Media Content, Product Photos.

Every Deliverable must contain:
- Type
- Assigned Editor
- Due Date
- Completion Date
- Version
- Review Status
- Approval Status
- Delivery Status
- Download Link
- Client Access

**Deliverable Workflow:**
`Pending` ↓ `Editing` ↓ `Ready for Review` ↓ `Changes Requested` ↓ `Approved` ↓ `Delivered`

## 6. CLIENT REVIEW

Introduce Client Review as a dedicated business stage.

The client may:
- Approve Deliverables
- Request Changes
- Provide Feedback

Deliverables cannot become Delivered until Approved. Invoice generation should occur only after final approval unless manually overridden.

## 7. FINANCE WORKFLOW

**Invoice Lifecycle:**
`Draft` ↓ `Generated` ↓ `Sent` ↓ `Viewed` ↓ `Partially Paid` ↓ `Paid`

**Payments:**
Each Payment must reference: Invoice, Project, and Client.
Track:
- Amount
- Method
- Reference Number
- Transaction Date
- Notes

**Profit Calculation:** 
Profit must automatically recalculate whenever:
- Payment changes
- Expense changes

## 8. ACTIVITY TIMELINE

Create a centralized Activity Timeline. Every major event must be recorded.
Examples:
- Lead Created
- Lead Updated
- Quotation Sent
- Quotation Accepted
- Lead Converted
- Client Created
- Project Created
- Shoot Scheduled
- Shoot Completed
- Deliverables Uploaded
- Deliverables Approved
- Invoice Generated
- Invoice Sent
- Payment Received
- Expense Added
- Project Archived

The timeline powers: Dashboard, Notifications, Reports, and Client History.

## 9. NOTIFICATIONS

Document all automatic notifications.
Examples:
- Upcoming Shoot
- Payment Received
- Invoice Overdue
- Deliverables Ready
- Client Requested Changes
- Project Completed

## 10. DASHBOARD RULES

Every module must automatically update the Dashboard. 
Dashboard widgets should include:
- Business Snapshot
- Today's Schedule
- Upcoming Shoots
- Pending Deliverables
- Outstanding Payments
- Revenue
- Expenses
- Profit
- Recent Activity
- Notifications
- Continue Working

## 11. DATA RELATIONSHIPS

Maintain strict referential integrity.

**Relationship Model:**
Lead ↓ Client ↓ Project ↓ Shoot ↓ Deliverables ↓ Invoice ↓ Payments ↓ Expenses ↓ Reports ↓ Dashboard

- No module may exist independently.
- Prevent orphan records.
- Protect financial records from accidental deletion.

## 12. PROJECT COMPLETION

A Project may only become Completed when:
✓ Every Shoot is Completed
✓ Every Deliverable is Delivered
✓ Client Approval has been received
✓ Invoice has been Paid
✓ Outstanding Balance equals Zero

Only then may the Project be Archived.

## 13. GENERAL ARCHITECTURE RULES

- BUSINESS_RULES.md is the permanent source of truth.
- No module may exist independently.
- All modules must remain relational.
- Avoid duplicate business logic.
- Reuse shared services.
- Reuse shared validation.
- Reuse shared UI components.
- Every status change must update the Activity Timeline.
- Dashboard widgets must update automatically.
- Reports must derive data from relational entities.
- Preserve referential integrity.
- Prepare architecture for future multi-user support.
- Follow enterprise-grade architecture throughout the application.
