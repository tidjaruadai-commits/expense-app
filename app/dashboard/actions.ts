"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveRequest(
  requestId: number,
  comment: string
): Promise<void> {
  await prisma.$transaction([
    prisma.expenseRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    }),
    prisma.approval.create({
      data: {
        requestId,
        managerId: 2, // hardcode manager id=2 until auth
        action: "APPROVED",
        comment: comment || null,
      },
    }),
  ]);
  revalidatePath("/dashboard");
}

export async function rejectRequest(
  requestId: number,
  comment: string
): Promise<void> {
  await prisma.$transaction([
    prisma.expenseRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    }),
    prisma.approval.create({
      data: {
        requestId,
        managerId: 2,
        action: "REJECTED",
        comment: comment || null,
      },
    }),
  ]);
  revalidatePath("/dashboard");
}
