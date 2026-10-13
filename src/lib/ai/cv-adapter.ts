import Anthropic from "@anthropic-ai/sdk";
import type { ParsedJD } from "./jd-parser";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type AdaptedCVSection = {
  name: string;
  contact: string;
  summary: string;
  experience: {
    company: string;
    role: string;
    dates: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    dates: string;
  }[];
  skills: string[];
};

const SYSTEM_PROMPT = `You are an expert CV writer and career coach.
Your task is to adapt a CV to better match a specific job description.

STRICT RULES — NEVER BREAK THESE:
1. NEVER invent, fabricate, or add experience, skills, companies, or achievements not in the original CV
2. Only reword, reorder, and emphasise existing content
3. Use keywords from the job description naturally within existing bullet points
4. Rewrite the professional summary to target this specific role
5. Lead each experience entry with the most relevant achievements first
6. Surface skills that match the job requirements
7. Keep all dates, company names, and job titles exactly as they appear in the original

If the original CV lacks information needed for a field, leave it as-is.`;

export async function adaptCV(
  cvText: string,
  jd: ParsedJD,
  jdText: string
): Promise<AdaptedCVSection> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Adapt this CV for the job below. Return ONLY valid JSON matching the schema. No markdown, no commentary.

TARGET JOB:
Title: ${jd.title} at ${jd.company}
Key requirements: ${jd.keyRequirements.join("; ")}
Must-have skills: ${jd.topSkills.join(", ")}
Keywords to include: ${jd.matchKeywords.join(", ")}
Seniority: ${jd.seniority}
Tone: ${jd.tone}

Full JD:
${jdText.slice(0, 2000)}

ORIGINAL CV:
${cvText}

JSON Schema to return:
{
  "name": "Full Name",
  "contact": "email | phone | location | linkedin",
  "summary": "2-3 sentence professional summary tailored to this role",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "dates": "Month Year – Month Year",
      "bullets": ["achievement 1", "achievement 2", ...]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree, Field",
      "dates": "Year – Year"
    }
  ],
  "skills": ["skill1", "skill2", ...]
}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text) as AdaptedCVSection;
}
