import * as fs from "fs";
import { ensureDir, resolveOutputPath, createTimeoutSignal } from "../utils";

export interface CoverDownloadOptions {
  artworkUrl: string;
  outputDir?: string;
  fileName?: string;
  size?: number;
  timeoutMs?: number;
}

export class CoverDownloader {
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = 15000) {
    this.timeoutMs = timeoutMs;
  }

  async download(options: CoverDownloadOptions): Promise<{ filePath: string }> {
    const url = normalizeArtworkUrl(options.artworkUrl, options.size ?? 600);
    const ext = inferImageExt(url);
    const filePath = resolveOutputPath({
      outputDir: options.outputDir,
      fileName: options.fileName,
      defaultFileName: `netease-cover-${Date.now()}`,
      ext,
    });
    ensureDir(filePath.substring(0, filePath.lastIndexOf("/")) || ".");

    const timeout = createTimeoutSignal(this.timeoutMs);
    try {
      const response = await fetch(url, { signal: timeout.signal });
      if (!response.ok) {
        throw new Error(`下载封面失败: HTTP ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));
    } finally {
      timeout.cancel();
    }

    return { filePath };
  }
}

function normalizeArtworkUrl(url: string, size: number): string {
  const sanitized = String(url || "").trim();
  if (!sanitized) {
    throw new Error("封面 URL 为空");
  }
  if (sanitized.includes("?param=")) {
    return sanitized;
  }
  return `${sanitized}?param=${size}y${size}`;
}

function inferImageExt(url: string): string {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".webp")) return "webp";
  if (lower.endsWith(".gif")) return "gif";
  return "jpg";
}
