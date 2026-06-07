# Expense App — ระบบเบิกค่าเดินทาง

Next.js 16 · TypeScript · Tailwind CSS · Prisma 7 · SQLite

## Getting Started

```bash
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| URL | หน้าที่ |
|---|---|
| `/expenses/new` | พนักงาน — ยื่นคำขอเบิกค่าเดินทาง |
| `/expenses` | พนักงาน — ดูประวัติคำขอและ comment จากหัวหน้า |
| `/dashboard` | หัวหน้า — อนุมัติ / ปฏิเสธ พร้อม comment |

## Stack

- **Next.js 16** App Router + Server Actions
- **Prisma 7** + `@prisma/adapter-better-sqlite3` (dev)
- **SQLite** สำหรับ dev — เปลี่ยนเป็น PostgreSQL สำหรับ production
- **Tailwind CSS v4**

## Production (PostgreSQL)

แก้ `prisma/schema.prisma` เปลี่ยน provider และ adapter ใน `lib/prisma.ts`:

```prisma
datasource db {
  provider = "postgresql"
}
```

```ts
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
```
