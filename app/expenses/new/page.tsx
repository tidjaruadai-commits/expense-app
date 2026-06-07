import ExpenseForm from "./ExpenseForm";

export default function NewExpensePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ขอเบิกค่าเดินทาง</h1>
          <p className="mt-1 text-sm text-gray-500">
            กรอกข้อมูลการเดินทางให้ครบถ้วน แล้วกดส่งคำขอ
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <ExpenseForm />
        </div>
      </div>
    </main>
  );
}
