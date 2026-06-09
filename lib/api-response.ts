import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message = "Bad request", details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflict(message = "Conflict") {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function tooManyRequests(retryAfter?: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: retryAfter
        ? { "Retry-After": String(retryAfter) }
        : undefined,
    }
  );
}

export function internalError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }

  // Handle Zod validation errors
  if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
    return NextResponse.json(
      {
        error: {
          message: "Validation failed.",
          code: "VALIDATION_FAILED",
          details: (error as any).flatten(),
        },
      },
      { status: 400 }
    );
  }

  console.error("API error handler caught:", error);
  return NextResponse.json(
    {
      error: {
        message: "Internal server error.",
        code: "INTERNAL_SERVER_ERROR",
      },
    },
    { status: 500 }
  );
}
