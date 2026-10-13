import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import mammoth from "mammoth";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "cv" | "cover-letter-template" | null;

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (![".pdf", ".docx"].includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const filename = `${type}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Extract text for CV files
    let rawText = "";
    if (type === "cv" && ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value;
    }

    // If CV, create a base CvVersion record
    if (type === "cv") {
      await prisma.cvVersion.create({
        data: {
          isBase: true,
          filePath,
          rawText,
        },
      });
    }

    return NextResponse.json({ success: true, filePath, rawText: rawText || undefined });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
