import { WorkflowEvent } from "../events";
import { EventBus } from "../event-bus";
import { prisma } from "@/lib/prisma";
import { FinanceService } from "@/lib/finance/finance.service";

/**
 * Finance Workflow Handlers
 * 
 * Subscribes to events and performs automated business logic related to Finance.
 */
export function registerFinanceHandlers() {
  
  // When a quotation is approved, automatically update the project status if it's currently LEAD or PROPOSAL
  EventBus.subscribe(WorkflowEvent.QUOTATION_APPROVED, 'Finance_UpdateProjectStatus', async (payload) => {
    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });
    if (!project) return;
    
    if (project.status === 'INQUIRY') {
      await prisma.project.update({
        where: { id: payload.projectId },
        data: { status: 'PLANNED' }
      });
      // Optionally emit a project updated event here, but we'll avoid cascading events for now to keep it simple.
    }
  });

  // When a payment is received, automatically calculate new invoice balance and mark PAID if 0
  EventBus.subscribe(WorkflowEvent.PAYMENT_RECEIVED, 'Finance_CalculateInvoiceBalance', async (payload) => {
    if (!payload.invoiceId) return;

    const invoice = await prisma.invoice.findUnique({
      where: { id: payload.invoiceId },
      include: { payments: true }
    });
    
    if (!invoice) return;

    const balance = FinanceService.calculateInvoiceBalance(invoice.total, invoice.payments);
    
    if (balance <= 0 && invoice.status !== 'PAID') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID' }
      });
      
      // Emit an invoice paid event
      EventBus.publish(WorkflowEvent.INVOICE_PAID, {
        invoiceId: invoice.id,
        amount: invoice.total.toNumber(),
        userId: payload.userId
      });
    } else if (invoice.status === 'DRAFT' || invoice.status === 'SENT') {
      // If partial payment received, you might want a PARTIAL status, but for now we'll just keep it SENT/ACTIVE
    }
  });
}
