"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type FormState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function submitExpenseRequest(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const date = formData.get("date") as string;
  const from = (formData.get("from") as string)?.trim();
  const to = (formData.get("to") as string)?.trim();
  const distance = formData.get("distance") as string;
  const amount = formData.get("amount") as string;
  const purpose = (formData.get("purpose") as string)?.trim();
  const receiptUrl = (formData.get("receiptUrl") as string) || null;

  const errors: Record<string, string> = {};

  if (!date) errors.date = "กรุณาระบุวันที่เดินทาง";
  if (!from) errors.from = "กรุณาระบุต้นทาง";
  if (!to) errors.to = "กรุณาระบุปลายทาง";
  if (!distance || isNaN(Number(distance)) || Number(distance) <= 0)
    errors.distance = "กรุณาระบุระยะทางที่ถูกต้อง";
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
    errors.amount = "กรุณาระบุจำนวนเงินที่ถูกต้อง";
  if (!purpose) errors.purpose = "กรุณาระบุวัตถุประสงค์";

  if (Object.keys(errors).length > 0) return { errors };

  // hardcode userId=1 until auth is implemented
  await prisma.expenseRequest.create({
    data: {
      userId: 1,
      date: new Date(date),
      from,
      to,
      distance: Number(distance),
      amount: Number(amount),
      purpose,
      receiptUrl,
    },
  });

  redirect("/expenses");
}
