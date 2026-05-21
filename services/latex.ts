import { randomUUID } from "crypto";
import { mkdir, writeFile, readFile } from "fs/promises";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { ApiError } from "@/lib/api-response";

const execFileAsync = promisify(execFile);

export async function compileLatex(source: string, engine: "pdflatex" | "xelatex") {
  if (process.env.LATEX_COMPILE_ENABLED !== "true") {
    return {
      enabled: false,
      pdfBase64: null,
      log: "LaTeX compilation is disabled. Set LATEX_COMPILE_ENABLED=true and install a TeX distribution in the runtime image."
    };
  }

  const workRoot = process.env.LATEX_WORKDIR ?? "/tmp/resubee-latex";
  const workDir = join(workRoot, randomUUID());
  await mkdir(workDir, { recursive: true });
  const texPath = join(workDir, "resume.tex");
  await writeFile(texPath, source, "utf8");

  try {
    await execFileAsync(engine, ["-interaction=nonstopmode", "-halt-on-error", "resume.tex"], {
      cwd: workDir,
      timeout: 15000,
      maxBuffer: 1024 * 1024
    });
    const pdf = await readFile(join(workDir, "resume.pdf"));
    return { enabled: true, pdfBase64: pdf.toString("base64"), log: "Compiled successfully." };
  } catch (error) {
    throw new ApiError(422, `LaTeX compilation failed: ${error instanceof Error ? error.message : "unknown error"}`, "LATEX_FAILED");
  }
}
