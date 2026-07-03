import { logger } from "mioki";
import type { MiokuService } from "mioku";
import {
  registerServiceConfig,
  getServiceConfig,
} from "mioku";
import { NeteaseClientImpl } from "./client";
import type { NeteaseServiceApi, NeteaseClientOptions } from "./types";
export type {
  NeteaseClient,
  NeteaseClientOptions,
  NeteaseServiceApi,
  ProviderAlbumDetail,
  ProviderAlbumTrack,
  ProviderCoverDownloadResult,
  ProviderSearchResult,
  ProviderSearchSongItem,
  ProviderSongDetail,
  ProviderSongDownloadResult,
} from "./types";

const api: NeteaseServiceApi = {
  createClient(options) {
    return new NeteaseClientImpl(options);
  },

  async getDefaultOptions(): Promise<NeteaseClientOptions> {
    return (await getServiceConfig("netease", "base")) as NeteaseClientOptions;
  },
};

const neteaseService: MiokuService = {
  name: "netease",
  version: "1.0.0",
  description:
    "NetEase Cloud Music service for song search, detail, album detail and audio/cover downloads",
  api,
  async init() {
    await registerServiceConfig("netease", "base", {
      cookie: "",
      quality: "exhigh",
    });
    logger.info("netease 服务已就绪");
  },
};

export default neteaseService;
