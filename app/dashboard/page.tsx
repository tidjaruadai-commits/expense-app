import { prisma } from "@/lib/prisma";
import RequestCard from "./RequestCard";

const STATUS_ORDER = { PENDING: 0, APPROVED: 1, REJECTED: 2 } as const;

export default async function DashboardPage() {
  const requests = await prisma.expenseRequest.findMany({
    include: {
      user: true,
      approvals: {
        include: { manager: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const others = requests.filter((r) => r.status !== "PENDING");

  const totalAmount = requests.reduce((s, r) => s + r.amount, 0);
  const approvedAmount = requests
    .filter((r) => r.status === "APPROVED")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard หัวหน้า</h1>
          <p className="mt-1 text-sm text-gray-500">จัดการคำขอเบิกค่าเดินทางทั้งหมด</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <SummaryCard label="คำขอทั้งหมด" value={requests.length} color="blue" />
          <SummaryCard label="รอดำเนินการ" value={pending.length} color="yellow" />
          <SummaryCard
            label="อนุมัติแล้ว"
            value={requests.filter((r) => r.status === "APPROVED").length}
            color="green"
          />
          <SummaryCard
            label="ยอดอนุมัติ (บาท)"
            value={`฿${approvedAmount.toLocaleString("th-TH", { minimumFractionDigits: 0 })}`}
            color="emerald"
          />
        </div>

        {/* Pending section */}
        {pending.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-700 mb-3 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
              รอดำเนินการ ({pending.length})
            </h2>
            <div className="space-y-4">
              {pending.map((r) => (
                <RequestCard key={r.id} request={r as any} />
              ))}
            </div>
          </section>
        )}

        {/* History section */}
        {others.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
              ประวัติ ({others.length})
            </h2>
            <div className="space-y-4">
              {others.map((r) => (
                <RequestCard key={r.id} request={r as any} />
              ))}
            </div>
          </section>
        )}

        {requests.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>ยังไม่มีคำขอเบิกค่าเดินทาง</p>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "blue" | "yellow" | "green" | "emerald";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
