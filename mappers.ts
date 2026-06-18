import type {
  NeteaseAlbumDetailBody,
  NeteaseCloudSearchBody,
  NeteaseSong,
  NeteaseSongUrlItem,
} from "yms-netease-music-api";
import type {
  ProviderAlbumDetail,
  ProviderAlbumTrack,
  ProviderSearchResult,
  ProviderSearchSongItem,
  ProviderSongDetail,
} from "./types";

function joinArtists(song: NeteaseSong): string {
  if (!Array.isArray(song.ar) || song.ar.length === 0) {
    return "未知歌手";
  }
  return song.ar.map((artist) => artist?.name).filter(Boolean).join(" / ");
}

function formatReleaseDate(publishTime: number | undefined): string | undefined {
  if (!publishTime) {
    return undefined;
  }
  return new Date(publishTime).toISOString();
}

function toSearchItem(song: NeteaseSong): ProviderSearchSongItem {
  return {
    id: String(song.id),
    name: song.name || "未知歌曲",
    artistName: joinArtists(song),
    albumName: song.al?.name || "未知专辑",
    artworkUrl: song.al?.picUrl,
    durationInMillis: song.dt,
  };
}

export function mapSearchResult(
  body: NeteaseCloudSearchBody | undefined,
  query: string,
): ProviderSearchResult {
  const songs = body?.result?.songs;
  return {
    query,
    songs: Array.isArray(songs) ? songs.map(toSearchItem) : [],
  };
}

export function mapSongDetail(
  body: { songs?: NeteaseSong[] } | undefined,
  fallbackId: string,
): ProviderSongDetail {
  const song = body?.songs?.[0];
  if (!song) {
    throw new Error(`未找到歌曲详情: ${fallbackId}`);
  }
  return {
    id: String(song.id || fallbackId),
    name: song.name || "未知歌曲",
    artistName: joinArtists(song),
    albumName: song.al?.name || "未知专辑",
    artworkUrl: song.al?.picUrl,
    releaseDate: formatReleaseDate(song.publishTime),
    durationInMillis: song.dt,
  };
}

export function mapAlbumDetail(
  body: NeteaseAlbumDetailBody | undefined,
  fallbackId: string,
): ProviderAlbumDetail {
  const album = body?.album;
  if (!album) {
    throw new Error(`未找到专辑详情: ${fallbackId}`);
  }
  const tracks: ProviderAlbumTrack[] = (body?.songs || []).map((song) => ({
    id: String(song.id),
    name: song.name || "未知曲目",
    artistName: joinArtists(song),
    durationInMillis: song.dt,
  }));
  return {
    id: String(album.id || fallbackId),
    name: album.name || "未知专辑",
    artistName: album.artist?.name || "未知歌手",
    artworkUrl: album.picUrl,
    releaseDate: formatReleaseDate(album.publishTime),
    tracks,
  };
}

export interface ResolvedSongUrl {
  url: string;
  ext: string;
  br: number;
  size: number;
  level: string;
}

export function mapSongUrlItem(
  item: NeteaseSongUrlItem | undefined,
): ResolvedSongUrl {
  if (!item || !item.url) {
    throw new Error("歌曲需要 VIP 或版权受限");
  }
  const ext = inferAudioExt(item);
  return {
    url: item.url,
    ext,
    br: item.br,
    size: item.size,
    level: item.level,
  };
}

function inferAudioExt(item: NeteaseSongUrlItem): string {
  const declared = String(item.type || "").toLowerCase();
  if (declared === "flac") return "flac";
  if (declared === "mp3" || declared === "mpeg") return "mp3";
  if (declared === "m4a") return "m4a";
  if (declared === "ogg") return "ogg";
  if (item.br >= 800_000) return "flac";
  return "mp3";
}
