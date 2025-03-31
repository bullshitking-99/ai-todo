import fs from "fs";
import path from "path";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * 通用文件加载函数（文本文件）
 * - 本地开发时用 fs 读取 public 下文件
 * - 生产部署时用 fetch 读取 public 静态资源
 * @param relativePath 相对 public 的路径，例如 "prompts/chatChain.txt"
 */
export async function loadFile(relativePath: string): Promise<string> {
  if (process.env.NODE_ENV === "development") {
    try {
      const fullPath = path.join(process.cwd(), "public", relativePath);
      return fs.readFileSync(fullPath, "utf-8");
    } catch (err) {
      console.error(`[loadFile] 本地读取失败: ${relativePath}`, err);
      throw err;
    }
  } else {
    try {
      const url = `${baseUrl}/${relativePath}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`[loadFile] fetch 失败: ${url}`);
      }
      return await res.text();
    } catch (err) {
      console.error(`[loadFile] fetch 错误: ${relativePath}`, err);
      throw err;
    }
  }
}
