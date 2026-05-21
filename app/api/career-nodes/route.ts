import { CareerNodeType } from "@prisma/client";
import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { careerNodeSchema, composeResumeSchema } from "@/lib/validations";
import { composeResumeFromNodes, createCareerNode } from "@/services/career-node";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`career-nodes:list:${session.user.id}`);

    const url = new URL(request.url);
    const type = url.searchParams.get("type") as CareerNodeType | null;
    const q = url.searchParams.get("q") ?? undefined;

    const nodes = await prisma.careerNode.findMany({
      where: {
        userId: session.user.id,
        ...(type ? { type } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { organization: { contains: q, mode: "insensitive" } },
                { tags: { has: q } },
                { skills: { has: q } },
                { keywords: { has: q } }
              ]
            }
          : {})
      },
      orderBy: [{ type: "asc" }, { updatedAt: "desc" }]
    });

    return ok(nodes);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`career-nodes:create:${session.user.id}`, 60);

    const url = new URL(request.url);
    if (url.searchParams.get("action") === "compose") {
      const body = composeResumeSchema.parse(await request.json());
      const resume = await composeResumeFromNodes(session.user.id, body.title, body.nodeIds, body.targetRole ?? undefined);
      return ok(resume, 201);
    }

    const body = careerNodeSchema.parse(await request.json());
    const node = await createCareerNode(session.user.id, body);
    return ok(node, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
