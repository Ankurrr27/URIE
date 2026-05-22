import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { profileUpdateSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`profile:update:${session.user.id}`, 30);

    const body = profileUpdateSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        headline: true,
        location: true,
        website: true,
        themePreference: true
      }
    });

    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}
