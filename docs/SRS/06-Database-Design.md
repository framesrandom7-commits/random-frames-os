# 6. Database Design

---

# 6.1 Overview

Random Frames OS follows a relational database architecture.

Every record is connected to eliminate duplicate data and maintain a single source of truth.

The database is designed for scalability, allowing future modules to be added without redesigning the schema.

---

# 6.2 Core Design Principles

- Single Source of Truth
- Relational Database
- UUID Primary Keys
- Soft Delete Support
- Audit Logging
- Timestamped Records
- Scalable Architecture

---

# 6.3 Core Entities

The system consists of the following primary entities:

- Users
- Leads
- Opportunities
- Clients
- Projects
- Tasks
- Deliverables
- Files
- Quotations
- Invoices
- Payments
- Notes
- Activities
- Notifications
- Workflows
- Custom Fields

---

# 6.4 Relationship Overview

User

↓

Lead

↓

Opportunity

↓

Client

↓

Project

↓

Deliverables

↓

Invoice

↓

Payment

Every entity is linked through unique identifiers.

---

# 6.5 Leads Table

Stores:

- Business Name
- Contact Person
- Email
- Phone
- Instagram
- Website
- Industry
- Source
- Status
- Priority
- Notes

---

# 6.6 Opportunities Table

Stores

- Linked Lead
- Meeting Date
- Budget
- Requirements
- Proposal Status
- Win Probability

---

# 6.7 Clients Table

Stores

- Company
- Contact Details
- Billing Address
- Communication History
- Documents
- Revenue

---

# 6.8 Projects Table

Stores

- Client
- Service
- Package
- Timeline
- Deliverables
- Status
- Drive Folder
- Calendar Event

---

# 6.9 Tasks Table

Stores

- Task Name
- Assigned User
- Due Date
- Priority
- Status

---

# 6.10 Files Table

Stores

- File Name
- File Type
- Module
- Google Drive Link
- Upload Date

---

# 6.11 Quotations Table

Stores

- Quote Number
- Client
- Project
- Total
- Status
- Expiry Date

---

# 6.12 Invoices Table

Stores

- Invoice Number
- Client
- Project
- Due Date
- Amount
- Status

---

# 6.13 Payments Table

Stores

- Invoice
- Amount
- Payment Date
- Method
- Reference Number

---

# 6.14 Notifications Table

Stores

- Title
- Type
- User
- Due Date
- Status

---

# 6.15 Activity Timeline

Every activity is stored.

Examples:

- Lead Created
- Email Sent
- WhatsApp Sent
- Quote Generated
- Invoice Generated
- Payment Received

---

# 6.16 Future Expansion

The schema supports future modules including:

- Inventory
- Equipment
- Employees
- Vendors
- Client Portal
- AI Assistant

No redesign should be required.