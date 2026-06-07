import { auth } from "@/auth";
import { ApiError } from "@/lib/api-response";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  return session.user;
}
