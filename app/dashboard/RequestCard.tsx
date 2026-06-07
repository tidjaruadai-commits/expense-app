"use client";

import { useTransition, useRef, useState } from "react";
import { approveRequest, rejectRequest } from "./actions";

type Status = "PENDING" | "APPROVED" | "REJECTED";

type Request = {
  id: number;
  date: Date;
  from: string;
  to: string;
  distance: number;
  amount: number;
  purpose: string;
  status: Status;
  receiptUrl: string | null;
  user: { name: string; email: string };
  approvals: { action: string; comment: string | null; manager: { name: string }; createdAt: Date }[];
};

const statusConfig: Record<Status, { label: string; className: string }> = {
  PENDING: { label: "รอดำเนินการ", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  APPROVED: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "ปฏิเสธแล้ว", className: "bg-red-100 text-red-800 border-red-200" },
};

const cardBorder: Record<Status, string> = {
  PENDING: "border-l-yellow-400",
  APPROVED: "border-l-green-400",
  REJECTED: "border-l-red-400",
};

export default function RequestCard({ request }: { request: Request }) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const { label, className } = statusConfig[request.status];

  function handleAction(type: "approve" | "reject") {
    const comment = commentRef.current?.value ?? "";
    startTransition(async () => {
      if (type === "approve") await approveRequest(request.id, comment);
      else await rejectRequest(request.id, comment);
    });
  }

  const approval = request.approvals[0];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${cardBorder[request.status]} overflow-hidden`}>
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 truncate">{request.user.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
              {label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{request.user.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-gray-900">
            ฿{request.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(request.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm border-t border-gray-100 pt-3">
        <div>
          <span className="text-gray-400">ต้นทาง</span>
          <p className="font-medium text-gray-700 truncate">{request.from}</p>
        </div>
        <div>
          <span className="text-gray-400">ปลายทาง</span>
          <p className="font-medium text-gray-700 truncate">{request.to}</p>
        </div>
        <div className="mt-1">
          <span className="text-gray-400">ระยะทาง</span>
          <p className="font-medium text-gray-700">{request.distance} กม.</p>
        </div>
        <div className="mt-1">
          <span className="text-gray-400">วัตถุประสงค์</span>
          <p className="font-medium text-gray-700 truncate">{request.purpose}</p>
        </div>
      </div>

      {/* Receipt + expand */}
      <div className="px-4 pb-3 flex items-center gap-3">
        {request.receiptUrl && (
          <a
            href={request.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            ดูใบเสร็จ
          </a>
        )}
        {approval && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
          >
            {expanded ? "ซ่อนประวัติ ▲" : "ดูประวัติ ▼"}
          </button>
        )}
      </div>

      {/* Approval history */}
      {expanded && approval && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3 text-sm">
          <p className="text-gray-500 mb-1">
            <span className="font-medium text-gray-700">{approval.manager.name}</span>
            {" "}
            {approval.action === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"}
            {" · "}
            {new Date(approval.createdAt).toLocaleDateString("th-TH")}
          </p>
          {approval.comment && (
            <p className="text-gray-600 bg-gray-50 rounded p-2 text-xs">{approval.comment}</p>
          )}
        </div>
      )}

      {/* Action area — only for PENDING */}
      {request.status === "PENDING" && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          <textarea
            ref={commentRef}
            rows={2}
            placeholder="ความคิดเห็น (ไม่บังคับ)"
            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("approve")}
              disabled={isPending}
              className="flex-1 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold py-2 transition-colors"
            >
              {isPending ? "กำลังดำเนินการ..." : "✓ อนุมัติ"}
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={isPending}
              className="flex-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold py-2 transition-colors"
            >
              {isPending ? "กำลังดำเนินการ..." : "✕ ปฏิเสธ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
