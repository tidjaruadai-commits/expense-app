import { PrismaClient } from "../app/generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve("dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: {},
    create: { name: "สมชาย ใจดี", email: "employee@example.com", role: "EMPLOYEE" },
  });
  await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: { name: "สมหญิง รักงาน", email: "manager@example.com", role: "MANAGER" },
  });
  console.log("Seeded users");
}

main().finally(() => prisma.$disconnect());
