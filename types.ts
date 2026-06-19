export type NeteaseQuality = "standard" | "exhigh" | "lossless" | "hires";

export interface NeteaseClientOptions {
  cookie?: string;
  quality?: NeteaseQuality;
  timeoutMs?: number;
}

export interface ProviderSearchSongItem {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  artworkUrl?: string;
  previewUrl?: string;
  durationInMillis?: number;
}

export interface ProviderSearchResult {
  query: string;
  songs: ProviderSearchSongItem[];
}

export interface ProviderSongDetail {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  artworkUrl?: string;
  releaseDate?: string;
  durationInMillis?: number;
  previewUrl?: string;
  audioTraits?: string[];
}

export interface ProviderAlbumTrack {
  id: string;
  name: string;
  artistName: string;
  durationInMillis?: number;
}

export interface ProviderAlbumDetail {
  id: string;
  name: string;
  artistName: string;
  artworkUrl?: string;
  releaseDate?: string;
  tracks: ProviderAlbumTrack[];
}

export interface ProviderSongDownloadResult {
  filePath: string;
  sourceType: "file";
}

export interface ProviderCoverDownloadResult {
  filePath: string;
}

export interface NeteaseClient {
  searchSongs(options: {
    query: string;
    limit?: number;
    offset?: number;
  }): Promise<ProviderSearchResult>;
  getSongDetail(options: { songId: string }): Promise<ProviderSongDetail>;
  getAlbumDetail(options: { albumId: string }): Promise<ProviderAlbumDetail>;
  downloadSongAac(options: {
    songId: string;
    outputDir?: string;
    fileName?: string;
  }): Promise<ProviderSongDownloadResult>;
  downloadCover(options: {
    artworkUrl: string;
    outputDir?: string;
    fileName?: string;
    size?: number;
  }): Promise<ProviderCoverDownloadResult>;
}

export interface NeteaseServiceApi {
  createClient(options?: NeteaseClientOptions): NeteaseClient;
  getDefaultOptions(): NeteaseClientOptions;
}
