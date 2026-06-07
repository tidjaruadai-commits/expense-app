import { prisma } from "@/lib/prisma";
import Link from "next/link";

// hardcode userId=1 until auth
const MY_USER_ID = 1;

const STATUS = {
  PENDING: { label: "รอดำเนินการ", badge: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-400", bar: "bg-yellow-400" },
  APPROVED: { label: "อนุมัติแล้ว", badge: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-400", bar: "bg-green-400" },
  REJECTED: { label: "ปฏิเสธแล้ว", badge: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-400", bar: "bg-red-400" },
} as const;

export default async function MyExpensesPage() {
  const requests = await prisma.expenseRequest.findMany({
    where: { userId: MY_USER_ID },
    include: {
      approvals: {
        include: { manager: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = requests.reduce((s, r) => s + r.amount, 0);
  const approved = requests.filter((r) => r.status === "APPROVED");
  const pending = requests.filter((r) => r.status === "PENDING");
  const rejected = requests.filter((r) => r.status === "REJECTED");

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ประวัติคำขอของฉัน</h1>
            <p className="mt-1 text-sm text-gray-500">สมชาย ใจดี · employee@example.com</p>
          </div>
          <Link
            href="/expenses/new"
            className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + ยื่นคำขอใหม่
          </Link>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          <StatCard label="คำขอทั้งหมด" value={requests.length} cls="bg-blue-50 text-blue-700 border-blue-200" />
          <StatCard label="รอดำเนินการ" value={pending.length} cls="bg-yellow-50 text-yellow-700 border-yellow-200" />
          <StatCard label="อนุมัติแล้ว" value={approved.length} cls="bg-green-50 text-green-700 border-green-200" />
          <StatCard
            label="ยอดที่อนุมัติ"
            value={`฿${approved.reduce((s, r) => s + r.amount, 0).toLocaleString("th-TH", { minimumFractionDigits: 0 })}`}
            cls="bg-emerald-50 text-emerald-700 border-emerald-200"
          />
        </div>

        {/* List */}
        {requests.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="mb-4">ยังไม่มีคำขอ</p>
            <Link href="/expenses/new" className="text-blue-600 hover:underline text-sm">
              ยื่นคำขอแรกของคุณ →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => {
              const st = STATUS[r.status as keyof typeof STATUS];
              const approval = r.approvals[0];
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Status bar top */}
                  <div className={`h-1 w-full ${st.bar}`} />

                  <div className="p-5">
                    {/* Row 1: route + amount + badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {r.from}
                            <span className="mx-1.5 text-gray-400">→</span>
                            {r.to}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.badge}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{r.purpose}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900">
                          ฿{r.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Row 2: meta chips */}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {r.distance} กม.
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        ยื่นเมื่อ {new Date(r.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      {r.receiptUrl && (
                        <a
                          href={r.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-blue-50 text-blue-600 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          ใบเสร็จ
                        </a>
                      )}
                    </div>

                    {/* Row 3: Manager comment */}
                    {approval && (
                      <div className={`mt-4 rounded-lg p-3 text-sm border-l-4 ${
                        approval.action === "APPROVED"
                          ? "bg-green-50 border-green-400"
                          : "bg-red-50 border-red-400"
                      }`}>
                        <div className="flex items-center gap-1.5 font-medium text-gray-700 mb-1">
                          <span className={`inline-block h-2 w-2 rounded-full ${approval.action === "APPROVED" ? "bg-green-400" : "bg-red-400"}`} />
                          {approval.manager.name}
                          <span className="font-normal text-gray-500 text-xs">
                            · {approval.action === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"} เมื่อ{" "}
                            {new Date(approval.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        {approval.comment ? (
                          <p className="text-gray-600">{approval.comment}</p>
                        ) : (
                          <p className="text-gray-400 italic text-xs">ไม่มีความคิดเห็นเพิ่มเติม</p>
                        )}
                      </div>
                    )}

                    {/* Pending hint */}
                    {r.status === "PENDING" && (
                      <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-700 flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        กำลังรอการพิจารณาจากหัวหน้า
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, cls }: { label: string; value: string | number; cls: string }) {
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
