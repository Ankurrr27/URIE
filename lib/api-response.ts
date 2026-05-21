import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "API_ERROR"
  ) {
    super(message);
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid request payload", details: error.flatten() } },
      { status: 422 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" } },
    { status: 500 }
  );
}
