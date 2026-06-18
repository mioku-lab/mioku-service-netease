export interface CookieStateOptions {
  cookie?: string;
}

export class CookieState {
  private readonly raw: string;

  constructor(options: CookieStateOptions) {
    this.raw = String(options.cookie || "").trim();
  }

  isPresent(): boolean {
    return this.raw.length > 0;
  }

  hasMusicU(): boolean {
    if (!this.raw) return false;
    const match = this.raw.match(/(?:^|;\s*)MUSIC_U=([^;]+)/);
    return Boolean(match && match[1] && match[1].length >= 10);
  }

  toRequestConfig(): { cookie: string } | Record<string, never> {
    return this.raw ? { cookie: this.raw } : {};
  }

  describe(): string {
    if (!this.raw) return "未配置";
    if (!this.hasMusicU()) return "已配置但缺少 MUSIC_U";
    return "已配置";
  }
}
