import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// 简单缓存，避免重复读取
const fileCache: Record<string, string> = {};

/**
 * 加载项目根目录下的任意源码文件，带缓存
 * @param relativePath 相对项目根目录的路径，如 "lib/store.ts"
 */
export function loadFile(relativePath: string): string {
  if (!fileCache[relativePath]) {
    const fullPath = path.resolve(process.cwd(), relativePath);
    fileCache[relativePath] = fs.readFileSync(fullPath, "utf-8");
  }
  return fileCache[relativePath];
}
