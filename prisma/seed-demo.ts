import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.resolve("dev.db")}` });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Clear existing requests to avoid duplicates on re-run
  await prisma.approval.deleteMany();
  await prisma.expenseRequest.deleteMany();

  const [r1, r2, r3] = await Promise.all([
    prisma.expenseRequest.create({ data: { userId: 1, date: new Date("2026-06-01"), from: "สำนักงานใหญ่", to: "ลูกค้า บริษัท A จำกัด", distance: 45.5, amount: 682.50, purpose: "ประชุมนำเสนอโครงการ Q3", status: "PENDING" } }),
    prisma.expenseRequest.create({ data: { userId: 1, date: new Date("2026-06-03"), from: "บ้าน", to: "สนามบินสุวรรณภูมิ", distance: 32.0, amount: 480.00, purpose: "รับคณะผู้บริหารต่างประเทศ", status: "PENDING" } }),
    prisma.expenseRequest.create({ data: { userId: 1, date: new Date("2026-05-28"), from: "สำนักงาน", to: "โรงพยาบาลกรุงเทพ", distance: 12.0, amount: 180.00, purpose: "ตรวจสุขภาพประจำปี", status: "APPROVED" } }),
  ]);

  await prisma.approval.create({
    data: { requestId: r3.id, managerId: 2, action: "APPROVED", comment: "อนุมัติตามสิทธิ์สวัสดิการพนักงาน" },
  });

  console.log("Demo data seeded:", r1.id, r2.id, r3.id);
}

main().finally(() => prisma.$disconnect());
