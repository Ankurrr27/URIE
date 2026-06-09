import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/rate-limit";
import { extractTextFromPdf } from "@/services/pdf";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { estimateImpact, estimateEvidenceLevel } from "@/features/career-nodes/node-payload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`extract:${user.id}`, 5); // strict rate limiting for resource-heavy operation

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError(400, "A PDF resume file is required.", "MISSING_FILE");
    }

    // Extract text from the PDF file
    const resumeText = await extractTextFromPdf(file);

    // Call OpenAI to parse the resume text and format it as Career Facts
    if (!process.env.OPENAI_API_KEY) {
      throw new ApiError(500, "OpenAI is not configured. Extraction is unavailable.", "AI_NOT_CONFIGURED");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Analyze the following resume text and extract all career facts as structured nodes.
Return a JSON object containing a "nodes" key which maps to an array of extracted nodes.

Resume Text:
${resumeText}

Each node must match this schema:
- type: must be one of ["EXPERIENCE", "EDUCATION", "SKILL", "PROJECT", "CERTIFICATION", "AWARD", "ACHIEVEMENT", "RELEVANT_COURSEWORK", "POSITION_OF_RESPONSIBILITY", "CUSTOM"]
- title: string (e.g. "Software Engineer" or "B.S. Computer Science" or "Next.js" or "Framer Motion Case Study")
- organization: string or null (e.g. company name, university, or skill domain/domain name)
- location: string or null (e.g. "San Francisco, CA" or null)
- startDate: string or null (Format: YYYY-MM-DD or YYYY-MM or null)
- endDate: string or null (Format: YYYY-MM-DD or YYYY-MM or null)
- isCurrent: boolean
- summary: string or null (for experience/projects, summarize key achievement bullets using newlines. Keep achievements quantified.)
- skills: string[] (list of related skills)
- keywords: string[] (relevant ATS keyword tags)

Ensure you output valid JSON matching this schema exactly. Do not include markdown code block wrapper.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an expert system that extracts structured resume data into Career Library Nodes." },
        { role: "user", content: prompt }
      ]
    });

    const parsedData = JSON.parse(response.choices[0]?.message.content ?? "{}");
    const extracted = parsedData.nodes || [];

    const saved = [];
    for (const node of extracted) {
      // Clean dates
      let start: Date | null = null;
      let end: Date | null = null;
      try {
        if (node.startDate) start = new Date(node.startDate);
        if (node.endDate) end = new Date(node.endDate);
      } catch (e) {
        // ignore invalid dates
      }

      const record = await prisma.careerNode.create({
        data: {
          userId: user.id,
          type: node.type || "CUSTOM",
          title: node.title || "Untitled Fact",
          organization: node.organization || null,
          location: node.location || null,
          startDate: start,
          endDate: end,
          isCurrent: Boolean(node.isCurrent),
          summary: node.summary || null,
          skills: Array.isArray(node.skills) ? node.skills : [],
          keywords: Array.isArray(node.keywords) ? node.keywords : [],
          tags: [node.type?.toLowerCase() || "extracted"],
          content: {},
          impactScore: node.summary ? estimateImpact(node.summary) : 30,
          evidenceLevel: node.summary ? estimateEvidenceLevel(node.summary) : 1,
          visibility: true
        }
      });
      saved.push(record);
    }

    return ok(saved, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
