import { CareerNodeType } from "@prisma/client";
import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/rate-limit";
import { careerNodeSchema, composeResumeSchema } from "@/lib/validations";
import { composeResumeFromNodes, createCareerNode } from "@/services/career-node";
import { listCareerNodes } from "@/repositories/career-node-repository";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`career-nodes:list:${user.id}`);

    const url = new URL(request.url);
    const type = url.searchParams.get("type") as CareerNodeType | null;
    const q = url.searchParams.get("q") ?? undefined;

    const nodes = await listCareerNodes({ userId: user.id, type: type ?? undefined, q });

    return ok(nodes);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`career-nodes:create:${user.id}`, 60);

    const url = new URL(request.url);
    if (url.searchParams.get("action") === "compose") {
      const body = composeResumeSchema.parse(await request.json());
      const resume = await composeResumeFromNodes(user.id, body.title, body.nodeIds, body.targetRole ?? undefined);
      return ok(resume, 201);
    }

    const body = careerNodeSchema.parse(await request.json());
    const node = await createCareerNode(user.id, body);
    return ok(node, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
