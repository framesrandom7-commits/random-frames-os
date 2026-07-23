# Random Frames OS - Test Cases

Every workflow must be manually tested against these scenarios before a module is considered complete.

## 1. Leads Workflow
- [ ] Receive lead via Webhook -> Verify Status is `NEW` and notification appears.
- [ ] Manually transition lead through `ATTENDED` -> `REQUIREMENT_DISCUSSION` -> `QUOTATION_SENT` -> `NEGOTIATION`.
- [ ] Move to `QUOTATION_ACCEPTED` -> Verify Client Form email is sent via Resend.
- [ ] Form submitted -> Verify Lead status updates to `CLIENT_FORM_RECEIVED`.

## 2. Client Onboarding
- [ ] Trigger Onboarding Wizard from a `CLIENT_FORM_RECEIVED` lead.
- [ ] Submit Wizard -> Verify exactly 1 Client, 1 Project, 1 Shoot, 1 Invoice (and optionally 1 Payment) are created.
- [ ] Verify Lead status is now `CONVERTED_TO_CLIENT`.

## 3. Financial Integrity
- [ ] Add an Expense to a Project -> Verify Project Profit decreases.
- [ ] Add a Payment to a Project -> Verify Project Balance decreases and Payment Status updates (PENDING -> PARTIAL -> PAID).
- [ ] Delete a Payment -> Verify Balance increases and Status reverts.
- [ ] Generate Invoice -> Verify total matches Project Quotation Amount.

## 4. Shoot Operations
- [ ] Create Shoot -> Verify Calendar Event is created.
- [ ] Update Shoot date/time -> Verify Calendar Event updates.
- [ ] Mark all Shoots in a project as `COMPLETED` -> Verify Project Status advances to `POST_PRODUCTION`.
- [ ] Update Shoot Delivery Status to `DELIVERED` -> Verify Project Status updates to `DELIVERED`.

## 5. Project Completion
- [ ] Attempt to complete Project with balance > 0 -> Verify rejection.
- [ ] Attempt to complete Project with pending shoots -> Verify rejection.
- [ ] Complete valid Project -> Verify status is `COMPLETED`.

## 6. Reports & Dashboard
- [ ] Load Dashboard -> Verify stats match DB exactly.
- [ ] Complete a project -> Verify Dashboard Revenue/Profit/Projects metrics update in real-time.

## 7. End-to-End Workflow
- [ ] Receive Website Lead via webhook.
- [ ] Manage Lead through Quotation and Negotiation.
- [ ] Send and receive Client Form.
- [ ] Run Onboarding Wizard to create Client, Project, and Shoot.
- [ ] Schedule Shoot fully.
- [ ] Add an Expense for the Shoot.
- [ ] Generate Invoice for the Project.
- [ ] Receive Payment and verify Profit Calculation.
- [ ] Complete Shoot and Mark Project as Completed.
