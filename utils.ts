import * as fs from "fs";
import * as path from "path";
import { DEFAULT_TEMP_DIR } from "./constants";

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function safeFilename(value: string, fallback: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return fallback;
  }
  const normalized = trimmed
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .slice(0, 120)
    .trim();
  return normalized || fallback;
}

export function resolveOutputPath(options: {
  outputDir?: string;
  fileName?: string;
  defaultFileName: string;
  ext: string;
}): string {
  const outputDir = options.outputDir || path.join(process.cwd(), DEFAULT_TEMP_DIR);
  const fileName = safeFilename(
    options.fileName || options.defaultFileName,
    options.defaultFileName,
  );
  return path.join(outputDir, `${fileName}.${options.ext}`);
}

export function createTimeoutSignal(timeoutMs: number): {
  signal: AbortSignal;
  cancel: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}

export function extractApiCode(body: unknown): number | undefined {
  if (body && typeof body === "object" && "code" in body) {
    const value = (body as { code: unknown }).code;
    if (typeof value === "number") {
      return value;
    }
  }
  return undefined;
}
