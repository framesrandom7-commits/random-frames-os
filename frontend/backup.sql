--
-- PostgreSQL database dump
--

\restrict W2GgXjRvDlQyKMgMhwBRJbhIapbsdxhgTU8qo8Ti5p5K5gdnKWcnO372dglCS7g

-- Dumped from database version 18.4 (df16b3c)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ActivityType" AS ENUM (
    'NOTE',
    'STATUS_CHANGE',
    'FILE_UPLOAD',
    'SYSTEM'
);


ALTER TYPE public."ActivityType" OWNER TO neondb_owner;

--
-- Name: BusinessType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BusinessType" AS ENUM (
    'CORPORATE',
    'WEDDING',
    'FASHION',
    'REAL_ESTATE',
    'EVENTS',
    'COMMERCIAL',
    'PORTRAIT',
    'OTHER'
);


ALTER TYPE public."BusinessType" OWNER TO neondb_owner;

--
-- Name: CalendarEventStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CalendarEventStatus" AS ENUM (
    'SCHEDULED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."CalendarEventStatus" OWNER TO neondb_owner;

--
-- Name: CalendarEventType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CalendarEventType" AS ENUM (
    'SHOOT',
    'MEETING',
    'FOLLOW_UP',
    'DELIVERY',
    'PAYMENT_DUE',
    'PERSONAL_REMINDER'
);


ALTER TYPE public."CalendarEventType" OWNER TO neondb_owner;

--
-- Name: CommunicationDirection; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CommunicationDirection" AS ENUM (
    'INBOUND',
    'OUTBOUND',
    'INTERNAL'
);


ALTER TYPE public."CommunicationDirection" OWNER TO neondb_owner;

--
-- Name: CommunicationType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CommunicationType" AS ENUM (
    'EMAIL',
    'CALL',
    'MEETING',
    'MESSAGE'
);


ALTER TYPE public."CommunicationType" OWNER TO neondb_owner;

--
-- Name: DeliverablePriority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DeliverablePriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public."DeliverablePriority" OWNER TO neondb_owner;

--
-- Name: DeliverableStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DeliverableStatus" AS ENUM (
    'PENDING',
    'EDITING',
    'READY_FOR_REVIEW',
    'CHANGES_REQUESTED',
    'APPROVED',
    'DELIVERED'
);


ALTER TYPE public."DeliverableStatus" OWNER TO neondb_owner;

--
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'VIEWED',
    'DOWNLOADED',
    'CONFIRMED',
    'EXPIRED'
);


ALTER TYPE public."DeliveryStatus" OWNER TO neondb_owner;

--
-- Name: EquipmentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EquipmentStatus" AS ENUM (
    'REQUIRED',
    'PACKED',
    'MISSING'
);


ALTER TYPE public."EquipmentStatus" OWNER TO neondb_owner;

--
-- Name: FinancialReportType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."FinancialReportType" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'ANNUAL',
    'PNL',
    'CUSTOM'
);


ALTER TYPE public."FinancialReportType" OWNER TO neondb_owner;

--
-- Name: FollowUpStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."FollowUpStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."FollowUpStatus" OWNER TO neondb_owner;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PARTIAL',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO neondb_owner;

--
-- Name: JobStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."JobStatus" AS ENUM (
    'QUEUED',
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'RETRYING',
    'CANCELLED'
);


ALTER TYPE public."JobStatus" OWNER TO neondb_owner;

--
-- Name: LeadPriority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."LeadPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."LeadPriority" OWNER TO neondb_owner;

--
-- Name: LeadSource; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."LeadSource" AS ENUM (
    'WEBSITE',
    'WHATSAPP',
    'INSTAGRAM',
    'FACEBOOK',
    'REFERRAL',
    'WALK_IN',
    'PHONE_CALL',
    'MANUAL',
    'OTHER'
);


ALTER TYPE public."LeadSource" OWNER TO neondb_owner;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'REQUIREMENT_DISCUSSION',
    'QUOTE_SENT',
    'NEGOTIATION',
    'QUOTE_APPROVED',
    'ADVANCE_PENDING',
    'CONVERTED',
    'LOST'
);


ALTER TYPE public."LeadStatus" OWNER TO neondb_owner;

--
-- Name: LostReason; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."LostReason" AS ENUM (
    'PRICE_TOO_HIGH',
    'CHOSE_ANOTHER_PHOTOGRAPHER',
    'BUDGET_ISSUES',
    'PROJECT_CANCELLED',
    'JUST_AN_ENQUIRY',
    'NO_RESPONSE',
    'TIMING_ISSUES',
    'NOT_INTERESTED',
    'DUPLICATE_LEAD',
    'OTHER'
);


ALTER TYPE public."LostReason" OWNER TO neondb_owner;

--
-- Name: NotificationPriority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."NotificationPriority" OWNER TO neondb_owner;

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'DISMISSED',
    'SNOOZED'
);


ALTER TYPE public."NotificationStatus" OWNER TO neondb_owner;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationType" AS ENUM (
    'LEAD_FOLLOW_UP',
    'SHOOT_REMINDER',
    'MEETING_REMINDER',
    'PROJECT_DEADLINE',
    'DELIVERY_REMINDER',
    'INVOICE_DUE',
    'PAYMENT_RECEIVED',
    'OVERDUE_PAYMENT',
    'GENERAL_REMINDER',
    'SYSTEM',
    'STORAGE',
    'WORKFLOW',
    'SUCCESS',
    'INFO',
    'WARNING',
    'ERROR'
);


ALTER TYPE public."NotificationType" OWNER TO neondb_owner;

--
-- Name: ParticipantStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ParticipantStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED'
);


ALTER TYPE public."ParticipantStatus" OWNER TO neondb_owner;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'UPI',
    'BANK_TRANSFER',
    'CARD',
    'OTHER',
    'CHEQUE'
);


ALTER TYPE public."PaymentMethod" OWNER TO neondb_owner;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID'
);


ALTER TYPE public."PaymentStatus" OWNER TO neondb_owner;

--
-- Name: PreferredContact; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PreferredContact" AS ENUM (
    'WHATSAPP',
    'PHONE',
    'EMAIL'
);


ALTER TYPE public."PreferredContact" OWNER TO neondb_owner;

--
-- Name: ProjectCategory; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProjectCategory" AS ENUM (
    'CAFE',
    'REAL_ESTATE',
    'EVENT',
    'PRODUCT',
    'OTHER'
);


ALTER TYPE public."ProjectCategory" OWNER TO neondb_owner;

--
-- Name: ProjectPriority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProjectPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."ProjectPriority" OWNER TO neondb_owner;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'INQUIRY',
    'PLANNED',
    'SHOOTING',
    'EDITING',
    'REVIEW',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ProjectStatus" OWNER TO neondb_owner;

--
-- Name: QuotationStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."QuotationStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'APPROVED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public."QuotationStatus" OWNER TO neondb_owner;

--
-- Name: RecurringFrequency; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."RecurringFrequency" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'YEARLY'
);


ALTER TYPE public."RecurringFrequency" OWNER TO neondb_owner;

--
-- Name: ReminderChannel; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReminderChannel" AS ENUM (
    'IN_APP',
    'EMAIL',
    'WHATSAPP'
);


ALTER TYPE public."ReminderChannel" OWNER TO neondb_owner;

--
-- Name: ReminderType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReminderType" AS ENUM (
    'FOLLOW_UP',
    'MEETING',
    'CALL',
    'DEADLINE'
);


ALTER TYPE public."ReminderType" OWNER TO neondb_owner;

--
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ResourceType" AS ENUM (
    'CAMERA_BODY',
    'LENS',
    'LIGHTING',
    'STUDIO',
    'VEHICLE',
    'ASSISTANT',
    'PHOTOGRAPHER',
    'OTHER'
);


ALTER TYPE public."ResourceType" OWNER TO neondb_owner;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'NOT_SENT',
    'UNDER_REVIEW',
    'CHANGES_REQUESTED',
    'APPROVED'
);


ALTER TYPE public."ReviewStatus" OWNER TO neondb_owner;

--
-- Name: ShootStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ShootStatus" AS ENUM (
    'PLANNED',
    'CONFIRMED',
    'IN_PROGRESS',
    'EDITING',
    'READY_FOR_REVIEW',
    'COMPLETED',
    'CANCELLED',
    'POSTPONED'
);


ALTER TYPE public."ShootStatus" OWNER TO neondb_owner;

--
-- Name: ShootType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ShootType" AS ENUM (
    'CAFE',
    'PRODUCT',
    'REAL_ESTATE',
    'EVENT',
    'PORTRAIT',
    'OTHER'
);


ALTER TYPE public."ShootType" OWNER TO neondb_owner;

--
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."TaskPriority" OWNER TO neondb_owner;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO neondb_owner;

--
-- Name: TemplateCategory; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TemplateCategory" AS ENUM (
    'QUOTATION',
    'INVOICE',
    'REMINDER',
    'SHOOT_CONFIRMATION',
    'MEETING_CONFIRMATION',
    'DELIVERY',
    'PAYMENT',
    'FOLLOW_UP',
    'WELCOME',
    'THANK_YOU',
    'CUSTOM'
);


ALTER TYPE public."TemplateCategory" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Activity; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Activity" (
    id text NOT NULL,
    type public."ActivityType" NOT NULL,
    description text NOT NULL,
    metadata jsonb,
    "leadId" text,
    "clientId" text,
    "projectId" text,
    "shootId" text,
    "invoiceId" text,
    "paymentId" text,
    "expenseId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


ALTER TABLE public."Activity" OWNER TO neondb_owner;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    action text NOT NULL,
    module text,
    "entityId" text,
    "entityType" text,
    "userId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO neondb_owner;

--
-- Name: Availability; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Availability" (
    id text NOT NULL,
    "userId" text,
    date timestamp(3) without time zone NOT NULL,
    reason text,
    "startTime" text,
    "endTime" text,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Availability" OWNER TO neondb_owner;

--
-- Name: BackgroundJob; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."BackgroundJob" (
    id text NOT NULL,
    type text NOT NULL,
    payload jsonb,
    status public."JobStatus" DEFAULT 'QUEUED'::public."JobStatus" NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    error text,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BackgroundJob" OWNER TO neondb_owner;

--
-- Name: CalendarEvent; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CalendarEvent" (
    id text NOT NULL,
    title text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" text,
    "endTime" text,
    "isAllDay" boolean DEFAULT false NOT NULL,
    "eventType" public."CalendarEventType" NOT NULL,
    status public."CalendarEventStatus" DEFAULT 'SCHEDULED'::public."CalendarEventStatus" NOT NULL,
    color text,
    "googleCalendarEventId" text,
    "clientId" text,
    "projectId" text,
    "shootId" text,
    "leadId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "recurringRuleId" text
);


ALTER TABLE public."CalendarEvent" OWNER TO neondb_owner;

