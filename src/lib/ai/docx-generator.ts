import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TableRow,
  TableCell,
  Table,
  WidthType,
} from "docx";
import type { AdaptedCVSection } from "./cv-adapter";

const NAVY = "1E3A5F";
const EMERALD = "10B981";

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    thematicBreak: false,
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: EMERALD, space: 4 },
    },
    spacing: { before: 280, after: 120 },
    run: { color: NAVY, bold: true, size: 24 },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    text: `• ${text}`,
    spacing: { after: 60 },
    indent: { left: 360 },
  });
}

export async function generateCVDocx(cv: AdaptedCVSection): Promise<Buffer> {
  const children: Paragraph[] = [];

  // ── Header ────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: cv.name, bold: true, size: 52, color: NAVY }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: cv.contact, size: 20, color: "6B7280" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // ── Summary ───────────────────────────────────────────────
  if (cv.summary) {
    children.push(
      sectionHeading("Professional Summary"),
      new Paragraph({ text: cv.summary, spacing: { after: 80 } })
    );
  }

  // ── Experience ────────────────────────────────────────────
  if (cv.experience.length > 0) {
    children.push(sectionHeading("Experience"));
    for (const exp of cv.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role, bold: true, size: 22, color: NAVY }),
            new TextRun({ text: "  ·  ", color: "9CA3AF", size: 20 }),
            new TextRun({ text: exp.company, size: 20 }),
            new TextRun({ text: "  ·  ", color: "9CA3AF", size: 20 }),
            new TextRun({ text: exp.dates, italics: true, size: 20, color: "6B7280" }),
          ],
          spacing: { before: 160, after: 80 },
        })
      );
      for (const b of exp.bullets) {
        children.push(bullet(b));
      }
    }
  }

  // ── Education ─────────────────────────────────────────────
  if (cv.education.length > 0) {
    children.push(sectionHeading("Education"));
    for (const edu of cv.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22, color: NAVY }),
            new TextRun({ text: "  ·  ", color: "9CA3AF", size: 20 }),
            new TextRun({ text: edu.institution, size: 20 }),
            new TextRun({ text: "  ·  ", color: "9CA3AF", size: 20 }),
            new TextRun({ text: edu.dates, italics: true, size: 20, color: "6B7280" }),
          ],
          spacing: { before: 120, after: 80 },
        })
      );
    }
  }

  // ── Skills ────────────────────────────────────────────────
  if (cv.skills.length > 0) {
    children.push(
      sectionHeading("Skills"),
      new Paragraph({
        text: cv.skills.join("  ·  "),
        spacing: { after: 80 },
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export async function generateCoverLetterDocx(
  content: string,
  candidateName: string
): Promise<Buffer> {
  const paragraphs = content
    .split("\n\n")
    .filter(Boolean)
    .map(
      (p) =>
        new Paragraph({
          text: p.trim(),
          spacing: { after: 240 },
          run: { size: 22 },
        })
    );

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: candidateName,
                bold: true,
                size: 28,
                color: NAVY,
              }),
            ],
            spacing: { after: 400 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
