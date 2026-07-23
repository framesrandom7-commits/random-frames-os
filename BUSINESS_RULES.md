# Random Frames OS - Business Rules

This document is the permanent source of truth for Random Frames OS. Every module, automation, database change, workflow, UI, relation, and business logic MUST follow this document.

## 1. LEAD WORKFLOW
Every enquiry enters ONLY through Leads.
**Possible Sources:** Website (Web3Forms), Instagram, WhatsApp, Phone Call, Referral, Walk-in, Manual Entry, Cold Call, Email.

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

## 2. CLIENT ONBOARDING WORKFLOW
- Triggered after Lead reaches `QUOTATION_ACCEPTED`.
- System emails a secure form link to the client.
- Form collects: Name, Business Name, Phone, Email, GST, Address, Instagram, Website.
- Submission updates lead to `CLIENT_FORM_RECEIVED`.
- Studio manager converts Lead via "Client Onboarding Wizard", which natively and atomically creates: Client -> Project -> Shoot -> Revenue.

## 3. PROJECT & FINANCE WORKFLOW
- **Project Scope:** Tracks overall job (e.g., "Cafe Menu Shoot").
- **Financial Tracking:**
  - `Total Project Value` (Quotation Amount)
  - `Advance Received`
  - `Balance Due`
  - `Payment Status` (PENDING, PARTIAL, PAID)
- **Payment Lifecycle:**
  - Project created -> Invoice Generated -> Payment Pending.
  - Optional: Advance Received (creates Payment record).
  - Optional: Partial Payment.
  - Payment Completed (Balance = 0) -> Status becomes PAID.
- **Profit Calculation:** Automatically recalculates whenever a Payment or Expense is logged.

## 4. SHOOT OPERATIONAL WORKFLOW
Shoots are individual sessions within a Project.
- **Pre-Shoot Planning:** Track Date, Start/End Time, Location, Contact Person, Contact Number, Deliverables, Client Requirements, Weather Notes, Equipment Needed, Team (Photographer, Videographer, Assistants).
- **During Shoot:** Execution.
- **Post-Shoot Delivery:** Track Editing Status (PENDING, IN_PROGRESS, REVIEW, COMPLETED), Delivery Status (PENDING, PARTIAL, DELIVERED), Approval Status (PENDING, CHANGES_REQUESTED, APPROVED), and Delivered Date.
- **Dependencies:** Marking shoots as complete/delivered automatically updates Calendar Events and the overarching Project Status.

## 5. PROJECT COMPLETION AUTOMATION
A project can only be marked `COMPLETED` if:
1. All associated Shoots are completed.
2. The Balance Due is 0 (Fully Paid).
Upon completion, the system locks final Profit calculation and updates the Dashboard.

## 6. DATA & RELATIONSHIP INTEGRITY
- No mock data or placeholders.
- Strict referential integrity: Lead -> Client -> Project -> Shoot -> Revenue -> Expense -> Invoice -> Payment -> Reports -> Dashboard.
- Deleting or archiving entities must strictly cascade or safeguard connected financial and operational data to prevent orphans.
