import storeCode from "@/build/gen/storeCode";
import { loadFile } from "@/lib/server/loadFile";

let cached: string = "";

export function getStoreCode(): string {
  if (process.env.NODE_ENV === "development") {
    // 开发环境：每次重新读取
    return loadFile("lib/store.ts");
  }

  // 生产环境：只读取一次嵌入版本
  if (!cached) {
    cached = storeCode;
  }

  return cached;
}
