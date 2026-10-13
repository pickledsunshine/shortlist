import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  const safe = path.basename(filename);
  const filePath = path.join(process.cwd(), "uploads", safe);

  try {
    const buffer = await readFile(filePath);
    const isDocx = safe.endsWith(".docx");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": isDocx
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf",
        "Content-Disposition": `attachment; filename="${safe}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
