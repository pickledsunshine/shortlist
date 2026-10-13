import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ParsedJD = {
  title: string;
  company: string;
  seniority: "junior" | "mid" | "senior" | "lead" | "executive" | "unknown";
  tone: "formal" | "casual" | "startup";
  topSkills: string[];
  keyRequirements: string[];
  matchKeywords: string[];
  matchScore?: number; // filled later after CV comparison
};

export async function parseJobDescription(jdText: string): Promise<ParsedJD> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Extract structured data from this job description. Return ONLY valid JSON, no markdown, no commentary.

Schema:
{
  "title": "job title",
  "company": "company name or empty string",
  "seniority": "junior" | "mid" | "senior" | "lead" | "executive" | "unknown",
  "tone": "formal" | "casual" | "startup",
  "topSkills": ["skill1", "skill2", ...],       // max 8 skills/technologies
  "keyRequirements": ["req1", "req2", ...],      // top 5 requirements as short phrases
  "matchKeywords": ["keyword1", "keyword2", ...] // 10-15 important keywords to include in a CV
}

Job description:
${jdText}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text) as ParsedJD;
}

export async function scoreCV(cvText: string, jd: ParsedJD): Promise<number> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 64,
    messages: [
      {
        role: "user",
        content: `Score how well this CV matches the job requirements. Return ONLY a number 0-100.

Job requirements: ${jd.keyRequirements.join(", ")}
Required skills: ${jd.topSkills.join(", ")}
Keywords: ${jd.matchKeywords.join(", ")}

CV text:
${cvText.slice(0, 3000)}

Score (0-100):`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text.trim() : "0";
  const score = parseInt(text.replace(/[^0-9]/g, ""), 10);
  return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
}
