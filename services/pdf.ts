import pdfParse from "pdf-parse";
import { ApiError } from "@/lib/api-response";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function extractTextFromPdf(file: File) {
  if (file.type !== "application/pdf") {
    throw new ApiError(415, "Only PDF resumes are supported.", "INVALID_FILE_TYPE");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new ApiError(413, "PDF must be smaller than 5MB.", "FILE_TOO_LARGE");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await pdfParse(buffer);
  const text = parsed.text.replace(/\s+/g, " ").trim();

  if (text.length < 100) {
    throw new ApiError(422, "Could not extract enough text from this PDF.", "PDF_TEXT_TOO_SHORT");
  }

  return text;
}