--
-- Name: ChecklistItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ChecklistItem" (
    id text NOT NULL,
    title text NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "taskId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChecklistItem" OWNER TO neondb_owner;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    "clientCode" text NOT NULL,
    "businessName" text NOT NULL,
    "contactPerson" text,
    phone text,
    email text,
    instagram text,
    website text,
    address text,
    city text,
    state text,
    country text,
    "postalCode" text,
    "businessType" public."BusinessType" DEFAULT 'OTHER'::public."BusinessType" NOT NULL,
    "gstNumber" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "driveFolderId" text,
    "driveFolderUrl" text
);


ALTER TABLE public."Client" OWNER TO neondb_owner;

--
-- Name: Communication; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Communication" (
    id text NOT NULL,
    type public."CommunicationType" NOT NULL,
    direction public."CommunicationDirection" NOT NULL,
    subject text,
    body text NOT NULL,
    status text DEFAULT 'SENT'::text NOT NULL,
    error text,
    "leadId" text,
    "clientId" text,
    "projectId" text,
    "invoiceId" text,
    "quotationId" text,
    "paymentId" text,
    "eventId" text,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


ALTER TABLE public."Communication" OWNER TO neondb_owner;

--
-- Name: CommunicationAttachment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CommunicationAttachment" (
    id text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileSize" integer NOT NULL,
    "fileType" text NOT NULL,
    "communicationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CommunicationAttachment" OWNER TO neondb_owner;

--
-- Name: CommunicationTemplate; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CommunicationTemplate" (
    id text NOT NULL,
    title text NOT NULL,
    category public."TemplateCategory" DEFAULT 'CUSTOM'::public."TemplateCategory" NOT NULL,
    type public."CommunicationType" NOT NULL,
    subject text,
    body text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


ALTER TABLE public."CommunicationTemplate" OWNER TO neondb_owner;

--
-- Name: Deliverable; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Deliverable" (
    id text NOT NULL,
    type text NOT NULL,
    "assignedEditor" text,
    status public."DeliverableStatus" DEFAULT 'PENDING'::public."DeliverableStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completionDate" timestamp(3) without time zone,
    "shootId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    priority public."DeliverablePriority" DEFAULT 'MEDIUM'::public."DeliverablePriority" NOT NULL,
    "reviewDate" timestamp(3) without time zone,
    "reviewStatus" public."ReviewStatus" DEFAULT 'NOT_SENT'::public."ReviewStatus" NOT NULL,
    "reviewerNotes" text
);


ALTER TABLE public."Deliverable" OWNER TO neondb_owner;

--
-- Name: DeliverableFile; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."DeliverableFile" (
    id text NOT NULL,
    "deliverableId" text NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    "sizeBytes" integer,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DeliverableFile" OWNER TO neondb_owner;

--
-- Name: DeliverableVersion; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."DeliverableVersion" (
    id text NOT NULL,
    "deliverableId" text NOT NULL,
    "versionNumber" integer NOT NULL,
    "changeNotes" text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DeliverableVersion" OWNER TO neondb_owner;

--
-- Name: Delivery; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Delivery" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status public."DeliveryStatus" DEFAULT 'DRAFT'::public."DeliveryStatus" NOT NULL,
    "deliveryLink" text,
    password text,
    "expiryDate" timestamp(3) without time zone,
    "projectId" text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "viewedAt" timestamp(3) without time zone,
    "downloadedAt" timestamp(3) without time zone,
    "confirmedAt" timestamp(3) without time zone,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Delivery" OWNER TO neondb_owner;

--
-- Name: DeliveryVersion; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."DeliveryVersion" (
    id text NOT NULL,
    version integer NOT NULL,
    changes text,
    "deliveryLink" text NOT NULL,
    "deliveryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DeliveryVersion" OWNER TO neondb_owner;

--
-- Name: EventParticipant; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."EventParticipant" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "userId" text,
    name text,
    email text,
    status public."ParticipantStatus" DEFAULT 'PENDING'::public."ParticipantStatus" NOT NULL
);


ALTER TABLE public."EventParticipant" OWNER TO neondb_owner;

--
-- Name: Expense; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    title text NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'OTHER'::public."PaymentMethod" NOT NULL,
    notes text,
    "clientId" text,
    "projectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "categoryId" text NOT NULL,
    "receiptUrl" text,
    vendor text
);


ALTER TABLE public."Expense" OWNER TO neondb_owner;

--
-- Name: ExpenseCategory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ExpenseCategory" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#888888'::text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ExpenseCategory" OWNER TO neondb_owner;

--
-- Name: FinancialReport; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."FinancialReport" (
    id text NOT NULL,
    title text NOT NULL,
    type public."FinancialReportType" NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    data jsonb NOT NULL,
    "fileUrl" text,
    "generatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FinancialReport" OWNER TO neondb_owner;

--
-- Name: FollowUp; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."FollowUp" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "dueDate" timestamp(3) without time zone NOT NULL,
    status public."FollowUpStatus" DEFAULT 'PENDING'::public."FollowUpStatus" NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    "communicationId" text,
    "leadId" text,
    "clientId" text,
    "projectId" text,
    "assignedToId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


ALTER TABLE public."FollowUp" OWNER TO neondb_owner;

--
-- Name: Holiday; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Holiday" (
    id text NOT NULL,
    name text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "isYearly" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Holiday" OWNER TO neondb_owner;

--
-- Name: IntegrationSettings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."IntegrationSettings" (
    id text NOT NULL,
    provider text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "tokenExpiry" timestamp(3) without time zone,
    "rootFolderId" text,
    "rootFolderUrl" text,
    "storageUsageBytes" bigint DEFAULT 0 NOT NULL,
    "fileCount" integer DEFAULT 0 NOT NULL,
    "lastSyncAt" timestamp(3) without time zone,
    "syncStatus" text DEFAULT 'IDLE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text
);


ALTER TABLE public."IntegrationSettings" OWNER TO neondb_owner;

--
-- Name: InternalNote; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."InternalNote" (
    id text NOT NULL,
    content text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "leadId" text,
    "clientId" text,
    "projectId" text,
    "invoiceId" text,
    "quotationId" text,
    "paymentId" text,
    "eventId" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InternalNote" OWNER TO neondb_owner;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "issueDate" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2),
    tax numeric(10,2),
    total numeric(10,2) NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    notes text,
    "projectId" text NOT NULL,
    "clientId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO neondb_owner;

--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."InvoiceItem" (
    id text NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "invoiceId" text NOT NULL
);


ALTER TABLE public."InvoiceItem" OWNER TO neondb_owner;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "businessName" text,
    "contactPerson" text,
    phone text,
    email text,
    instagram text,
    website text,
    address text,
    city text,
    state text,
    country text,
    "postalCode" text,
    "businessType" public."BusinessType" DEFAULT 'OTHER'::public."BusinessType" NOT NULL,
    "leadSource" public."LeadSource" DEFAULT 'OTHER'::public."LeadSource" NOT NULL,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    priority public."LeadPriority" DEFAULT 'MEDIUM'::public."LeadPriority" NOT NULL,
    budget numeric(10,2),
    currency text DEFAULT 'USD'::text NOT NULL,
    "leadScore" integer DEFAULT 0 NOT NULL,
    notes text,
    "sourceEmailId" text,
    "convertedToClientId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "createdById" text,
    "updatedById" text,
    whatsapp text,
    "closingRemarks" text,
    "lastContactDate" timestamp(3) without time zone,
    "lostReason" public."LostReason",
    "nextFollowUpDate" timestamp(3) without time zone,
    "ownerId" text,
    "ownerRemarks" text,
    "preferredContactMethod" public."PreferredContact",
    "serviceInterested" text
);


ALTER TABLE public."Lead" OWNER TO neondb_owner;

--
-- Name: LeadAttachment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."LeadAttachment" (
    id text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileSize" integer NOT NULL,
    "fileType" text NOT NULL,
    "leadId" text,
    "clientId" text,
    "projectId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


ALTER TABLE public."LeadAttachment" OWNER TO neondb_owner;

--
-- Name: LeadCommunication; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."LeadCommunication" (
    id text NOT NULL,
    type public."CommunicationType" NOT NULL,
    summary text NOT NULL,
    details text,
    "leadId" text NOT NULL,
    "clientId" text,
    "projectId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


ALTER TABLE public."LeadCommunication" OWNER TO neondb_owner;

--
-- Name: LeadReminder; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."LeadReminder" (
    id text NOT NULL,
    type public."ReminderType" NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "time" text,
    completed boolean DEFAULT false NOT NULL,
    "leadId" text NOT NULL,
    "clientId" text,
    "projectId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


ALTER TABLE public."LeadReminder" OWNER TO neondb_owner;

--
-- Name: LeadTag; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."LeadTag" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LeadTag" OWNER TO neondb_owner;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    title text NOT NULL,
    message text,
    type public."NotificationType" NOT NULL,
    status public."NotificationStatus" DEFAULT 'PENDING'::public."NotificationStatus" NOT NULL,
    priority public."NotificationPriority" DEFAULT 'MEDIUM'::public."NotificationPriority" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "snoozedUntil" timestamp(3) without time zone,
    "leadId" text,
    "clientId" text,
    "projectId" text,
    "shootId" text,
    "invoiceId" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "actionUrl" text,
    "isRead" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Notification" OWNER TO neondb_owner;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    email text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO neondb_owner;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "paymentDate" timestamp(3) without time zone NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'OTHER'::public."PaymentMethod" NOT NULL,
    "referenceNumber" text,
    notes text,
    "invoiceId" text,
    "projectId" text NOT NULL,
    "clientId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "bankReference" text,
    "paymentScreenshotUrl" text,
    "upiTransactionId" text
);


ALTER TABLE public."Payment" OWNER TO neondb_owner;

--
-- Name: Permission; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    action text NOT NULL,
    description text,
    module text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Permission" OWNER TO neondb_owner;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    "projectCode" text NOT NULL,
    title text NOT NULL,
    description text,
    category public."ProjectCategory" DEFAULT 'OTHER'::public."ProjectCategory" NOT NULL,
    status public."ProjectStatus" DEFAULT 'INQUIRY'::public."ProjectStatus" NOT NULL,
    priority public."ProjectPriority" DEFAULT 'MEDIUM'::public."ProjectPriority" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "deliveryDate" timestamp(3) without time zone,
    "quotationAmount" numeric(10,2),
    "advanceAmount" numeric(10,2),
    "totalAmount" numeric(10,2),
    "balanceAmount" numeric(10,2),
    "profitAmount" numeric(10,2),
    notes text,
    "clientId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "backupFolderId" text,
    "backupFolderUrl" text,
    "deliveryFolderId" text,
    "deliveryFolderUrl" text,
    "documentsFolderId" text,
    "documentsFolderUrl" text,
    "driveRootFolderId" text,
    "driveRootFolderUrl" text,
    "editFolderId" text,
    "editFolderUrl" text,
    "fileCount" integer DEFAULT 0 NOT NULL,
    "lastSyncAt" timestamp(3) without time zone,
    "rawFolderId" text,
    "rawFolderUrl" text,
    "referencesFolderId" text,
    "referencesFolderUrl" text,
    "socialFolderId" text,
    "socialFolderUrl" text,
    "storageUsageBytes" bigint DEFAULT 0 NOT NULL,
    "syncStatus" text DEFAULT 'IDLE'::text NOT NULL
);


ALTER TABLE public."Project" OWNER TO neondb_owner;

--
-- Name: Quotation; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Quotation" (
    id text NOT NULL,
    "quotationNumber" text NOT NULL,
    "issueDate" timestamp(3) without time zone NOT NULL,
    "validUntil" timestamp(3) without time zone NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2),
    tax numeric(10,2),
    total numeric(10,2) NOT NULL,
    status public."QuotationStatus" DEFAULT 'DRAFT'::public."QuotationStatus" NOT NULL,
    notes text,
    "termsAndConditions" text,
    version integer DEFAULT 1 NOT NULL,
    "parentQuotationId" text,
    "projectId" text NOT NULL,
    "clientId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Quotation" OWNER TO neondb_owner;

--
-- Name: QuotationItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."QuotationItem" (
    id text NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "quotationId" text NOT NULL
);


ALTER TABLE public."QuotationItem" OWNER TO neondb_owner;

--
-- Name: RecurringRule; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."RecurringRule" (
    id text NOT NULL,
    frequency public."RecurringFrequency" NOT NULL,
    "interval" integer DEFAULT 1 NOT NULL,
    "endDate" timestamp(3) without time zone,
    count integer
);


ALTER TABLE public."RecurringRule" OWNER TO neondb_owner;

--
-- Name: Reminder; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Reminder" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "triggerDate" timestamp(3) without time zone NOT NULL,
    type public."ReminderChannel" DEFAULT 'IN_APP'::public."ReminderChannel" NOT NULL,
    "isSent" boolean DEFAULT false NOT NULL,
    "eventId" text,
    "taskId" text,
    "projectId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Reminder" OWNER TO neondb_owner;

--
-- Name: Resource; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Resource" (
    id text NOT NULL,
    name text NOT NULL,
    type public."ResourceType" DEFAULT 'OTHER'::public."ResourceType" NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Resource" OWNER TO neondb_owner;

--
-- Name: ResourceAssignment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ResourceAssignment" (
    id text NOT NULL,
    "resourceId" text NOT NULL,
    "eventId" text NOT NULL,
    status text DEFAULT 'ASSIGNED'::text NOT NULL
);


ALTER TABLE public."ResourceAssignment" OWNER TO neondb_owner;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isSystem" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO neondb_owner;

--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."RolePermission" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL
);


