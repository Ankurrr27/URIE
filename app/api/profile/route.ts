import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/rate-limit";
import { profileUpdateSchema } from "@/lib/validations";
import { updateProfileUser } from "@/repositories/user-repository";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`profile:update:${user.id}`, 30);

    const body = profileUpdateSchema.parse(await request.json());
    const updatedUser = await updateProfileUser(user.id, body);

    return ok(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
