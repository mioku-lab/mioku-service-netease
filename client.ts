import { DEFAULT_QUALITY, DEFAULT_TIMEOUT_MS } from "./constants";
import { mapAlbumDetail, mapSearchResult, mapSongDetail, mapSongUrlItem } from "./mappers";
import type {
  NeteaseClient,
  NeteaseClientOptions,
  ProviderAlbumDetail,
  ProviderCoverDownloadResult,
  ProviderSearchResult,
  ProviderSongDetail,
  ProviderSongDownloadResult,
} from "./types";
import { CookieState } from "./netease/cookie";
import { CoverDownloader } from "./netease/cover";
import { SongDownloader } from "./netease/downloader";
import { NeteaseQueries } from "./netease/queries";

export class NeteaseClientImpl implements NeteaseClient {
  private readonly cookie: CookieState;
  private readonly queries: NeteaseQueries;
  private readonly downloader: SongDownloader;
  private readonly cover: CoverDownloader;

  constructor(options?: NeteaseClientOptions) {
    this.cookie = new CookieState({ cookie: options?.cookie });
    this.queries = new NeteaseQueries({
      cookie: this.cookie,
      quality: options?.quality || DEFAULT_QUALITY,
    });
    const timeoutMs = options?.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.downloader = new SongDownloader(timeoutMs);
    this.cover = new CoverDownloader(timeoutMs);
  }

  async searchSongs(options: {
    query: string;
    limit?: number;
    offset?: number;
  }): Promise<ProviderSearchResult> {
    const body = await this.queries.search(
      options.query,
      options.limit ?? 30,
      options.offset ?? 0,
    );
    return mapSearchResult(body, options.query);
  }

  async getSongDetail(options: { songId: string }): Promise<ProviderSongDetail> {
    const body = await this.queries.songDetail(options.songId);
    return mapSongDetail(body, options.songId);
  }

  async getAlbumDetail(options: { albumId: string }): Promise<ProviderAlbumDetail> {
    const body = await this.queries.albumDetail(options.albumId);
    return mapAlbumDetail(body, options.albumId);
  }

  async downloadSongAac(options: {
    songId: string;
    outputDir?: string;
    fileName?: string;
  }): Promise<ProviderSongDownloadResult> {
    const urlBody = await this.queries.resolveSongUrl(options.songId);
    const resolved = mapSongUrlItem(urlBody.data?.[0]);
    return this.downloader.download({
      songId: options.songId,
      outputDir: options.outputDir,
      fileName: options.fileName,
      resolved,
    });
  }

  async downloadCover(options: {
    artworkUrl: string;
    outputDir?: string;
    fileName?: string;
    size?: number;
  }): Promise<ProviderCoverDownloadResult> {
    return this.cover.download(options);
  }
}
