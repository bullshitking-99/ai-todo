import storeCode from "@/lib/__generated__/storeCode";
import { loadFile } from "@/lib/server/loadFile";

let cached: string = "";

export function getStoreCode(): string {
  if (process.env.NODE_ENV === "development") {
    // 每次请求重新读取源码
    return loadFile("lib/store.ts");
  }

  // 生产环境读取生成的静态模块
  if (!cached) {
    cached = storeCode;
  }

  return cached;
}