ALTER TABLE public."RolePermission" OWNER TO neondb_owner;

--
-- Name: Setting; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Setting" (
    key text NOT NULL,
    value jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Setting" OWNER TO neondb_owner;

--
-- Name: Shoot; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Shoot" (
    id text NOT NULL,
    "shootCode" text NOT NULL,
    title text NOT NULL,
    "shootType" public."ShootType" DEFAULT 'OTHER'::public."ShootType" NOT NULL,
    status public."ShootStatus" DEFAULT 'PLANNED'::public."ShootStatus" NOT NULL,
    date timestamp(3) without time zone,
    "startTime" text,
    "endTime" text,
    location text,
    "googleMapsLink" text,
    "contactPerson" text,
    "contactNumber" text,
    photographer text,
    videographer text,
    assistants text,
    "weatherNotes" text,
    notes text,
    "projectId" text NOT NULL,
    "clientId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "callTime" text,
    "clientBrief" text,
    "deliverablesChecklist" text,
    "droneOperator" text,
    editor text,
    "makeupArtist" text,
    "moodBoard" text,
    "referenceImages" text,
    "specialRequests" text,
    "timeZone" text,
    "wrapTime" text,
    "audioFolderId" text,
    "audioFolderUrl" text,
    "btsFolderId" text,
    "btsFolderUrl" text,
    "cameraAFolderId" text,
    "cameraAFolderUrl" text,
    "cameraBFolderId" text,
    "cameraBFolderUrl" text,
    "droneFolderId" text,
    "droneFolderUrl" text
);


ALTER TABLE public."Shoot" OWNER TO neondb_owner;

--
-- Name: ShootEquipment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ShootEquipment" (
    id text NOT NULL,
    name text NOT NULL,
    "shootId" text NOT NULL,
    notes text,
    status public."EquipmentStatus" DEFAULT 'REQUIRED'::public."EquipmentStatus" NOT NULL
);


ALTER TABLE public."ShootEquipment" OWNER TO neondb_owner;

--
-- Name: ShootShot; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ShootShot" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "shootId" text NOT NULL,
    notes text,
    priority text,
    "referenceImage" text
);


ALTER TABLE public."ShootShot" OWNER TO neondb_owner;

--
-- Name: Tag; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Tag" (
    id text NOT NULL,
    name text NOT NULL,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tag" OWNER TO neondb_owner;

--
-- Name: Task; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status public."TaskStatus" DEFAULT 'PENDING'::public."TaskStatus" NOT NULL,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "estimatedDuration" integer,
    "actualDuration" integer,
    progress integer DEFAULT 0 NOT NULL,
    "projectId" text,
    "clientId" text,
    "leadId" text,
    "assignedToId" text,
    "parentTaskId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Task" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "contactEmail" text,
    "roleId" text
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: WebhookEndpoint; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."WebhookEndpoint" (
    id text NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    secret text,
    "eventTypes" text DEFAULT '[]'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authenticationType" text DEFAULT 'HMAC'::text NOT NULL,
    "failureCount" integer DEFAULT 0 NOT NULL,
    "lastFailureAt" timestamp(3) without time zone,
    "lastSuccessAt" timestamp(3) without time zone,
    "retryPolicy" text DEFAULT 'EXPONENTIAL_BACKOFF'::text NOT NULL
);


ALTER TABLE public."WebhookEndpoint" OWNER TO neondb_owner;

