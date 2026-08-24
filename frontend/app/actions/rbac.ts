import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinanceRbacEngine } from "@/domain/finance/finance-rbac";

export async function checkFinanceRbac() {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: true },
  });
  if (!user) throw new Error("Unauthorized");

  if (!FinanceRbacEngine.canOperateFinance(user.role?.name)) {
    throw new Error("403 Forbidden: You do not have permission to perform financial operations.");
  }

  return user;
}

export async function checkFounderRbac() {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: true },
  });
  if (!user) throw new Error("Unauthorized");

  if (!FinanceRbacEngine.isFounder(user.role?.name)) {
    throw new Error("403 Forbidden: Founder approval is required for this operation.");
  }

  return user;
}
