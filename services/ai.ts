import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

export async function generateResumeAdvice(system: string, prompt: string) {
  const client = getOpenAI();

  if (!client) {
    return {
      provider: "local",
      text: fallbackAdvice(prompt)
    };
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.35,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ]
  });

  return {
    provider: "openai",
    text: response.choices[0]?.message.content?.trim() ?? ""
  };
}

function fallbackAdvice(prompt: string) {
  const words = prompt.split(/\s+/).slice(0, 24).join(" ");
  return [
    "OpenAI is not configured, so URIE used its local rule-based assistant.",
    `Focus the rewrite around: ${words}.`,
    "Use active verbs, add measurable outcomes, and mirror the job description's strongest keywords naturally."
  ].join("\n");
}
