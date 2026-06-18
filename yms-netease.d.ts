// Local shim for `yms-netease-music-api`. The package ships `main: main.js`
// (CommonJS namespace) and `types: interface.d.ts` (per-function declarations),
// but TypeScript can't reconcile "default export is a runtime namespace object"
// with "individual `export function cloudsearch(...)` declarations". Rather than
// rely on subpath type imports that may not resolve through bun, we declare
// only the surface we actually use.

declare module "yms-netease-music-api" {
  export interface RequestBaseConfig {
    cookie?: string;
    realIP?: string;
    proxy?: string;
  }

  export interface APIBaseResponse {
    code: number;
    cookie: string;
    [index: string]: unknown;
  }

  export interface Response<Body = APIBaseResponse> {
    status: number;
    body: Body;
    cookie: string[];
  }

  export const enum SearchType {
    single = 1,
    album = 10,
    artist = 100,
    playlist = 1000,
  }

  interface NeteaseArtist {
    id: number;
    name: string;
    tns?: unknown[];
  }

  interface NeteaseAlbum {
    id: number;
    name: string;
    picUrl: string;
    publishTime?: number;
    artist?: { id: number; name: string };
  }

  export interface NeteaseSong {
    id: number;
    name: string;
    ar: NeteaseArtist[];
    al: NeteaseAlbum;
    dt: number;
    publishTime?: number;
  }

  export interface NeteaseSongUrlItem {
    id: number;
    url: string | null;
    br: number;
    size: number;
    type: string;
    level: string;
    encodeType?: string;
  }

  export interface NeteaseAlbumDetailBody {
    album: NeteaseAlbum & {
      description?: string;
      company?: string;
      songs?: unknown[];
    };
    songs: NeteaseSong[];
  }

  export interface NeteaseSongDetailBody {
    songs: NeteaseSong[];
    privileges: unknown[];
    code: number;
  }

  export interface NeteaseCloudSearchBody extends APIBaseResponse {
    result: {
      songs?: NeteaseSong[];
      songCount?: number;
    };
  }

  export interface NeteaseSongUrlBody extends APIBaseResponse {
    data: NeteaseSongUrlItem[];
  }

  export function cloudsearch(
    params: { keywords: string; type?: SearchType; limit?: number; offset?: number } & RequestBaseConfig,
  ): Promise<Response<NeteaseCloudSearchBody>>;

  export function song_url(
    params: { id: string | number; br?: string | number } & RequestBaseConfig,
  ): Promise<Response<NeteaseSongUrlBody>>;

  export function song_detail(
    params: { ids: string } & RequestBaseConfig,
  ): Promise<Response<NeteaseSongDetailBody>>;

  export function album(
    params: { id: string | number } & RequestBaseConfig,
  ): Promise<Response<NeteaseAlbumDetailBody>>;

  export function lyric(
    params: { id: string | number } & RequestBaseConfig,
  ): Promise<Response<APIBaseResponse>>;

  // Captcha / QR login endpoints — declared for future use; not called yet.
  export function qrcode_create(
    params: RequestBaseConfig,
  ): Promise<Response<{ qrcode: string; qrurl: string; qrimg: string }>>;

  export function qrcode_check(
    params: { key: string } & RequestBaseConfig,
  ): Promise<Response<{ code: number; nickname?: string }>>;

  const ncm: {
    cloudsearch: typeof cloudsearch;
    song_url: typeof song_url;
    song_detail: typeof song_detail;
    album: typeof album;
    lyric: typeof lyric;
    qrcode_create: typeof qrcode_create;
    qrcode_check: typeof qrcode_check;
  };

  export default ncm;
}
