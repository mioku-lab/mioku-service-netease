import * as fs from "fs";
import type { ResolvedSongUrl } from "../mappers";
import { ensureDir, resolveOutputPath, createTimeoutSignal } from "../utils";

export interface SongDownloadOptions {
  songId: string;
  outputDir?: string;
  fileName?: string;
  resolved: ResolvedSongUrl;
  timeoutMs?: number;
}

export class SongDownloader {
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = 15000) {
    this.timeoutMs = timeoutMs;
  }

  async download(options: SongDownloadOptions): Promise<{ filePath: string; sourceType: "file" }> {
    const filePath = resolveOutputPath({
      outputDir: options.outputDir,
      fileName: options.fileName,
      defaultFileName: `netease-${options.songId}`,
      ext: options.resolved.ext,
    });
    ensureDir(filePath.substring(0, filePath.lastIndexOf("/")) || ".");

    const timeout = createTimeoutSignal(this.timeoutMs);
    try {
      const response = await fetch(options.resolved.url, { signal: timeout.signal });
      if (!response.ok) {
        throw new Error(`下载音频失败: HTTP ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));
    } finally {
      timeout.cancel();
    }

    return { filePath, sourceType: "file" as const };
  }
}
