import type { NeteaseQuality } from "./types";

export const DEFAULT_QUALITY: NeteaseQuality = "exhigh";
export const DEFAULT_TIMEOUT_MS = 15000;

export const QUALITY_BITRATE: Record<NeteaseQuality, number> = {
  standard: 128_000,
  exhigh: 320_000,
  lossless: 999_000,
  hires: 999_000,
};

export function resolveBitrate(quality: NeteaseQuality | undefined): number {
  return QUALITY_BITRATE[quality || DEFAULT_QUALITY] ?? QUALITY_BITRATE.exhigh;
}

export const DEFAULT_TEMP_DIR = "temp/music";
