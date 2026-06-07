import bcrypt from "bcryptjs";
import { handleApiError, ok, ApiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validations";
import { createCredentialsUser, findUserByEmail } from "@/repositories/user-repository";

export async function POST(request: Request) {
  try {
    rateLimit(`signup:${request.headers.get("x-forwarded-for") ?? "local"}`, 10);
    const body = signupSchema.parse(await request.json());
    const email = body.email.toLowerCase();

    const existing = await findUserByEmail(email);
    if (existing) throw new ApiError(409, "An account already exists for this email.", "EMAIL_EXISTS");

    const user = await createCredentialsUser({
      email,
      name: body.name,
      hashedPassword: await bcrypt.hash(body.password, 12)
    });

    return ok(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
