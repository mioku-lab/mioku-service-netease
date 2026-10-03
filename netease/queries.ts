import ncm from "@neteasecloudmusicapienhanced/api";
import type {
  NeteaseAlbumDetailBody,
  NeteaseCloudSearchBody,
  NeteaseSongDetailBody,
  NeteaseSongUrlBody,
} from "@neteasecloudmusicapienhanced/api";
import type { NeteaseQuality } from "../types";
import { extractApiCode } from "../utils";
import { CookieState } from "./cookie";
import { ensureNeteaseSession } from "./session";

function isMissingXeapiKey(error: unknown): boolean {
  return error instanceof Error && error.message.includes("xeapi public key");
}

export interface NeteaseQueriesOptions {
  cookie: CookieState;
  quality: NeteaseQuality;
}

export class NeteaseQueries {
  private readonly cookie: CookieState;
  private readonly level: NeteaseQuality;

  constructor(options: NeteaseQueriesOptions) {
    this.cookie = options.cookie;
    this.level = options.quality;
  }

  async search(
    query: string,
    limit: number = 30,
    offset: number = 0,
  ): Promise<NeteaseCloudSearchBody> {
    const res = await ncm.cloudsearch({
      keywords: query,
      type: 1,
      limit,
      offset,
      ...this.cookie.toRequestConfig(),
    });
    return this.unwrapBody<NeteaseCloudSearchBody>(res.body);
  }

  async songDetail(songId: string): Promise<NeteaseSongDetailBody> {
    const res = await ncm.song_detail({
      ids: String(songId),
      ...this.cookie.toRequestConfig(),
    });
    return this.unwrapBody<NeteaseSongDetailBody>(res.body);
  }

  async albumDetail(albumId: string): Promise<NeteaseAlbumDetailBody> {
    const res = await ncm.album({
      id: albumId,
      ...this.cookie.toRequestConfig(),
    });
    return this.unwrapBody<NeteaseAlbumDetailBody>(res.body);
  }

  async resolveSongUrl(songId: string): Promise<NeteaseSongUrlBody> {
    await ensureNeteaseSession();
    try {
      return await this.requestSongUrl(songId);
    } catch (error) {
      if (!isMissingXeapiKey(error)) throw error;
      return await this.requestSongUrl(songId, "weapi");
    }
  }

  private async requestSongUrl(
    songId: string,
    crypto?: string,
  ): Promise<NeteaseSongUrlBody> {
    const res = await ncm.song_url_v1({
      id: songId,
      level: this.level,
      crypto,
      ...this.cookie.toRequestConfig(),
    });
    return this.unwrapBody<NeteaseSongUrlBody>(res.body);
  }

  private unwrapBody<T>(body: T | undefined): T {
    if (!body) {
      throw new Error("netease API 返回为空");
    }
    const code = extractApiCode(body);
    if (code !== undefined && code !== 200 && code !== 301) {
      throw new Error(`netease API 错误 code=${code}`);
    }
    return body as T;
  }
}
