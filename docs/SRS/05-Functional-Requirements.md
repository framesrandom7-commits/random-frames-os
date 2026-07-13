# 5. Functional Requirements

---

# 5.1 Overview

This section defines the functional requirements for every module in Random Frames OS.

Each module has a specific responsibility but integrates seamlessly with all other modules.

The application follows a modular architecture, allowing future expansion without redesigning the system.

---

# 5.2 Dashboard Module

## Purpose

Provide a real-time overview of the business.

### Features

- Today's Follow-ups
- Active Leads
- Active Opportunities
- Active Projects
- Editing Queue
- Pending Deliveries
- Pending Payments
- Monthly Revenue
- Monthly Target
- Notifications
- Quick Actions

### Inputs

- Data from every module.

### Outputs

- Business summary.
- Quick navigation.

---

# 5.3 Lead Management Module

## Purpose

Manage every business lead.

### Features

- Add Lead
- Edit Lead
- Delete Lead
- Archive Lead
- Search
- Filters
- Tags
- Priority
- Follow-up
- Lead Timeline
- Attachments

### Lead Information

- Business Name
- Contact Person
- Industry
- Phone
- Email
- Instagram
- Website
- Address
- Notes

### Lead Status

- New
- Contacted
- Follow-up
- Interested
- Opportunity
- Closed Won
- Closed Lost

---

# 5.4 Opportunity Module

## Purpose

Track interested leads before conversion.

### Features

- Meeting
- Requirements
- Budget
- Timeline
- Notes
- Proposal
- Quote
- Win Probability

---

# 5.5 Client Module

## Purpose

Manage confirmed clients.

### Features

- Client Profile
- Communication History
- Documents
- Projects
- Revenue
- Notes
- Attachments

### Client Information

- Company
- Contact Person
- Phone
- Email
- GST (Future)
- Billing Address
- Social Links

---

# 5.6 Project Module

## Purpose

Manage projects from booking to completion.

### Features

- Create Project
- Project Timeline
- Deliverables
- Tasks
- Files
- Notes
- Calendar
- Drive Folder
- Status

### Status

- Planning
- Production
- Editing
- Review
- Delivered
- Closed

---

# 5.7 Post Production Module

## Purpose

Track editing progress.

### Workflow

- RAW Imported
- Backup
- Culling
- Editing
- Color Correction
- Color Grading
- Export
- Review
- Revision
- Approved
- Delivered

---

# 5.8 Deliverables Module

Supported Deliverables

- Photos
- Reels
- Brand Films
- Walkthrough Videos
- Highlight Films
- Aftermovies
- Product Videos
- Food Videos
- Commercial Videos
- Thumbnails
- Social Media Covers

---

# 5.9 Finance Module

## Features

- Pricing Manager
- Quote Generator
- Invoice Generator
- Payment Tracking
- Receipts
- Outstanding Payments
- Revenue Reports

---

# 5.10 Pricing Manager

Supports

- Shoot Only Pricing
- Content Packages
- Monthly Packages
- Add-ons

Admin can edit pricing anytime.

---

# 5.11 Quote Generator

Features

- Auto-fill client information
- Package selection
- Custom items
- Discounts
- Terms
- PDF Export

---

# 5.12 Invoice Generator

Features

- RF Invoice Number
- Invoice PDF
- Payment Status
- Due Date
- Payment Reminder
- Receipt Generation

---

# 5.13 Client Documents

Supports

- Service Agreement
- Terms & Conditions
- Cancellation Policy
- Brand Assets
- References
- Moodboards

Supports file upload.

---

# 5.14 File Management

Supports

- Images
- Videos
- PDF
- Word Documents
- Excel
- ZIP

Storage

- Google Drive

Future

- Local Storage
- Cloud Storage

---

# 5.15 Smart Reminder Engine

Automatic reminders for

- Lead Follow-up
- Meeting
- Shoot
- Delivery
- Invoice Due
- Payment Due
- Overdue Payment
- Monthly Client Follow-up

---

# 5.16 Notification Center

Displays

- Today's Tasks
- Follow-ups
- New Leads
- Upcoming Meetings
- Delivery Due
- Payment Due
- Overdue Tasks

---

# 5.17 Reports

Sales

- Leads
- Opportunities
- Conversion Rate

Projects

- Active
- Completed
- Delayed

Finance

- Revenue
- Outstanding
- Monthly Income

Marketing

- Repeat Clients
- Referral Clients
- Outreach Analytics

---

# 5.18 Admin Panel

Administrator can manage

- Users
- Roles
- Pricing
- Workflow
- Modules
- Fields
- Notifications
- Branding
- Integrations

---

# 5.19 Workflow Builder

Admin can

- Create Stages
- Rename Stages
- Delete Stages
- Reorder Workflow

No coding required.

---

# 5.20 Custom Field Builder

Supports

- Text
- Number
- Date
- Checkbox
- Dropdown
- Multi-select
- File Upload
- Relation

Available for every module.

---

# 5.21 Module Builder

Administrator can create entirely new modules.

Example

- Equipment
- Employees
- Vendors
- Drone Logs
- Inventory

No code modification required.

---

# 5.22 Backup & Export

Supports

- CSV
- Excel
- JSON
- Full Database Backup
- Restore Backup

---

# 5.23 Universal Search

Search across

- Leads
- Clients
- Projects
- Files
- Quotes
- Invoices
- Payments
- Tasks

---

# 5.24 Audit Log

Records

- Login
- Logout
- Create
- Edit
- Delete
- Upload
- Download
- Payment Updates
- Workflow Changes

Every activity is timestamped.

---

# 5.25 Future Modules

Reserved architecture for

- Client Portal
- Employee Portal
- Inventory
- Equipment
- AI Assistant
- Mobile App
- Online Booking
- Marketing Automation

No redesign should be required when these modules are introduced.