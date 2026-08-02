import { 
  PermissionDefinition, 
  RoleDefinition, 
  RoleName, 
  SettingsTabId, 
  DepartmentName, 
  EntityOwnershipType, 
  EntityOwnershipMapping 
} from "./types";

export const PERMISSIONS_LIST: PermissionDefinition[] = [
  // Dashboard & Workspace
  { action: "dashboard.view", module: "Dashboard", description: "View workspace dashboard" },
  { action: "dashboard.manage", module: "Dashboard", description: "Manage dashboard widgets and kpis" },
  { action: "workspace.view", module: "Dashboard", description: "View workspace data" },
  { action: "workspace.manage", module: "Dashboard", description: "Manage workspace configurations" },

  // Leads & CRM
  { action: "leads.view", module: "Leads", description: "View lead records" },
  { action: "leads.create", module: "Leads", description: "Create new leads" },
  { action: "leads.update", module: "Leads", description: "Update existing leads" },
  { action: "leads.delete", module: "Leads", description: "Delete lead records" },
  { action: "crm.manage", module: "Leads", description: "Manage CRM pipelines and follow-ups" },

  // Clients
  { action: "clients.view", module: "Clients", description: "View client profiles" },
  { action: "clients.create", module: "Clients", description: "Create new clients" },
  { action: "clients.update", module: "Clients", description: "Update client details" },
  { action: "clients.delete", module: "Clients", description: "Archive or delete client profiles" },

  // Projects
  { action: "projects.view", module: "Projects", description: "View projects" },
  { action: "projects.create", module: "Projects", description: "Create new projects" },
  { action: "projects.update", module: "Projects", description: "Update project schedules and statuses" },
  { action: "projects.delete", module: "Projects", description: "Delete projects" },
  { action: "projects.assign", module: "Projects", description: "Assign team members to projects" },
  { action: "projects.approve", module: "Projects", description: "Approve creative output on projects" },

  // Shoots
  { action: "shoots.view", module: "Shoots", description: "View shoot schedules and call sheets" },
  { action: "shoots.create", module: "Shoots", description: "Schedule new shoots" },
  { action: "shoots.update", module: "Shoots", description: "Update shoot timelines and logistics" },
  { action: "shoots.delete", module: "Shoots", description: "Cancel or delete shoots" },

  // Deliverables & Content
  { action: "deliverables.view", module: "Deliverables", description: "View media deliverables" },
  { action: "deliverables.create", module: "Deliverables", description: "Upload new media deliverables" },
  { action: "deliverables.update", module: "Deliverables", description: "Edit deliverable versions" },
  { action: "deliverables.delete", module: "Deliverables", description: "Delete media files" },
  { action: "deliverables.review", module: "Deliverables", description: "Review and approve client deliverables" },
  { action: "content.manage", module: "Content", description: "Manage social media content and galleries" },

  // Calendar
  { action: "calendar.view", module: "Calendar", description: "View schedule and shoots on calendar" },
  { action: "calendar.manage", module: "Calendar", description: "Create and modify calendar appointments" },

  // Finance
  { action: "finance.view", module: "Finance", description: "View accounting and income summaries" },
  { action: "finance.manage", module: "Finance", description: "Manage quotes, invoices, and payments" },
  { action: "finance.export", module: "Finance", description: "Export financial statements and logs" },
  { action: "invoices.manage", module: "Finance", description: "Create and send invoices and quotations" },
  { action: "payments.manage", module: "Finance", description: "Record and reconcile client payments" },
  { action: "expenses.manage", module: "Finance", description: "Track and report business expenses" },

  // Reports & Analytics
  { action: "reports.view", module: "Reports", description: "Access business analytics and performance reports" },

  // Administrative & System (Restricted from Co-Founder and staff)
  { action: "users.manage", module: "System", description: "Manage team accounts and onboarding" },
  { action: "roles.manage", module: "Settings", description: "Manage role definitions and RBAC permissions" },
  { action: "settings.manage", module: "Settings", description: "Manage operational business and branding settings" },
  { action: "backup.manage", module: "Settings", description: "Manage system backups and database restoration" },
  { action: "integrations.manage", module: "Settings", description: "Configure API keys, OAuth tokens, and integrations" },
  { action: "security.manage", module: "Settings", description: "Manage enterprise security policies and audits" },
  { action: "ownership.transfer", module: "System", description: "Exclusive Founder ownership authority" },
];

export const ALL_ACTION_STRINGS = PERMISSIONS_LIST.map((p) => p.action);

const CO_FOUNDER_PERMISSIONS = ALL_ACTION_STRINGS.filter(
  (a) =>
    ![
      "users.manage",
      "roles.manage",
      "backup.manage",
      "integrations.manage",
      "security.manage",
      "ownership.transfer",
    ].includes(a)
);

