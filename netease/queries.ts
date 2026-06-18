import ncm from "yms-netease-music-api";
import type {
  NeteaseAlbumDetailBody,
  NeteaseCloudSearchBody,
  NeteaseSongDetailBody,
  NeteaseSongUrlBody,
} from "yms-netease-music-api";
import type { NeteaseQuality } from "../types";
import { resolveBitrate } from "../constants";
import { extractApiCode } from "../utils";
import { CookieState } from "./cookie";

export interface NeteaseQueriesOptions {
  cookie: CookieState;
  quality: NeteaseQuality;
}

export class NeteaseQueries {
  private readonly cookie: CookieState;
  private readonly bitrate: number;

  constructor(options: NeteaseQueriesOptions) {
    this.cookie = options.cookie;
    this.bitrate = resolveBitrate(options.quality);
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
    const res = await ncm.song_url({
      id: songId,
      br: this.bitrate,
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
