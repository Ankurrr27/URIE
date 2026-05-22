import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleApiError, ok, ApiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    rateLimit(`signup:${request.headers.get("x-forwarded-for") ?? "local"}`, 10);
    const body = signupSchema.parse(await request.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, "An account already exists for this email.", "EMAIL_EXISTS");

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        hashedPassword: await bcrypt.hash(body.password, 12)
      },
      select: { id: true, email: true, name: true, role: true }
    });

    return ok(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