export const ROLES_CONFIG: RoleDefinition[] = [
  {
    name: RoleName.FOUNDER,
    description: "Business Owner & Super Administrator. Complete, unrestricted access across the OS.",
    isSystem: true,
    isUiVisible: true, // Version 1 active user
    department: DepartmentName.ADMINISTRATION,
    permissions: ALL_ACTION_STRINGS,
  },
  {
    name: RoleName.CO_FOUNDER,
    description: "Head of Operations & Social Media Manager. Full operational access across all business modules.",
    isSystem: true,
    isUiVisible: true, // Version 1 active user
    department: DepartmentName.OPERATIONS,
    permissions: CO_FOUNDER_PERMISSIONS,
  },
  {
    name: RoleName.PHOTOGRAPHER,
    description: "Creative team member responsible for photography production and shoot schedules.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.PRODUCTION,
    permissions: [
      "dashboard.view",
      "projects.view",
      "shoots.view",
      "shoots.update",
      "deliverables.view",
      "deliverables.create",
      "deliverables.update",
      "calendar.view",
      "content.manage",
    ],
  },
  {
    name: RoleName.VIDEOGRAPHER,
    description: "Creative team member responsible for video production and shoot logistics.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.PRODUCTION,
    permissions: [
      "dashboard.view",
      "projects.view",
      "shoots.view",
      "shoots.update",
      "deliverables.view",
      "deliverables.create",
      "deliverables.update",
      "calendar.view",
      "content.manage",
    ],
  },
  {
    name: RoleName.EDITOR,
    description: "Post-production specialist with full editing workspace access for deliverables and client reviews.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.PRODUCTION,
    permissions: [
      "dashboard.view",
      "projects.view",
      "deliverables.view",
      "deliverables.create",
      "deliverables.update",
      "deliverables.delete",
      "deliverables.review",
    ],
  },
  {
    name: RoleName.SALES,
    description: "Sales & CRM executive handling leads, networking handoffs, client onboarding, and quotations.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.SALES,
    permissions: [
      "dashboard.view",
      "leads.view",
      "leads.create",
      "leads.update",
      "leads.delete",
      "crm.manage",
      "clients.view",
      "clients.create",
      "clients.update",
      "invoices.manage",
      "calendar.view",
      "calendar.manage",
      "reports.view",
    ],
  },
  {
    name: RoleName.FINANCE,
    description: "Financial specialist managing accounting, quotes, invoices, payment reconciliation, and reporting.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.FINANCE,
    permissions: [
      "dashboard.view",
      "clients.view",
      "finance.view",
      "finance.manage",
      "finance.export",
      "invoices.manage",
      "payments.manage",
      "expenses.manage",
      "reports.view",
    ],
  },
  {
    name: RoleName.GRAPHIC_DESIGNER,
    description: "Creative specialist managing graphic design assets, brand identity elements, and visual deliverables.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.PRODUCTION,
    permissions: [
      "dashboard.view",
      "projects.view",
      "deliverables.view",
      "deliverables.create",
      "deliverables.update",
      "content.manage",
    ],
  },
  {
    name: RoleName.CONTENT_WRITER,
    description: "Content creator handling scriptwriting, captions, social descriptions, and marketing communications.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.MARKETING,
    permissions: [
      "dashboard.view",
      "projects.view",
      "deliverables.view",
      "content.manage",
      "reports.view",
    ],
  },
  {
    name: RoleName.SOCIAL_MEDIA_MANAGER,
    description: "Marketing strategist coordinating content calendar, client distribution schedules, and social reach.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.MARKETING,
    permissions: [
      "dashboard.view",
      "projects.view",
      "deliverables.view",
      "calendar.view",
      "calendar.manage",
      "content.manage",
      "reports.view",
    ],
  },
  {
    name: RoleName.BUSINESS_DEVELOPMENT,
    description: "Strategic networking and business development executive driving top-of-funnel lead pipeline.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.SALES,
    permissions: [
      "dashboard.view",
      "leads.view",
      "leads.create",
      "leads.update",
      "crm.manage",
      "clients.view",
      "reports.view",
    ],
  },
  {
    name: RoleName.FINANCE_EXECUTIVE,
    description: "Finance operational specialist supporting billing, invoicing, receivables, and expense accounting.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.FINANCE,
    permissions: [
      "dashboard.view",
      "clients.view",
      "finance.view",
      "invoices.manage",
      "payments.manage",
      "expenses.manage",
      "reports.view",
    ],
  },
  {
    name: RoleName.INTERN,
    description: "Operational and creative support team member with foundational view permissions.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.OPERATIONS,
    permissions: [
      "dashboard.view",
      "projects.view",
      "calendar.view",
    ],
  },
  // Backward compatibility definitions for legacy roles during database transitions
  {
    name: RoleName.OWNER,
    description: "Legacy alias for Founder Super Admin.",
    isSystem: true,
    isUiVisible: true, // Alias for Founder
    department: DepartmentName.ADMINISTRATION,
    permissions: ALL_ACTION_STRINGS,
  },
  {
    name: RoleName.ADMIN,
    description: "Legacy administrative alias.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.OPERATIONS,
    permissions: CO_FOUNDER_PERMISSIONS,
  },
  {
    name: RoleName.OPERATIONS_MANAGER,
    description: "Legacy alias for Operations.",
    isSystem: true,
    isUiVisible: false, // Future role concealed in Version 1 UI
    department: DepartmentName.OPERATIONS,
    permissions: CO_FOUNDER_PERMISSIONS,
  },
];

