import { prisma } from '../../config/prisma';

export class PaymentsService {
  static async create(data: { amount: number; invoiceId: string }) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({ data });

      // Auto-update invoice status if fully paid?
      const invoice = await tx.invoice.findUnique({
        where: { id: data.invoiceId },
        include: { payments: true },
      });

      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid >= invoice.amount) {
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PAID' },
          });
        }
      }

      return payment;
    });
  }
}
