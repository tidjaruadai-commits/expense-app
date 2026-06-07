import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type))
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "File size exceeds 5MB" }, { status: 400 });

  // fallback to local storage in dev (no BLOB_READ_WRITE_TOKEN)
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const { writeFile } = await import("fs/promises");
    const path = await import("path");
    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "receipts", filename);
    await writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/receipts/${filename}` });
  }

  const blob = await put(`receipts/${Date.now()}-${file.name}`, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}