/**
 * Settings tabs that are purely administrative.
 * These are hidden from the Co-Founder and all other non-Founder roles while preserving operational settings.
 */
export const ADMIN_SETTINGS_TABS: string[] = [
  SettingsTabId.USERS,
  SettingsTabId.ROLES,
  SettingsTabId.BACKUP,
  SettingsTabId.INTEGRATIONS,
  SettingsTabId.SECURITY,
];

/**
 * System notification prefixes and keywords that belong exclusively to Super Admin (Founder) monitoring.
 * Co-Founder only receives operational notifications PLUS Critical notifications.
 */
export const ADMINISTRATIVE_NOTIFICATION_KEYWORDS: string[] = [
  "SYSTEM_HEALTH",
  "OAUTH_ERROR",
  "DATABASE_BACKUP",
  "API_KEY",
  "SECURITY_ALERT",
  "INTEGRATION_SYNC_ERROR",
  "WEBHOOK_FAILURE",
  "WHATSAPP_API_ERROR",
  "SYSTEM DEBUG ADMIN ERROR",
  "GMAIL_API_ERROR",
  "CALENDAR_API_ERROR",
  "DRIVE_API_ERROR",
  "WORKSPACE_ERROR",
  "WORKSPACE_SYNC_FAILURE",
  "OAUTH_TOKEN_EXPIRED",
  "CALENDAR_SYNC_CONFLICT",
  "QUEUE_ERROR",
];

export const CRITICAL_NOTIFICATION_KEYWORDS: string[] = [
  "CRITICAL",
  "EMERGENCY",
  "URGENT",
  "FATAL",
  "OUTAGE",
];

/**
 * Decoupled Project Ownership Model Matrix.
 * Governs ownership roles across major domain entities independent of temporary assignment.
 */
export const ENTITY_OWNERSHIP_MATRIX: EntityOwnershipMapping[] = [
  {
    entityType: "LEAD",
    supportedRoles: [EntityOwnershipType.SALES_OWNER, EntityOwnershipType.OPERATIONS_OWNER],
    defaultAssignments: {
      [EntityOwnershipType.SALES_OWNER]: RoleName.CO_FOUNDER,
      [EntityOwnershipType.OPERATIONS_OWNER]: RoleName.CO_FOUNDER,
    },
  },
  {
    entityType: "PROJECT",
    supportedRoles: [
      EntityOwnershipType.CREATIVE_OWNER,
      EntityOwnershipType.OPERATIONS_OWNER,
      EntityOwnershipType.SALES_OWNER,
      EntityOwnershipType.FINANCE_OWNER,
    ],
    defaultAssignments: {
      [EntityOwnershipType.CREATIVE_OWNER]: RoleName.FOUNDER,
      [EntityOwnershipType.OPERATIONS_OWNER]: RoleName.CO_FOUNDER,
      [EntityOwnershipType.SALES_OWNER]: RoleName.CO_FOUNDER,
      [EntityOwnershipType.FINANCE_OWNER]: "Shared",
    },
  },
  {
    entityType: "SHOOT",
    supportedRoles: [EntityOwnershipType.CREATIVE_OWNER, EntityOwnershipType.PRODUCTION_OWNER],
    defaultAssignments: {
      [EntityOwnershipType.CREATIVE_OWNER]: RoleName.FOUNDER,
      [EntityOwnershipType.PRODUCTION_OWNER]: RoleName.CO_FOUNDER,
    },
  },
  {
    entityType: "CONTENT",
    supportedRoles: [EntityOwnershipType.OPERATIONS_OWNER, EntityOwnershipType.CREATIVE_APPROVER],
    defaultAssignments: {
      [EntityOwnershipType.OPERATIONS_OWNER]: RoleName.CO_FOUNDER,
      [EntityOwnershipType.CREATIVE_APPROVER]: RoleName.FOUNDER,
    },
  },
  {
    entityType: "INVOICE",
    supportedRoles: [EntityOwnershipType.FINANCE_OWNER],
    defaultAssignments: {
      [EntityOwnershipType.FINANCE_OWNER]: "Shared",
    },
  },
  {
    entityType: "CLIENT",
    supportedRoles: [EntityOwnershipType.RELATIONSHIP_OWNER],
    defaultAssignments: {
      [EntityOwnershipType.RELATIONSHIP_OWNER]: RoleName.CO_FOUNDER,
    },
  },
];
