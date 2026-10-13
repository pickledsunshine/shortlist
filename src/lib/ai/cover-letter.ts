import Anthropic from "@anthropic-ai/sdk";
import type { ParsedJD } from "./jd-parser";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert cover letter writer.
Write cover letters that are confident, specific, and human — not generic or robotic.

RULES:
- Never start with "I am writing to express my interest"
- Never use "I am a passionate..." or "I am a dynamic..."
- Always reference the specific company and role
- Connect real experience from the CV to the job requirements
- Keep it to 3-4 paragraphs, 250-350 words
- Match the tone of the job posting (formal/casual/startup)
- End with a confident, specific call to action`;

export async function generateCoverLetter(
  cvText: string,
  jd: ParsedJD,
  jdText: string,
  templateText?: string
): Promise<string> {
  const instruction = templateText
    ? `Adapt the provided cover letter template for this specific role. Keep the candidate's voice but tailor the content.

TEMPLATE:
${templateText}

`
    : `Write a tailored cover letter from scratch. `;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `${instruction}

TARGET ROLE: ${jd.title} at ${jd.company}
TONE: ${jd.tone}
KEY REQUIREMENTS: ${jd.keyRequirements.slice(0, 3).join("; ")}

CANDIDATE CV:
${cvText.slice(0, 3000)}

FULL JD:
${jdText.slice(0, 1500)}

Return ONLY the cover letter text. No subject line, no "Dear Hiring Manager" prefix needed — start from the first paragraph.`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "";
}
