/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

// 1. Add Enums after enum ReminderType
const enumsToAdd = `
enum CommunicationDirection {
  INBOUND
  OUTBOUND
  INTERNAL
}

enum TemplateCategory {
  QUOTATION
  INVOICE
  REMINDER
  SHOOT_CONFIRMATION
  MEETING_CONFIRMATION
  DELIVERY
  PAYMENT
  FOLLOW_UP
  WELCOME
  THANK_YOU
  CUSTOM
}

enum FollowUpStatus {
  PENDING
  COMPLETED
  CANCELLED
}

enum DeliveryStatus {
  DRAFT
  SENT
  VIEWED
  DOWNLOADED
  CONFIRMED
  EXPIRED
}
`;
schema = schema.replace('enum ReminderType {\n  FOLLOW_UP\n  MEETING\n  CALL\n  DEADLINE\n}', 'enum ReminderType {\n  FOLLOW_UP\n  MEETING\n  CALL\n  DEADLINE\n}\n' + enumsToAdd);

// 2. Add reverse relations

function addRelation(modelName, relationsString) {
  const modelStartStr = `model ${modelName} {`;
  const startIndex = schema.indexOf(modelStartStr);
  if (startIndex === -1) {
    console.error(`Model ${modelName} not found`);
    return;
  }
  
  let openBrackets = 0;
  let endIndex = -1;
  for (let i = startIndex; i < schema.length; i++) {
    if (schema[i] === '{') openBrackets++;
    else if (schema[i] === '}') {
      openBrackets--;
      if (openBrackets === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    schema = schema.substring(0, endIndex) + `\n${relationsString}\n` + schema.substring(endIndex);
  }
}

addRelation('Lead', '  communicationsCenter Communication[]\n  followUps FollowUp[]\n  internalNotes InternalNote[]');
addRelation('Client', '  communicationsCenter Communication[]\n  followUps FollowUp[]\n  internalNotes InternalNote[]');
addRelation('Project', '  communicationsCenter Communication[]\n  followUps FollowUp[]\n  deliveries Delivery[]\n  internalNotes InternalNote[]');
addRelation('Invoice', '  communicationsCenter Communication[]\n  internalNotes InternalNote[]');
addRelation('Quotation', '  communicationsCenter Communication[]\n  internalNotes InternalNote[]');
addRelation('Payment', '  communicationsCenter Communication[]\n  internalNotes InternalNote[]');
addRelation('CalendarEvent', '  communicationsCenter Communication[]\n  internalNotes InternalNote[]');
addRelation('User', '  internalNotes InternalNote[]\n  deliveries Delivery[]\n  followUps FollowUp[]');

// 3. Add Models at the end
const modelsToAdd = `

model CommunicationTemplate {
  id        String           @id @default(cuid())
  title     String
  category  TemplateCategory @default(CUSTOM)
  type      CommunicationType // Reuse existing enum (EMAIL, MESSAGE, etc.)
  subject   String?
  body      String           @db.Text
  version   Int              @default(1)
  isActive  Boolean          @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?
}

model Communication {
  id        String                @id @default(cuid())
  type      CommunicationType
  direction CommunicationDirection
  subject   String?
  body      String                @db.Text
  status    String                @default("SENT") // SENT, DELIVERED, READ, FAILED
  error     String?

  leadId    String?
  lead      Lead?    @relation(fields: [leadId], references: [id], onDelete: Cascade)
  clientId  String?
  client    Client?  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
  invoiceId String?
  invoice   Invoice? @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  quotationId String?
  quotation Quotation? @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  paymentId String?
  payment   Payment? @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  eventId   String?
  event     CalendarEvent? @relation(fields: [eventId], references: [id], onDelete: Cascade)

  attachments CommunicationAttachment[]
  followUps   FollowUp[]

  sentAt    DateTime @default(now())
  createdBy String?
}

model CommunicationAttachment {
  id              String @id @default(cuid())
  fileName        String
  fileUrl         String
  fileSize        Int
  fileType        String
  
  communicationId String
  communication   Communication @relation(fields: [communicationId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

model FollowUp {
  id              String         @id @default(cuid())
  title           String
  description     String?
  dueDate         DateTime
  status          FollowUpStatus @default(PENDING)
  priority        String         @default("MEDIUM")

  communicationId String?
  communication   Communication? @relation(fields: [communicationId], references: [id], onDelete: Cascade)

  leadId    String?
  lead      Lead?    @relation(fields: [leadId], references: [id], onDelete: Cascade)
  clientId  String?
  client    Client?  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  assignedToId String?
  assignedTo   User?    @relation(fields: [assignedToId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?
}

model Delivery {
  id          String         @id @default(cuid())
  title       String
  description String?
  status      DeliveryStatus @default(DRAFT)
  deliveryLink String?
  password     String? // Encrypted password if applicable
  expiryDate   DateTime?

  projectId   String
  project     Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  versions    DeliveryVersion[]

  sentAt       DateTime?
  viewedAt     DateTime?
  downloadedAt DateTime?
  confirmedAt  DateTime?
  
  createdById  String?
  createdBy    User? @relation(fields: [createdById], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model DeliveryVersion {
  id          String   @id @default(cuid())
  version     Int
  changes     String?
  deliveryLink String
  
  deliveryId  String
  delivery    Delivery @relation(fields: [deliveryId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

model InternalNote {
  id          String   @id @default(cuid())
  content     String   @db.Text
  isPinned    Boolean  @default(false)

  leadId    String?
  lead      Lead?    @relation(fields: [leadId], references: [id], onDelete: Cascade)
  clientId  String?
  client    Client?  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
  invoiceId String?
  invoice   Invoice? @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  quotationId String?
  quotation Quotation? @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  paymentId String?
  payment   Payment? @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  eventId   String?
  event     CalendarEvent? @relation(fields: [eventId], references: [id], onDelete: Cascade)

  createdById String?
  createdBy   User?    @relation(fields: [createdById], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

`;

schema = schema + modelsToAdd;

fs.writeFileSync(schemaPath, schema, 'utf-8');
console.log('Schema updated successfully.');
