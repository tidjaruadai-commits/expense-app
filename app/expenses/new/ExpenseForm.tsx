"use client";

import { useActionState, useRef, useState } from "react";
import { submitExpenseRequest, type FormState } from "./actions";

const initialState: FormState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

export default function ExpenseForm() {
  const [state, formAction, pending] = useActionState(
    submitExpenseRequest,
    initialState
  );

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const receiptUrlRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      if (receiptUrlRef.current) receiptUrlRef.current.value = json.url;
      setPreview(json.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* วันที่เดินทาง */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          วันที่เดินทาง <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="date"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FieldError message={state.errors?.date} />
      </div>

      {/* ต้นทาง / ปลายทาง */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ต้นทาง <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="from"
            placeholder="เช่น สำนักงานใหญ่"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FieldError message={state.errors?.from} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ปลายทาง <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="to"
            placeholder="เช่น ลูกค้า บริษัท A"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FieldError message={state.errors?.to} />
        </div>
      </div>

      {/* ระยะทาง / จำนวนเงิน */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ระยะทาง (กม.) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="distance"
            min="0.1"
            step="0.1"
            placeholder="0.0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FieldError message={state.errors?.distance} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            จำนวนเงิน (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            min="1"
            step="0.01"
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FieldError message={state.errors?.amount} />
        </div>
      </div>

      {/* วัตถุประสงค์ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          วัตถุประสงค์ <span className="text-red-500">*</span>
        </label>
        <textarea
          name="purpose"
          rows={3}
          placeholder="อธิบายวัตถุประสงค์การเดินทาง"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <FieldError message={state.errors?.purpose} />
      </div>

      {/* แนบใบเสร็จ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          แนบรูปใบเสร็จ
        </label>
        <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 hover:border-blue-400 transition-colors">
          <div className="text-center">
            {preview ? (
              <div className="space-y-2">
                {preview.endsWith(".pdf") ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                    </svg>
                    <span>อัปโหลดสำเร็จ</span>
                  </div>
                ) : (
                  <img
                    src={preview}
                    alt="ใบเสร็จ"
                    className="mx-auto h-32 w-auto rounded object-cover"
                  />
                )}
                <p className="text-xs text-green-600 font-medium">✓ อัปโหลดสำเร็จ</p>
                <label className="cursor-pointer text-xs text-blue-500 underline">
                  เปลี่ยนไฟล์
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-10 w-10 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-2 text-sm text-gray-600">
                  <label className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                    คลิกเพื่อเลือกไฟล์
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF สูงสุด 5MB</p>
              </>
            )}
            {uploading && (
              <p className="mt-2 text-sm text-blue-500 animate-pulse">กำลังอัปโหลด...</p>
            )}
            {uploadError && (
              <p className="mt-2 text-sm text-red-500">{uploadError}</p>
            )}
          </div>
        </div>
        {/* hidden field carries the uploaded URL into the Server Action */}
        <input type="hidden" name="receiptUrl" ref={receiptUrlRef} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending || uploading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "กำลังส่งคำขอ..." : "ส่งคำขอเบิกค่าเดินทาง"}
      </button>
    </form>
  );
}
