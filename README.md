# mioku-service-netease

NetEase Cloud Music service for `mioku-plugin-music`. Wraps the [@neteasecloudmusicapienhanced/api](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) library (an open-source, maintained fork of NeteaseCloudMusicApi) and exposes a `createClient()` factory that the music plugin's provider registry can consume.

> **未经详细测试，如有运行问题请提出issue**

## API

```ts
const netease = ctx.services?.netease as NeteaseServiceApi | undefined;
const client = netease?.createClient({
  cookie: "MUSIC_U=...; os=pc; appver=8.9.75;",
  quality: "exhigh",
});
```

### `createClient(options?)`

- `cookie?: string` — raw NetEase cookie string. Required for `lossless`/`hires` quality and most detail queries. Search works without it.
- `quality?: "standard" | "exhigh" | "lossless" | "hires"` — default `"exhigh"` (320kbps, no VIP required for most tracks).
- `timeoutMs?: number` — default 15000.

The returned `NeteaseClient` implements the music plugin's `ProviderClient` contract:

```ts
client.searchSongs({ query, limit?, offset? })
client.getSongDetail({ songId })
client.getAlbumDetail({ albumId })
client.downloadSongAac({ songId, outputDir?, fileName? })
client.downloadCover({ artworkUrl, outputDir?, fileName?, size? })
```

## Cookie 管理

无 Cookie 也能搜索，但下载和详情接口会受限。

## 音质档位

| 配置值           | 实际码率            | 是否需要 VIP  |
|---------------|-----------------|-----------|
| `standard`    | 128 kbps        | 否         |
| `exhigh` (默认) | 320 kbps        | 否（绝大多数歌曲） |
| `lossless`    | 999 kbps (FLAC) | 是         |
| `hires`       | 999 kbps        | 是         |

非 VIP 用户请保持 `exhigh`。尝试以 `lossless` 下载 VIP 歌曲时，NetEase 会返回空 URL，服务会抛出 `歌曲需要 VIP 或版权受限` 错误。

## 会话

音质解析走 `song_url_v1`（按 level 档位取流），首次下载会向网易注册一次设备密钥并写入系统临时目录的 `xeapi_public_key`；注册失败时自动回退 `weapi` 加密，不影响下载。
