"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(_: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const role = await getRoleByEmail(email);
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: role === "MANAGER" ? "/dashboard" : "/expenses",
    });
    return { error: "" };
  } catch (e) {
    if (e instanceof AuthError) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    throw e;
  }
}

async function getRoleByEmail(email: string) {
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role ?? "EMPLOYEE";
}
