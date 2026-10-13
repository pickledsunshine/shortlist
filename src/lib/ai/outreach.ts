import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type OutreachInput = {
  contactName: string;
  contactTitle: string;
  company: string;
  jobTitle: string;
  mutualConnection?: string;
  senderName: string;
  senderRole: string; // brief description e.g. "software engineer with 5 years in fintech"
};

export async function draftOutreachMessage(
  input: OutreachInput
): Promise<string> {
  const mutualLine = input.mutualConnection
    ? `We share a mutual connection: ${input.mutualConnection}.`
    : "";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Write a short, personalised LinkedIn outreach message.

Sender: ${input.senderName} (${input.senderRole})
Recipient: ${input.contactName}, ${input.contactTitle} at ${input.company}
Context: Applying for ${input.jobTitle} at ${input.company}
${mutualLine}

RULES:
- Max 120 words
- Professional but warm — not salesy
- If there's a mutual connection, reference them naturally in the opening
- Mention the specific role
- One clear ask: a brief chat or to be kept in mind
- No generic phrases like "I came across your profile"
- Do NOT include a subject line
- Return ONLY the message text`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "";
}
