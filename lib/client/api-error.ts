export function formatApiError(payload: unknown, fallback = "Request failed") {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "details" in payload.error
  ) {
    const details = payload.error.details as { fieldErrors?: Record<string, string[]> };
    const first = Object.entries(details.fieldErrors ?? {}).find(([, messages]) => messages.length);
    if (first) return `${first[0]}: ${first[1][0]}`;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error
  ) {
    return String(payload.error.message);
  }

  return fallback;
}