--
-- Name: WorkingHours; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."WorkingHours" (
    id text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."WorkingHours" OWNER TO neondb_owner;

--
-- Name: _ProjectAssignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."_ProjectAssignments" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ProjectAssignments" OWNER TO neondb_owner;

--
-- Name: _TaskDependencies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."_TaskDependencies" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_TaskDependencies" OWNER TO neondb_owner;

--
-- Data for Name: Activity; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Activity" (id, type, description, metadata, "leadId", "clientId", "projectId", "shootId", "invoiceId", "paymentId", "expenseId", "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AuditLog" (id, action, module, "entityId", "entityType", "userId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Availability; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Availability" (id, "userId", date, reason, "startTime", "endTime", "isBlocked", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BackgroundJob; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."BackgroundJob" (id, type, payload, status, progress, error, "retryCount", "startedAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CalendarEvent; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CalendarEvent" (id, title, date, "startTime", "endTime", "isAllDay", "eventType", status, color, "googleCalendarEventId", "clientId", "projectId", "shootId", "leadId", notes, "createdAt", "updatedAt", "createdBy", "updatedBy", "recurringRuleId") FROM stdin;
\.


--
-- Data for Name: ChecklistItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ChecklistItem" (id, title, "isCompleted", "taskId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Client" (id, "clientCode", "businessName", "contactPerson", phone, email, instagram, website, address, city, state, country, "postalCode", "businessType", "gstNumber", notes, "createdAt", "updatedAt", "archivedAt", "createdBy", "updatedBy", "driveFolderId", "driveFolderUrl") FROM stdin;
cms6mps110000h5mpghhaq0dm	C-STARK-01	Stark Industries	Tony Stark	+1 (555) 000-1111	tony@starkindustries.com	\N	\N	10880 Malibu Point, Malibu, CA 90265	\N	\N	\N	\N	OTHER	\N	\N	2026-07-29 22:01:06.851	2026-07-29 22:01:06.851	\N	\N	\N	\N	\N
cms6mpsjc0001h5mpf8buo3qc	C-WAYNE-02	Wayne Enterprises	Bruce Wayne	+1 (555) 000-2222	bruce@wayneenterprises.com	\N	\N	1007 Mountain Drive, Gotham City	\N	\N	\N	\N	OTHER	\N	\N	2026-07-29 22:01:07.513	2026-07-29 22:01:07.513	\N	\N	\N	\N	\N
cms6mpsrl0002h5mprf5wxkfz	C-LEX-03	LexCorp	Lex Luthor	+1 (555) 000-3333	lex@lexcorp.com	\N	\N	LexCorp Tower, Metropolis	\N	\N	\N	\N	OTHER	\N	\N	2026-07-29 22:01:07.81	2026-07-29 22:01:07.81	\N	\N	\N	\N	\N
\.


--
-- Data for Name: Communication; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Communication" (id, type, direction, subject, body, status, error, "leadId", "clientId", "projectId", "invoiceId", "quotationId", "paymentId", "eventId", "sentAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: CommunicationAttachment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CommunicationAttachment" (id, "fileName", "fileUrl", "fileSize", "fileType", "communicationId", "createdAt") FROM stdin;
\.


--
-- Data for Name: CommunicationTemplate; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CommunicationTemplate" (id, title, category, type, subject, body, version, "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: Deliverable; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Deliverable" (id, type, "assignedEditor", status, "dueDate", "completionDate", "shootId", "createdAt", "updatedAt", priority, "reviewDate", "reviewStatus", "reviewerNotes") FROM stdin;
\.


--
-- Data for Name: DeliverableFile; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."DeliverableFile" (id, "deliverableId", name, url, "sizeBytes", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: DeliverableVersion; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."DeliverableVersion" (id, "deliverableId", "versionNumber", "changeNotes", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: Delivery; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Delivery" (id, title, description, status, "deliveryLink", password, "expiryDate", "projectId", "sentAt", "viewedAt", "downloadedAt", "confirmedAt", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DeliveryVersion; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."DeliveryVersion" (id, version, changes, "deliveryLink", "deliveryId", "createdAt") FROM stdin;
\.


--
-- Data for Name: EventParticipant; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."EventParticipant" (id, "eventId", "userId", name, email, status) FROM stdin;
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Expense" (id, title, amount, date, "paymentMethod", notes, "clientId", "projectId", "createdAt", "categoryId", "receiptUrl", vendor) FROM stdin;
\.


--
-- Data for Name: ExpenseCategory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ExpenseCategory" (id, name, description, color, "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FinancialReport; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."FinancialReport" (id, title, type, "periodStart", "periodEnd", data, "fileUrl", "generatedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: FollowUp; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."FollowUp" (id, title, description, "dueDate", status, priority, "communicationId", "leadId", "clientId", "projectId", "assignedToId", "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: Holiday; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Holiday" (id, name, date, "isYearly") FROM stdin;
\.


--
-- Data for Name: IntegrationSettings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."IntegrationSettings" (id, provider, "accessToken", "refreshToken", "tokenExpiry", "rootFolderId", "rootFolderUrl", "storageUsageBytes", "fileCount", "lastSyncAt", "syncStatus", "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: InternalNote; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."InternalNote" (id, content, "isPinned", "leadId", "clientId", "projectId", "invoiceId", "quotationId", "paymentId", "eventId", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Invoice" (id, "invoiceNumber", "issueDate", "dueDate", subtotal, discount, tax, total, status, notes, "projectId", "clientId", "createdAt", "updatedAt") FROM stdin;
cms6ndz70000bh51ocw59hiyw	INV-2026-001	2026-07-29 22:19:55.884	2026-08-05 22:19:55.595	10000.00	\N	\N	10000.00	SENT	\N	cms6ndx7e0001h51o0qejxz1d	cms6mps110000h5mpghhaq0dm	2026-07-29 22:19:55.884	2026-07-29 22:19:55.884
cms6ndzn6000dh51o7vtws66s	INV-2026-002	2026-07-29 22:19:56.465	2026-08-05 22:19:55.595	15000.00	\N	\N	15000.00	SENT	\N	cms6ndxne0003h51o78af1ev8	cms6mpsjc0001h5mpf8buo3qc	2026-07-29 22:19:56.466	2026-07-29 22:19:56.466
\.


--
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."InvoiceItem" (id, description, quantity, "unitPrice", total, "invoiceId") FROM stdin;
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Lead" (id, "businessName", "contactPerson", phone, email, instagram, website, address, city, state, country, "postalCode", "businessType", "leadSource", status, priority, budget, currency, "leadScore", notes, "sourceEmailId", "convertedToClientId", "createdAt", "updatedAt", "archivedAt", "createdById", "updatedById", whatsapp, "closingRemarks", "lastContactDate", "lostReason", "nextFollowUpDate", "ownerId", "ownerRemarks", "preferredContactMethod", "serviceInterested") FROM stdin;
cms7llgs30000h5ek0b62ief4	LexCorp Sub-brand	Mercy Graves	+1 555-0199	mercy@lexcorp.com	\N	\N	\N	\N	\N	\N	\N	OTHER	WEBSITE	NEW	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	\N	\N	\N	\N	\N	cms6mo1eg005kh5ivj4af157h	\N	EMAIL	Corporate Headshots
cms7llgs40001h5ek228b2n5x	Daily Planet	Clark Kent	\N	ckent@dailyplanet.com	\N	\N	\N	\N	\N	\N	\N	OTHER	REFERRAL	CONTACTED	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	+1 555-0200	\N	2026-07-29 14:17:32.209	\N	2026-07-31 14:17:32.209	cms6mo1eg005kh5ivj4af157h	Needs pricing for a 3-day event.	WHATSAPP	Event Photography
cms7llgs40002h5ekcsi4nhsx	\N	Bruce Wayne	+1 555-0201	\N	\N	\N	\N	\N	\N	\N	\N	OTHER	PHONE_CALL	REQUIREMENT_DISCUSSION	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	\N	\N	2026-07-29 14:17:32.209	\N	2026-07-31 14:17:32.209	cms6mo1eg005kh5ivj4af157h	\N	PHONE	Automotive Shoot
cms7llgs40003h5ektexnecql	Stark Industries	Pepper Potts	\N	pepper@stark.com	\N	\N	\N	\N	\N	\N	\N	OTHER	INSTAGRAM	QUOTE_SENT	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	\N	\N	2026-07-29 14:17:32.209	\N	2026-08-06 14:17:32.209	cms6mo1eg005kh5ivj4af157h	Sent quote #1002.	\N	Product Photography
cms7llgs40004h5ekeuev9n7y	Queen Consolidated	Oliver Queen	+1 555-0202	\N	\N	\N	\N	\N	\N	\N	\N	OTHER	MANUAL	NEGOTIATION	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	\N	\N	\N	\N	\N	cms6mo1eg005kh5ivj4af157h	Asking for a 10% discount.	\N	Campaign Video
cms7llgs40005h5ekxysbbqj1	Wayne Enterprises	Lucius Fox	\N	lfox@wayne.com	\N	\N	\N	\N	\N	\N	\N	OTHER	OTHER	QUOTE_APPROVED	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	\N	\N	\N	\N	\N	cms6mo1eg005kh5ivj4af157h	\N	\N	Facility Tour Video
cms7llgs40006h5ekft2wrhwo	\N	Diana Prince	\N	diana@themyscira.com	\N	\N	\N	\N	\N	\N	\N	OTHER	WALK_IN	ADVANCE_PENDING	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	\N	\N	\N	\N	\N	cms6mo1eg005kh5ivj4af157h	\N	\N	Portrait Session
cms7llgs40007h5eklbpyfl45	Oscorp	Norman Osborn	+1 555-0203	\N	\N	\N	\N	\N	\N	\N	\N	OTHER	FACEBOOK	LOST	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	\N	Went with a cheaper option.	\N	PRICE_TOO_HIGH	\N	cms6mo1eg005kh5ivj4af157h	\N	\N	Commercial Shoot
cms7llgs40008h5ektu8czlx7	\N	Peter Parker	\N	\N	\N	\N	\N	\N	\N	\N	\N	OTHER	WHATSAPP	CONVERTED	MEDIUM	\N	USD	0	\N	\N	\N	2026-07-30 14:17:32.212	2026-07-30 14:17:32.212	\N	\N	\N	+1 555-0204	\N	\N	\N	\N	cms6mo1eg005kh5ivj4af157h	\N	\N	Freelance Cover
\.


--
-- Data for Name: LeadAttachment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LeadAttachment" (id, "fileName", "fileUrl", "fileSize", "fileType", "leadId", "clientId", "projectId", "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: LeadCommunication; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LeadCommunication" (id, type, summary, details, "leadId", "clientId", "projectId", "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: LeadReminder; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LeadReminder" (id, type, date, "time", completed, "leadId", "clientId", "projectId", "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: LeadTag; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LeadTag" (id, "leadId", "tagId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Notification" (id, title, message, type, status, priority, "dueDate", "snoozedUntil", "leadId", "clientId", "projectId", "shootId", "invoiceId", "userId", "createdAt", "updatedAt", "actionUrl", "isRead") FROM stdin;
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PasswordResetToken" (id, email, "tokenHash", "expiresAt", "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Payment" (id, amount, "paymentDate", "paymentMethod", "referenceNumber", notes, "invoiceId", "projectId", "clientId", "createdAt", "bankReference", "paymentScreenshotUrl", "upiTransactionId") FROM stdin;
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Permission" (id, action, description, module, "createdAt") FROM stdin;
cms6mnei30000h5ivb937a3i9	dashboard.view	Allows dashboard.view	Dashboard	2026-07-29 21:59:16.011
cms6mneys0001h5ivo4mwfn4y	dashboard.manage	Allows dashboard.manage	Dashboard	2026-07-29 21:59:16.612
cms6mnf700002h5ivd4eww6ct	workspace.view	Allows workspace.view	Workspace	2026-07-29 21:59:16.908
cms6mnff20003h5ivj9l06cvh	workspace.manage	Allows workspace.manage	Workspace	2026-07-29 21:59:17.199
cms6mnfn60004h5ivopvlm8ym	leads.view	Allows leads.view	Leads	2026-07-29 21:59:17.49
cms6mnfv90005h5ivlk12bvdc	leads.create	Allows leads.create	Leads	2026-07-29 21:59:17.782
cms6mng3d0006h5ivhrb7emvm	leads.update	Allows leads.update	Leads	2026-07-29 21:59:18.074
cms6mngbe0007h5iv8tyqewh8	leads.delete	Allows leads.delete	Leads	2026-07-29 21:59:18.362
cms6mngjh0008h5ivh6dsgee8	clients.view	Allows clients.view	Clients	2026-07-29 21:59:18.653
cms6mngrk0009h5iv1lht6vss	clients.create	Allows clients.create	Clients	2026-07-29 21:59:18.944
cms6mngzl000ah5ivispcjcsa	clients.update	Allows clients.update	Clients	2026-07-29 21:59:19.233
cms6mnh7q000bh5iv50zfo28z	clients.delete	Allows clients.delete	Clients	2026-07-29 21:59:19.526
cms6mnhg1000ch5ivxhbyxvx3	projects.view	Allows projects.view	Projects	2026-07-29 21:59:19.825
cms6mnho6000dh5ivgfestt5q	projects.create	Allows projects.create	Projects	2026-07-29 21:59:20.118
cms6mnhwa000eh5iv0qoyh8a0	projects.update	Allows projects.update	Projects	2026-07-29 21:59:20.41
cms6mni4g000fh5ivowz1z78o	projects.delete	Allows projects.delete	Projects	2026-07-29 21:59:20.705
cms6mnich000gh5ivorlhwkup	projects.assign	Allows projects.assign	Projects	2026-07-29 21:59:20.994
cms6mnikk000hh5iv21tn4uxk	projects.approve	Allows projects.approve	Projects	2026-07-29 21:59:21.285
cms6mnisp000ih5ivd48mh76y	shoots.view	Allows shoots.view	Shoots	2026-07-29 21:59:21.577
cms6mnj0q000jh5iv4yqjs2mq	shoots.create	Allows shoots.create	Shoots	2026-07-29 21:59:21.867
cms6mnj8u000kh5ivjx1bk979	shoots.update	Allows shoots.update	Shoots	2026-07-29 21:59:22.158
cms6mnjgx000lh5iv7bipbab0	shoots.delete	Allows shoots.delete	Shoots	2026-07-29 21:59:22.449
cms6mnjqb000mh5ive47cpm21	deliverables.view	Allows deliverables.view	Deliverables	2026-07-29 21:59:22.788
cms6mnjyf000nh5ivowt5cmo4	deliverables.create	Allows deliverables.create	Deliverables	2026-07-29 21:59:23.079
cms6mnk6e000oh5ivu1zp54qe	deliverables.update	Allows deliverables.update	Deliverables	2026-07-29 21:59:23.367
cms6mnkl2000ph5ivah71u20h	deliverables.delete	Allows deliverables.delete	Deliverables	2026-07-29 21:59:23.894
cms6mnkt4000qh5iv7j7l3by6	deliverables.review	Allows deliverables.review	Deliverables	2026-07-29 21:59:24.185
cms6mnl23000rh5iv2vktf69s	calendar.view	Allows calendar.view	Calendar	2026-07-29 21:59:24.508
cms6mnla6000sh5ivyppttnr8	calendar.manage	Allows calendar.manage	Calendar	2026-07-29 21:59:24.798
cms6mnli7000th5iv66nlhu7g	crm.manage	Allows crm.manage	CRM	2026-07-29 21:59:25.088
cms6mnlq9000uh5ivq4gxnby4	finance.view	Allows finance.view	Finance	2026-07-29 21:59:25.377
cms6mnlye000vh5ivoxg006iy	finance.manage	Allows finance.manage	Finance	2026-07-29 21:59:25.67
cms6mnm6h000wh5ivrazry4xf	finance.export	Allows finance.export	Finance	2026-07-29 21:59:25.961
cms6mnmej000xh5ivjrratxsa	invoices.manage	Allows invoices.manage	Finance	2026-07-29 21:59:26.251
cms6mnmmk000yh5ivcoihd5t7	payments.manage	Allows payments.manage	Finance	2026-07-29 21:59:26.541
cms6mnmum000zh5iv5yibgvfe	expenses.manage	Allows expenses.manage	Finance	2026-07-29 21:59:26.83
cms6mnn2o0010h5iv5oto2hg7	reports.view	Allows reports.view	Reports	2026-07-29 21:59:27.12
cms6mnnaq0011h5ivw66matw5	users.manage	Allows users.manage	Users	2026-07-29 21:59:27.411
cms6mnnit0012h5ivimigo2mg	roles.manage	Allows roles.manage	Settings	2026-07-29 21:59:27.702
cms6mnnqv0013h5ivsit6coz3	settings.manage	Allows settings.manage	Settings	2026-07-29 21:59:27.991
cms6mnnyx0014h5iv3juq9a05	backup.manage	Allows backup.manage	Settings	2026-07-29 21:59:28.281
cms6mno730015h5ivm4km23mx	ownership.transfer	Allows ownership.transfer	System	2026-07-29 21:59:28.576
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Project" (id, "projectCode", title, description, category, status, priority, "paymentStatus", "startDate", "endDate", "deliveryDate", "quotationAmount", "advanceAmount", "totalAmount", "balanceAmount", "profitAmount", notes, "clientId", "createdAt", "updatedAt", "archivedAt", "createdBy", "updatedBy", "backupFolderId", "backupFolderUrl", "deliveryFolderId", "deliveryFolderUrl", "documentsFolderId", "documentsFolderUrl", "driveRootFolderId", "driveRootFolderUrl", "editFolderId", "editFolderUrl", "fileCount", "lastSyncAt", "rawFolderId", "rawFolderUrl", "referencesFolderId", "referencesFolderUrl", "socialFolderId", "socialFolderUrl", "storageUsageBytes", "syncStatus") FROM stdin;
cms6ndx7e0001h51o0qejxz1d	P-STARK-2026	Iron Man Suit Promo	\N	OTHER	SHOOTING	MEDIUM	PENDING	\N	\N	\N	\N	\N	\N	\N	\N	\N	cms6mps110000h5mpghhaq0dm	2026-07-29 22:19:53.305	2026-07-29 22:19:53.305	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	0	IDLE
cms6ndxne0003h51o78af1ev8	P-WAYNE-2026	Gotham Nightlife Series	\N	OTHER	PLANNED	MEDIUM	PENDING	\N	\N	\N	\N	\N	\N	\N	\N	\N	cms6mpsjc0001h5mpf8buo3qc	2026-07-29 22:19:53.882	2026-07-29 22:19:53.882	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	0	IDLE
\.


--
-- Data for Name: Quotation; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Quotation" (id, "quotationNumber", "issueDate", "validUntil", subtotal, discount, tax, total, status, notes, "termsAndConditions", version, "parentQuotationId", "projectId", "clientId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: QuotationItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."QuotationItem" (id, description, quantity, "unitPrice", total, "quotationId") FROM stdin;
\.


--
-- Data for Name: RecurringRule; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."RecurringRule" (id, frequency, "interval", "endDate", count) FROM stdin;
\.


--
-- Data for Name: Reminder; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Reminder" (id, title, description, "triggerDate", type, "isSent", "eventId", "taskId", "projectId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Resource; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Resource" (id, name, type, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ResourceAssignment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ResourceAssignment" (id, "resourceId", "eventId", status) FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Role" (id, name, description, "isSystem", "createdAt", "updatedAt") FROM stdin;
cms6mnox10016h5ivv9yskd5j	Owner	Full unrestricted access to the entire system.	t	2026-07-29 21:59:29.509	2026-07-29 21:59:29.509
cms6mnr32002dh5iv57dakdge	Admin	Runs the business. Full access except ownership, roles, and backups.	t	2026-07-29 21:59:32.032	2026-07-29 21:59:32.032
cms6mnsg1003hh5iv07uueyde	Operations Manager	Runs daily operations across leads, clients, projects, and calendar.	t	2026-07-29 21:59:34.081	2026-07-29 21:59:34.081
cms6mnts6004bh5ivwdi6gu4s	Sales & CRM Manager	Handles leads, clients, quotations and follow-ups.	t	2026-07-29 21:59:35.815	2026-07-29 21:59:35.815
cms6mnv4i004nh5ivcm38knhi	Finance Manager	Manages invoices, payments, expenses, and financial reports.	t	2026-07-29 21:59:37.554	2026-07-29 21:59:37.554
cms6mnwhd004wh5iv72mcu6d0	Creative Director	Oversees creative output, reviews, and team assignments.	t	2026-07-29 21:59:39.314	2026-07-29 21:59:39.314
cms6mnxn50055h5iv38fgydd4	Creative	Photographer, videographer, editor, etc. Accesses assigned work.	t	2026-07-29 21:59:40.817	2026-07-29 21:59:40.817
cms6mnz12005dh5ivzbpd95nc	Viewer	Read-only access to assigned items.	t	2026-07-29 21:59:42.614	2026-07-29 21:59:42.614
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."RolePermission" (id, "roleId", "permissionId") FROM stdin;
cms6mnpxy0017h5iviovi6mdg	cms6mnox10016h5ivv9yskd5j	cms6mnei30000h5ivb937a3i9
cms6mnpxy0018h5iv07kpufpo	cms6mnox10016h5ivv9yskd5j	cms6mneys0001h5ivo4mwfn4y
cms6mnpxy0019h5ivi4bowcq2	cms6mnox10016h5ivv9yskd5j	cms6mnf700002h5ivd4eww6ct
cms6mnpxy001ah5ivhd7i37yx	cms6mnox10016h5ivv9yskd5j	cms6mnff20003h5ivj9l06cvh
cms6mnpxy001bh5ivajgtp1ms	cms6mnox10016h5ivv9yskd5j	cms6mnfn60004h5ivopvlm8ym
cms6mnpxy001ch5ivoar6w0ih	cms6mnox10016h5ivv9yskd5j	cms6mnfv90005h5ivlk12bvdc
cms6mnpxy001dh5ivwvx7z7v2	cms6mnox10016h5ivv9yskd5j	cms6mng3d0006h5ivhrb7emvm
cms6mnpxy001eh5ivz52wtsr9	cms6mnox10016h5ivv9yskd5j	cms6mngbe0007h5iv8tyqewh8
cms6mnpxy001fh5iv3aex1zh9	cms6mnox10016h5ivv9yskd5j	cms6mngjh0008h5ivh6dsgee8
cms6mnpxy001gh5ivdz68ds89	cms6mnox10016h5ivv9yskd5j	cms6mngrk0009h5iv1lht6vss
cms6mnpxy001hh5ivcb0skfap	cms6mnox10016h5ivv9yskd5j	cms6mngzl000ah5ivispcjcsa
cms6mnpxy001ih5ive71l1udo	cms6mnox10016h5ivv9yskd5j	cms6mnh7q000bh5iv50zfo28z
cms6mnpxy001jh5ivfv8n2ios	cms6mnox10016h5ivv9yskd5j	cms6mnhg1000ch5ivxhbyxvx3
cms6mnpxy001kh5ivpevzv6fc	cms6mnox10016h5ivv9yskd5j	cms6mnho6000dh5ivgfestt5q
cms6mnpxy001lh5ivbybyjwxs	cms6mnox10016h5ivv9yskd5j	cms6mnhwa000eh5iv0qoyh8a0
cms6mnpxy001mh5ivgep4831l	cms6mnox10016h5ivv9yskd5j	cms6mni4g000fh5ivowz1z78o
cms6mnpxy001nh5iv98imkzr3	cms6mnox10016h5ivv9yskd5j	cms6mnich000gh5ivorlhwkup
cms6mnpxy001oh5ivfmsxc8sc	cms6mnox10016h5ivv9yskd5j	cms6mnikk000hh5iv21tn4uxk
cms6mnpxy001ph5ivcnlbdggn	cms6mnox10016h5ivv9yskd5j	cms6mnisp000ih5ivd48mh76y
cms6mnpxy001qh5ivumnuzjg6	cms6mnox10016h5ivv9yskd5j	cms6mnj0q000jh5iv4yqjs2mq
cms6mnpxy001rh5ivb39qrj8r	cms6mnox10016h5ivv9yskd5j	cms6mnj8u000kh5ivjx1bk979
cms6mnpxy001sh5iv51cv2vb1	cms6mnox10016h5ivv9yskd5j	cms6mnjgx000lh5iv7bipbab0
cms6mnpxy001th5ivucz77ckp	cms6mnox10016h5ivv9yskd5j	cms6mnjqb000mh5ive47cpm21
cms6mnpxy001uh5ivg3kuk9tu	cms6mnox10016h5ivv9yskd5j	cms6mnjyf000nh5ivowt5cmo4
cms6mnpxy001vh5ivfzbsrrxn	cms6mnox10016h5ivv9yskd5j	cms6mnk6e000oh5ivu1zp54qe
cms6mnpxy001wh5iv0zk267p5	cms6mnox10016h5ivv9yskd5j	cms6mnkl2000ph5ivah71u20h
cms6mnpxy001xh5ivvcehdb1u	cms6mnox10016h5ivv9yskd5j	cms6mnkt4000qh5iv7j7l3by6
cms6mnpxy001yh5ivwc9z34on	cms6mnox10016h5ivv9yskd5j	cms6mnl23000rh5iv2vktf69s
cms6mnpxy001zh5iv1sp1tdhh	cms6mnox10016h5ivv9yskd5j	cms6mnla6000sh5ivyppttnr8
cms6mnpxy0020h5ivg2edatdr	cms6mnox10016h5ivv9yskd5j	cms6mnli7000th5iv66nlhu7g
cms6mnpxy0021h5ivkm87kdun	cms6mnox10016h5ivv9yskd5j	cms6mnlq9000uh5ivq4gxnby4
cms6mnpxy0022h5ivkhdylmrr	cms6mnox10016h5ivv9yskd5j	cms6mnlye000vh5ivoxg006iy
cms6mnpxy0023h5ivgeaj8e6f	cms6mnox10016h5ivv9yskd5j	cms6mnm6h000wh5ivrazry4xf
cms6mnpxy0024h5ivgr8x4mcw	cms6mnox10016h5ivv9yskd5j	cms6mnmej000xh5ivjrratxsa
cms6mnpxy0025h5ivmd4z6z3g	cms6mnox10016h5ivv9yskd5j	cms6mnmmk000yh5ivcoihd5t7
cms6mnpxy0026h5ivb8owsrwp	cms6mnox10016h5ivv9yskd5j	cms6mnmum000zh5iv5yibgvfe
cms6mnpxy0027h5ivrr0v5mlx	cms6mnox10016h5ivv9yskd5j	cms6mnn2o0010h5iv5oto2hg7
cms6mnpxy0028h5iva96ap6co	cms6mnox10016h5ivv9yskd5j	cms6mnnaq0011h5ivw66matw5
cms6mnpxy0029h5ivhck5ani3	cms6mnox10016h5ivv9yskd5j	cms6mnnit0012h5ivimigo2mg
cms6mnpxy002ah5iv67cokaz6	cms6mnox10016h5ivv9yskd5j	cms6mnnqv0013h5ivsit6coz3
cms6mnpxy002bh5iv57ce7382	cms6mnox10016h5ivv9yskd5j	cms6mnnyx0014h5iv3juq9a05
cms6mnpxy002ch5iv2edx1vj4	cms6mnox10016h5ivv9yskd5j	cms6mno730015h5ivm4km23mx
cms6mnrjc002eh5iveosfcad5	cms6mnr32002dh5iv57dakdge	cms6mnei30000h5ivb937a3i9
cms6mnrjc002fh5iv723vpt9l	cms6mnr32002dh5iv57dakdge	cms6mneys0001h5ivo4mwfn4y
cms6mnrjc002gh5ivk2c9w38l	cms6mnr32002dh5iv57dakdge	cms6mnf700002h5ivd4eww6ct
cms6mnrjc002hh5iv6fmua9mw	cms6mnr32002dh5iv57dakdge	cms6mnff20003h5ivj9l06cvh
cms6mnrjc002ih5ivdj3ciby9	cms6mnr32002dh5iv57dakdge	cms6mnfn60004h5ivopvlm8ym
cms6mnrjc002jh5ivz2hgamw5	cms6mnr32002dh5iv57dakdge	cms6mnfv90005h5ivlk12bvdc
cms6mnrjc002kh5ivkdrm4hir	cms6mnr32002dh5iv57dakdge	cms6mng3d0006h5ivhrb7emvm
cms6mnrjc002lh5ivlxhmgrfd	cms6mnr32002dh5iv57dakdge	cms6mngbe0007h5iv8tyqewh8
cms6mnrjc002mh5ivrsxhlxbs	cms6mnr32002dh5iv57dakdge	cms6mngjh0008h5ivh6dsgee8
cms6mnrjc002nh5ivf7pppo71	cms6mnr32002dh5iv57dakdge	cms6mngrk0009h5iv1lht6vss
cms6mnrjc002oh5ivzjqpieu8	cms6mnr32002dh5iv57dakdge	cms6mngzl000ah5ivispcjcsa
cms6mnrjc002ph5ivtpapvopn	cms6mnr32002dh5iv57dakdge	cms6mnh7q000bh5iv50zfo28z
cms6mnrjd002qh5ivgwy6n1qt	cms6mnr32002dh5iv57dakdge	cms6mnhg1000ch5ivxhbyxvx3
cms6mnrjd002rh5ivv2tlig37	cms6mnr32002dh5iv57dakdge	cms6mnho6000dh5ivgfestt5q
cms6mnrjd002sh5iv4otydso6	cms6mnr32002dh5iv57dakdge	cms6mnhwa000eh5iv0qoyh8a0
cms6mnrjd002th5iv6jlivzbd	cms6mnr32002dh5iv57dakdge	cms6mni4g000fh5ivowz1z78o
cms6mnrjd002uh5ivco9d5ae8	cms6mnr32002dh5iv57dakdge	cms6mnich000gh5ivorlhwkup
cms6mnrjd002vh5iv2p5uif0y	cms6mnr32002dh5iv57dakdge	cms6mnikk000hh5iv21tn4uxk
cms6mnrjd002wh5ivx2bjqzxy	cms6mnr32002dh5iv57dakdge	cms6mnisp000ih5ivd48mh76y
cms6mnrjd002xh5ivdf8z4tyl	cms6mnr32002dh5iv57dakdge	cms6mnj0q000jh5iv4yqjs2mq
cms6mnrjd002yh5ivemetm1c1	cms6mnr32002dh5iv57dakdge	cms6mnj8u000kh5ivjx1bk979
cms6mnrjd002zh5iv0a708k86	cms6mnr32002dh5iv57dakdge	cms6mnjgx000lh5iv7bipbab0
cms6mnrjd0030h5ivifj686vy	cms6mnr32002dh5iv57dakdge	cms6mnjqb000mh5ive47cpm21
cms6mnrjd0031h5ivr1cr3ebs	cms6mnr32002dh5iv57dakdge	cms6mnjyf000nh5ivowt5cmo4
cms6mnrjd0032h5ivvbdn77pe	cms6mnr32002dh5iv57dakdge	cms6mnk6e000oh5ivu1zp54qe
cms6mnrjd0033h5iv163m9q73	cms6mnr32002dh5iv57dakdge	cms6mnkl2000ph5ivah71u20h
cms6mnrjd0034h5ivnnhbdb3d	cms6mnr32002dh5iv57dakdge	cms6mnkt4000qh5iv7j7l3by6
cms6mnrjd0035h5ivqayy85rn	cms6mnr32002dh5iv57dakdge	cms6mnl23000rh5iv2vktf69s
cms6mnrjd0036h5iv61zonlce	cms6mnr32002dh5iv57dakdge	cms6mnla6000sh5ivyppttnr8
cms6mnrjd0037h5ivqam0gxc8	cms6mnr32002dh5iv57dakdge	cms6mnli7000th5iv66nlhu7g
cms6mnrjd0038h5iveakdqna8	cms6mnr32002dh5iv57dakdge	cms6mnlq9000uh5ivq4gxnby4
cms6mnrjd0039h5iv8i2x6o1k	cms6mnr32002dh5iv57dakdge	cms6mnlye000vh5ivoxg006iy
cms6mnrjd003ah5iv3xenildf	cms6mnr32002dh5iv57dakdge	cms6mnm6h000wh5ivrazry4xf
cms6mnrjd003bh5ivc7zybyrw	cms6mnr32002dh5iv57dakdge	cms6mnmej000xh5ivjrratxsa
cms6mnrjd003ch5ivppi0cu9h	cms6mnr32002dh5iv57dakdge	cms6mnmmk000yh5ivcoihd5t7
cms6mnrjd003dh5ivufvb1z22	cms6mnr32002dh5iv57dakdge	cms6mnmum000zh5iv5yibgvfe
cms6mnrjd003eh5ivp11hccpo	cms6mnr32002dh5iv57dakdge	cms6mnn2o0010h5iv5oto2hg7
cms6mnrjd003fh5ivcugg6gxs	cms6mnr32002dh5iv57dakdge	cms6mnnaq0011h5ivw66matw5
cms6mnrjd003gh5iv9wqdo8ii	cms6mnr32002dh5iv57dakdge	cms6mnnqv0013h5ivsit6coz3
cms6mnsw4003ih5iv8z6dbjn2	cms6mnsg1003hh5iv07uueyde	cms6mnei30000h5ivb937a3i9
cms6mnsw4003jh5ivxjh86q0x	cms6mnsg1003hh5iv07uueyde	cms6mneys0001h5ivo4mwfn4y
cms6mnsw4003kh5ivw2yzlj3c	cms6mnsg1003hh5iv07uueyde	cms6mnf700002h5ivd4eww6ct
cms6mnsw4003lh5ivwvabniy3	cms6mnsg1003hh5iv07uueyde	cms6mnfn60004h5ivopvlm8ym
cms6mnsw4003mh5iv463lyul8	cms6mnsg1003hh5iv07uueyde	cms6mnfv90005h5ivlk12bvdc
cms6mnsw4003nh5ivzf6zla88	cms6mnsg1003hh5iv07uueyde	cms6mng3d0006h5ivhrb7emvm
cms6mnsw4003oh5ivrlcf5cjf	cms6mnsg1003hh5iv07uueyde	cms6mngbe0007h5iv8tyqewh8
cms6mnsw4003ph5ivkfcjup9a	cms6mnsg1003hh5iv07uueyde	cms6mngjh0008h5ivh6dsgee8
cms6mnsw4003qh5ivfurstfpb	cms6mnsg1003hh5iv07uueyde	cms6mngrk0009h5iv1lht6vss
cms6mnsw4003rh5ivh1cyj5hr	cms6mnsg1003hh5iv07uueyde	cms6mngzl000ah5ivispcjcsa
cms6mnsw4003sh5ivrc44fu4t	cms6mnsg1003hh5iv07uueyde	cms6mnh7q000bh5iv50zfo28z
cms6mnsw4003th5ivv47116xp	cms6mnsg1003hh5iv07uueyde	cms6mnhg1000ch5ivxhbyxvx3
cms6mnsw4003uh5ivdciqcs95	cms6mnsg1003hh5iv07uueyde	cms6mnho6000dh5ivgfestt5q
cms6mnsw4003vh5ivw97ti0eo	cms6mnsg1003hh5iv07uueyde	cms6mnhwa000eh5iv0qoyh8a0
cms6mnsw4003wh5iv0tmcn5eu	cms6mnsg1003hh5iv07uueyde	cms6mni4g000fh5ivowz1z78o
cms6mnsw4003xh5ivc2a377bu	cms6mnsg1003hh5iv07uueyde	cms6mnich000gh5ivorlhwkup
cms6mnsw4003yh5ivc885388d	cms6mnsg1003hh5iv07uueyde	cms6mnikk000hh5iv21tn4uxk
cms6mnsw4003zh5ivtlcjugcg	cms6mnsg1003hh5iv07uueyde	cms6mnisp000ih5ivd48mh76y
cms6mnsw40040h5ivpvt4oq2j	cms6mnsg1003hh5iv07uueyde	cms6mnj0q000jh5iv4yqjs2mq
cms6mnsw40041h5iv5wb3dja4	cms6mnsg1003hh5iv07uueyde	cms6mnj8u000kh5ivjx1bk979
cms6mnsw40042h5ivs26s7hhc	cms6mnsg1003hh5iv07uueyde	cms6mnjgx000lh5iv7bipbab0
cms6mnsw40043h5iv6a5wy50d	cms6mnsg1003hh5iv07uueyde	cms6mnjqb000mh5ive47cpm21
cms6mnsw40044h5iv1gzalt3b	cms6mnsg1003hh5iv07uueyde	cms6mnjyf000nh5ivowt5cmo4
cms6mnsw40045h5iv7jjhubxy	cms6mnsg1003hh5iv07uueyde	cms6mnk6e000oh5ivu1zp54qe
cms6mnsw40046h5ivagxji0xg	cms6mnsg1003hh5iv07uueyde	cms6mnkl2000ph5ivah71u20h
cms6mnsw40047h5ivueh9f6xt	cms6mnsg1003hh5iv07uueyde	cms6mnkt4000qh5iv7j7l3by6
cms6mnsw40048h5ivklve8zak	cms6mnsg1003hh5iv07uueyde	cms6mnl23000rh5iv2vktf69s
cms6mnsw40049h5iv5xjogueu	cms6mnsg1003hh5iv07uueyde	cms6mnla6000sh5ivyppttnr8
cms6mnsw4004ah5ivt1ma441n	cms6mnsg1003hh5iv07uueyde	cms6mnn2o0010h5iv5oto2hg7
cms6mnu8e004ch5ivquvihcux	cms6mnts6004bh5ivwdi6gu4s	cms6mnei30000h5ivb937a3i9
cms6mnu8e004dh5ivagdktz59	cms6mnts6004bh5ivwdi6gu4s	cms6mnfn60004h5ivopvlm8ym
cms6mnu8e004eh5ivabb1ak93	cms6mnts6004bh5ivwdi6gu4s	cms6mnfv90005h5ivlk12bvdc
cms6mnu8e004fh5ivbrr02hxm	cms6mnts6004bh5ivwdi6gu4s	cms6mng3d0006h5ivhrb7emvm
cms6mnu8e004gh5ivc8vgta3y	cms6mnts6004bh5ivwdi6gu4s	cms6mngbe0007h5iv8tyqewh8
cms6mnu8e004hh5ivz4ytad92	cms6mnts6004bh5ivwdi6gu4s	cms6mngjh0008h5ivh6dsgee8
cms6mnu8e004ih5iv8s9701n1	cms6mnts6004bh5ivwdi6gu4s	cms6mngrk0009h5iv1lht6vss
cms6mnu8e004jh5ivnlucy6r0	cms6mnts6004bh5ivwdi6gu4s	cms6mngzl000ah5ivispcjcsa
cms6mnu8e004kh5ivtevx44az	cms6mnts6004bh5ivwdi6gu4s	cms6mnh7q000bh5iv50zfo28z
cms6mnu8e004lh5ivl8n5jw96	cms6mnts6004bh5ivwdi6gu4s	cms6mnli7000th5iv66nlhu7g
cms6mnu8e004mh5ivve061qjr	cms6mnts6004bh5ivwdi6gu4s	cms6mnn2o0010h5iv5oto2hg7
cms6mnvkp004oh5iva7rhe6lr	cms6mnv4i004nh5ivcm38knhi	cms6mnei30000h5ivb937a3i9
cms6mnvkp004ph5iv7l0sn11l	cms6mnv4i004nh5ivcm38knhi	cms6mnlq9000uh5ivq4gxnby4
cms6mnvkp004qh5ivaku1hxjo	cms6mnv4i004nh5ivcm38knhi	cms6mnlye000vh5ivoxg006iy
cms6mnvkp004rh5ivtg9fukeh	cms6mnv4i004nh5ivcm38knhi	cms6mnm6h000wh5ivrazry4xf
cms6mnvkp004sh5ivbghraucd	cms6mnv4i004nh5ivcm38knhi	cms6mnmej000xh5ivjrratxsa
cms6mnvkp004th5ivvfueoj7s	cms6mnv4i004nh5ivcm38knhi	cms6mnmmk000yh5ivcoihd5t7
cms6mnvkp004uh5ivswgw4pe5	cms6mnv4i004nh5ivcm38knhi	cms6mnmum000zh5iv5yibgvfe
cms6mnvkp004vh5ivjuqoyi12	cms6mnv4i004nh5ivcm38knhi	cms6mnn2o0010h5iv5oto2hg7
cms6mnwy8004xh5ivfqz13jqa	cms6mnwhd004wh5iv72mcu6d0	cms6mnei30000h5ivb937a3i9
cms6mnwy8004yh5ivdi4auez8	cms6mnwhd004wh5iv72mcu6d0	cms6mnhg1000ch5ivxhbyxvx3
cms6mnwy8004zh5iv5n33zclq	cms6mnwhd004wh5iv72mcu6d0	cms6mnich000gh5ivorlhwkup
cms6mnwy80050h5ivxyber991	cms6mnwhd004wh5iv72mcu6d0	cms6mnikk000hh5iv21tn4uxk
cms6mnwy80051h5iv52jgfwx3	cms6mnwhd004wh5iv72mcu6d0	cms6mnisp000ih5ivd48mh76y
cms6mnwy80052h5ivg7eic261	cms6mnwhd004wh5iv72mcu6d0	cms6mnjqb000mh5ive47cpm21
cms6mnwy80053h5ivj3457ppa	cms6mnwhd004wh5iv72mcu6d0	cms6mnkt4000qh5iv7j7l3by6
cms6mnwy80054h5ivj071jtsb	cms6mnwhd004wh5iv72mcu6d0	cms6mnl23000rh5iv2vktf69s
cms6mny3s0056h5iv97n8u65u	cms6mnxn50055h5iv38fgydd4	cms6mnei30000h5ivb937a3i9
cms6mny3s0057h5ivko7rvfgf	cms6mnxn50055h5iv38fgydd4	cms6mnhg1000ch5ivxhbyxvx3
cms6mny3s0058h5iv7hl152ze	cms6mnxn50055h5iv38fgydd4	cms6mnisp000ih5ivd48mh76y
cms6mny3s0059h5ivo09r8b8s	cms6mnxn50055h5iv38fgydd4	cms6mnjqb000mh5ive47cpm21
cms6mny3s005ah5iv56arl0aq	cms6mnxn50055h5iv38fgydd4	cms6mnjyf000nh5ivowt5cmo4
cms6mny3s005bh5ivxtltcb4d	cms6mnxn50055h5iv38fgydd4	cms6mnk6e000oh5ivu1zp54qe
cms6mny3s005ch5ivld4ekjyo	cms6mnxn50055h5iv38fgydd4	cms6mnl23000rh5iv2vktf69s
cms6mnzhs005eh5ivcrmbfxef	cms6mnz12005dh5ivzbpd95nc	cms6mnei30000h5ivb937a3i9
cms6mnzhs005fh5ivmo3075e2	cms6mnz12005dh5ivzbpd95nc	cms6mnhg1000ch5ivxhbyxvx3
cms6mnzhs005gh5ivuuwahjvu	cms6mnz12005dh5ivzbpd95nc	cms6mnisp000ih5ivd48mh76y
cms6mnzhs005hh5ivq7y65k53	cms6mnz12005dh5ivzbpd95nc	cms6mnjqb000mh5ive47cpm21
cms6mnzhs005ih5ivglat4e4l	cms6mnz12005dh5ivzbpd95nc	cms6mnl23000rh5iv2vktf69s
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Setting" (key, value, "updatedAt") FROM stdin;
\.


--
-- Data for Name: Shoot; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Shoot" (id, "shootCode", title, "shootType", status, date, "startTime", "endTime", location, "googleMapsLink", "contactPerson", "contactNumber", photographer, videographer, assistants, "weatherNotes", notes, "projectId", "clientId", "createdAt", "updatedAt", "archivedAt", "createdBy", "updatedBy", "callTime", "clientBrief", "deliverablesChecklist", "droneOperator", editor, "makeupArtist", "moodBoard", "referenceImages", "specialRequests", "timeZone", "wrapTime", "audioFolderId", "audioFolderUrl", "btsFolderId", "btsFolderUrl", "cameraAFolderId", "cameraAFolderUrl", "cameraBFolderId", "cameraBFolderUrl", "droneFolderId", "droneFolderUrl") FROM stdin;
cms6ndyj60007h51oelhs8s62	S-WAYNE-01	Batmobile Reveal	OTHER	PLANNED	2026-07-29 22:19:55.023	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	cms6ndxne0003h51o78af1ev8	cms6mpsjc0001h5mpf8buo3qc	2026-07-29 22:19:55.027	2026-07-29 22:19:55.027	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cms6ndyyz0009h51orokk0qz9	S-STARK-01	Arc Reactor Close-ups	OTHER	PLANNED	2026-08-05 22:19:55.595	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	cms6ndx7e0001h51o0qejxz1d	cms6mps110000h5mpghhaq0dm	2026-07-29 22:19:55.596	2026-07-29 22:19:55.596	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: ShootEquipment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ShootEquipment" (id, name, "shootId", notes, status) FROM stdin;
\.


--
-- Data for Name: ShootShot; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ShootShot" (id, title, description, "order", "isCompleted", "shootId", notes, priority, "referenceImage") FROM stdin;
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Tag" (id, name, color, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Task" (id, title, description, status, priority, "dueDate", "estimatedDuration", "actualDuration", progress, "projectId", "clientId", "leadId", "assignedToId", "parentTaskId", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, email, name, "passwordHash", "createdAt", "updatedAt", "archivedAt", "createdBy", "updatedBy", "contactEmail", "roleId") FROM stdin;
cms6mo1eg005kh5ivj4af157h	frames.random.7@gmail.com	Savan Somaiah T P	$2b$10$J9QnquZjFeJPAL7rVv1VR.9um2y8OjmrQH5a6bjWXhnunqhKtWBVG	2026-07-29 21:59:45.688	2026-07-29 21:59:45.688	\N	\N	\N	\N	cms6mnox10016h5ivv9yskd5j
\.


--
-- Data for Name: WebhookEndpoint; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."WebhookEndpoint" (id, name, url, secret, "eventTypes", "isActive", "createdAt", "updatedAt", "authenticationType", "failureCount", "lastFailureAt", "lastSuccessAt", "retryPolicy") FROM stdin;
\.


--
-- Data for Name: WorkingHours; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."WorkingHours" (id, "dayOfWeek", "startTime", "endTime", "isActive") FROM stdin;
\.


--
-- Data for Name: _ProjectAssignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."_ProjectAssignments" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _TaskDependencies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."_TaskDependencies" ("A", "B") FROM stdin;
\.


--
-- Name: Activity Activity_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Availability Availability_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Availability"
    ADD CONSTRAINT "Availability_pkey" PRIMARY KEY (id);


--
-- Name: BackgroundJob BackgroundJob_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BackgroundJob"
    ADD CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY (id);


--
-- Name: CalendarEvent CalendarEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistItem ChecklistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: CommunicationAttachment CommunicationAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CommunicationAttachment"
    ADD CONSTRAINT "CommunicationAttachment_pkey" PRIMARY KEY (id);


--
-- Name: CommunicationTemplate CommunicationTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CommunicationTemplate"
    ADD CONSTRAINT "CommunicationTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Communication Communication_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_pkey" PRIMARY KEY (id);


--
-- Name: DeliverableFile DeliverableFile_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeliverableFile"
    ADD CONSTRAINT "DeliverableFile_pkey" PRIMARY KEY (id);


--
-- Name: DeliverableVersion DeliverableVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeliverableVersion"
    ADD CONSTRAINT "DeliverableVersion_pkey" PRIMARY KEY (id);


--
-- Name: Deliverable Deliverable_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Deliverable"
    ADD CONSTRAINT "Deliverable_pkey" PRIMARY KEY (id);


--
-- Name: DeliveryVersion DeliveryVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeliveryVersion"
    ADD CONSTRAINT "DeliveryVersion_pkey" PRIMARY KEY (id);


--
-- Name: Delivery Delivery_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_pkey" PRIMARY KEY (id);


--
-- Name: EventParticipant EventParticipant_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."EventParticipant"
    ADD CONSTRAINT "EventParticipant_pkey" PRIMARY KEY (id);


--
-- Name: ExpenseCategory ExpenseCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExpenseCategory"
    ADD CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: FinancialReport FinancialReport_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FinancialReport"
    ADD CONSTRAINT "FinancialReport_pkey" PRIMARY KEY (id);


--
-- Name: FollowUp FollowUp_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_pkey" PRIMARY KEY (id);


--
-- Name: Holiday Holiday_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Holiday"
    ADD CONSTRAINT "Holiday_pkey" PRIMARY KEY (id);


--
-- Name: IntegrationSettings IntegrationSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."IntegrationSettings"
    ADD CONSTRAINT "IntegrationSettings_pkey" PRIMARY KEY (id);


--
-- Name: InternalNote InternalNote_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: LeadAttachment LeadAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadAttachment"
    ADD CONSTRAINT "LeadAttachment_pkey" PRIMARY KEY (id);


--
-- Name: LeadCommunication LeadCommunication_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadCommunication"
    ADD CONSTRAINT "LeadCommunication_pkey" PRIMARY KEY (id);


--
-- Name: LeadReminder LeadReminder_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadReminder"
    ADD CONSTRAINT "LeadReminder_pkey" PRIMARY KEY (id);


--
-- Name: LeadTag LeadTag_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadTag"
    ADD CONSTRAINT "LeadTag_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: QuotationItem QuotationItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."QuotationItem"
    ADD CONSTRAINT "QuotationItem_pkey" PRIMARY KEY (id);


--
-- Name: Quotation Quotation_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Quotation"
    ADD CONSTRAINT "Quotation_pkey" PRIMARY KEY (id);


--
-- Name: RecurringRule RecurringRule_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."RecurringRule"
    ADD CONSTRAINT "RecurringRule_pkey" PRIMARY KEY (id);


--
-- Name: Reminder Reminder_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Reminder"
    ADD CONSTRAINT "Reminder_pkey" PRIMARY KEY (id);


--
-- Name: ResourceAssignment ResourceAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ResourceAssignment"
    ADD CONSTRAINT "ResourceAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Resource Resource_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (key);


--
-- Name: ShootEquipment ShootEquipment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ShootEquipment"
    ADD CONSTRAINT "ShootEquipment_pkey" PRIMARY KEY (id);


--
-- Name: ShootShot ShootShot_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ShootShot"
    ADD CONSTRAINT "ShootShot_pkey" PRIMARY KEY (id);


--
-- Name: Shoot Shoot_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Shoot"
    ADD CONSTRAINT "Shoot_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WebhookEndpoint WebhookEndpoint_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WebhookEndpoint"
    ADD CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY (id);


--
-- Name: WorkingHours WorkingHours_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."WorkingHours"
    ADD CONSTRAINT "WorkingHours_pkey" PRIMARY KEY (id);


--
-- Name: _ProjectAssignments _ProjectAssignments_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_ProjectAssignments"
    ADD CONSTRAINT "_ProjectAssignments_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _TaskDependencies _TaskDependencies_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_TaskDependencies"
    ADD CONSTRAINT "_TaskDependencies_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: Client_clientCode_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Client_clientCode_key" ON public."Client" USING btree ("clientCode");


--
-- Name: ExpenseCategory_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON public."ExpenseCategory" USING btree (name);


--
-- Name: IntegrationSettings_provider_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "IntegrationSettings_provider_key" ON public."IntegrationSettings" USING btree (provider);


--
-- Name: Invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");


--
-- Name: LeadTag_leadId_tagId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "LeadTag_leadId_tagId_key" ON public."LeadTag" USING btree ("leadId", "tagId");


--
-- Name: Lead_convertedToClientId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Lead_convertedToClientId_key" ON public."Lead" USING btree ("convertedToClientId");


--
-- Name: Lead_sourceEmailId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Lead_sourceEmailId_key" ON public."Lead" USING btree ("sourceEmailId");


--
-- Name: PasswordResetToken_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PasswordResetToken_email_idx" ON public."PasswordResetToken" USING btree (email);


--
-- Name: PasswordResetToken_tokenHash_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON public."PasswordResetToken" USING btree ("tokenHash");


--
-- Name: Permission_action_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Permission_action_key" ON public."Permission" USING btree (action);


--
-- Name: Project_projectCode_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Project_projectCode_key" ON public."Project" USING btree ("projectCode");


--
-- Name: Quotation_quotationNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON public."Quotation" USING btree ("quotationNumber");


--
-- Name: RolePermission_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON public."RolePermission" USING btree ("roleId", "permissionId");


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: Shoot_shootCode_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Shoot_shootCode_key" ON public."Shoot" USING btree ("shootCode");


--
-- Name: Tag_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Tag_name_key" ON public."Tag" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _ProjectAssignments_B_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "_ProjectAssignments_B_index" ON public."_ProjectAssignments" USING btree ("B");


--
-- Name: _TaskDependencies_B_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "_TaskDependencies_B_index" ON public."_TaskDependencies" USING btree ("B");


--
-- Name: Activity Activity_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Activity Activity_expenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES public."Expense"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Activity Activity_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Activity Activity_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Activity Activity_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Activity Activity_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Activity Activity_shootId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES public."Shoot"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Availability Availability_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Availability"
    ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CalendarEvent CalendarEvent_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CalendarEvent CalendarEvent_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CalendarEvent CalendarEvent_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CalendarEvent CalendarEvent_recurringRuleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_recurringRuleId_fkey" FOREIGN KEY ("recurringRuleId") REFERENCES public."RecurringRule"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CalendarEvent CalendarEvent_shootId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES public."Shoot"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChecklistItem ChecklistItem_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommunicationAttachment CommunicationAttachment_communicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CommunicationAttachment"
    ADD CONSTRAINT "CommunicationAttachment_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES public."Communication"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."CalendarEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_quotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public."Quotation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DeliverableFile DeliverableFile_deliverableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeliverableFile"
    ADD CONSTRAINT "DeliverableFile_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES public."Deliverable"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DeliverableVersion DeliverableVersion_deliverableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeliverableVersion"
    ADD CONSTRAINT "DeliverableVersion_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES public."Deliverable"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Deliverable Deliverable_shootId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Deliverable"
    ADD CONSTRAINT "Deliverable_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES public."Shoot"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DeliveryVersion DeliveryVersion_deliveryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeliveryVersion"
    ADD CONSTRAINT "DeliveryVersion_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES public."Delivery"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Delivery Delivery_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Delivery Delivery_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventParticipant EventParticipant_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."EventParticipant"
    ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."CalendarEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventParticipant EventParticipant_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."EventParticipant"
    ADD CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ExpenseCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Expense Expense_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FinancialReport FinancialReport_generatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FinancialReport"
    ADD CONSTRAINT "FinancialReport_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FollowUp FollowUp_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FollowUp FollowUp_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FollowUp FollowUp_communicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES public."Communication"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FollowUp FollowUp_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FollowUp FollowUp_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FollowUp"
    ADD CONSTRAINT "FollowUp_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IntegrationSettings IntegrationSettings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."IntegrationSettings"
    ADD CONSTRAINT "IntegrationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InternalNote InternalNote_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternalNote InternalNote_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InternalNote InternalNote_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."CalendarEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternalNote InternalNote_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternalNote InternalNote_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternalNote InternalNote_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternalNote InternalNote_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternalNote InternalNote_quotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InternalNote"
    ADD CONSTRAINT "InternalNote_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public."Quotation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadAttachment LeadAttachment_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadAttachment"
    ADD CONSTRAINT "LeadAttachment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadCommunication LeadCommunication_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadCommunication"
    ADD CONSTRAINT "LeadCommunication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadReminder LeadReminder_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadReminder"
    ADD CONSTRAINT "LeadReminder_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadTag LeadTag_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadTag"
    ADD CONSTRAINT "LeadTag_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadTag LeadTag_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LeadTag"
    ADD CONSTRAINT "LeadTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lead Lead_convertedToClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_convertedToClientId_fkey" FOREIGN KEY ("convertedToClientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_shootId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES public."Shoot"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuotationItem QuotationItem_quotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."QuotationItem"
    ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public."Quotation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quotation Quotation_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Quotation"
    ADD CONSTRAINT "Quotation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quotation Quotation_parentQuotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Quotation"
    ADD CONSTRAINT "Quotation_parentQuotationId_fkey" FOREIGN KEY ("parentQuotationId") REFERENCES public."Quotation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Quotation Quotation_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Quotation"
    ADD CONSTRAINT "Quotation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reminder Reminder_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Reminder"
    ADD CONSTRAINT "Reminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."CalendarEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reminder Reminder_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Reminder"
    ADD CONSTRAINT "Reminder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reminder Reminder_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Reminder"
    ADD CONSTRAINT "Reminder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ResourceAssignment ResourceAssignment_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ResourceAssignment"
    ADD CONSTRAINT "ResourceAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."CalendarEvent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ResourceAssignment ResourceAssignment_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ResourceAssignment"
    ADD CONSTRAINT "ResourceAssignment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShootEquipment ShootEquipment_shootId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ShootEquipment"
    ADD CONSTRAINT "ShootEquipment_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES public."Shoot"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShootShot ShootShot_shootId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ShootShot"
    ADD CONSTRAINT "ShootShot_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES public."Shoot"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Shoot Shoot_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Shoot"
    ADD CONSTRAINT "Shoot_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Shoot Shoot_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Shoot"
    ADD CONSTRAINT "Shoot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Task Task_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Task Task_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Task Task_parentTaskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: _ProjectAssignments _ProjectAssignments_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_ProjectAssignments"
    ADD CONSTRAINT "_ProjectAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectAssignments _ProjectAssignments_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_ProjectAssignments"
    ADD CONSTRAINT "_ProjectAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TaskDependencies _TaskDependencies_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_TaskDependencies"
    ADD CONSTRAINT "_TaskDependencies_A_fkey" FOREIGN KEY ("A") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TaskDependencies _TaskDependencies_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_TaskDependencies"
    ADD CONSTRAINT "_TaskDependencies_B_fkey" FOREIGN KEY ("B") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict W2GgXjRvDlQyKMgMhwBRJbhIapbsdxhgTU8qo8Ti5p5K5gdnKWcnO372dglCS7g

