"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getManagerId() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "MANAGER") throw new Error("Unauthorized");
  return parseInt(session.user.id!);
}

export async function approveRequest(requestId: number, comment: string): Promise<void> {
  const managerId = await getManagerId();
  await prisma.$transaction([
    prisma.expenseRequest.update({ where: { id: requestId }, data: { status: "APPROVED" } }),
    prisma.approval.create({ data: { requestId, managerId, action: "APPROVED", comment: comment || null } }),
  ]);
  revalidatePath("/dashboard");
}

export async function rejectRequest(requestId: number, comment: string): Promise<void> {
  const managerId = await getManagerId();
  await prisma.$transaction([
    prisma.expenseRequest.update({ where: { id: requestId }, data: { status: "REJECTED" } }),
    prisma.approval.create({ data: { requestId, managerId, action: "REJECTED", comment: comment || null } }),
  ]);
  revalidatePath("/dashboard");
}
