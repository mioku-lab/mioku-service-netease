import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const XEAPI_KEY_PATH = path.join(os.tmpdir(), "xeapi_public_key");

let pending: Promise<void> | null = null;

/** xeapi 加密依赖 tmp 下的公钥，缺失时按官方 app.js 的做法注册一次 */
export function ensureNeteaseSession(): Promise<void> {
  pending ??= provision();
  return pending;
}

async function provision(): Promise<void> {
  if (hasUsableKey()) return;
  try {
    const [{ generateDeviceId }, { getXeapiPublicKey }] = await Promise.all([
      import("@neteasecloudmusicapienhanced/api/util/index.js"),
      import("@neteasecloudmusicapienhanced/api/util/xeapiKey.js"),
    ]);
    const publicKey = await getXeapiPublicKey({}, generateDeviceId());
    fs.writeFileSync(XEAPI_KEY_PATH, JSON.stringify(publicKey), "utf-8");
  } catch {
    // 生成失败时由调用方回退 weapi 加密
  }
}

function hasUsableKey(): boolean {
  try {
    const raw = JSON.parse(fs.readFileSync(XEAPI_KEY_PATH, "utf-8"));
    return Boolean(raw?.sk);
  } catch {
    return false;
  }
}
