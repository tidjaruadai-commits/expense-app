import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

// Uses DATABASE_URL env var via prisma.config.ts
const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const empPass = await bcrypt.hash("employee123", 10);
  const manPass = await bcrypt.hash("manager123", 10);

  await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: { password: empPass },
    create: { name: "สมชาย ใจดี", email: "employee@example.com", password: empPass, role: "EMPLOYEE" },
  });
  await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: { password: manPass },
    create: { name: "สมหญิง รักงาน", email: "manager@example.com", password: manPass, role: "MANAGER" },
  });
  console.log("Seeded users");
  console.log("  employee@example.com / employee123");
  console.log("  manager@example.com  / manager123");
}

main().finally(() => prisma.$disconnect());
