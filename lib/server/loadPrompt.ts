import fs from "fs";
import path from "path";

export const runtime = "nodejs";

let cache: Record<string, string> = {};
export function loadPrompt(filename: string): string {
  if (!cache[filename]) {
    const filePath = path.resolve(process.cwd(), "prompts", filename);
    cache[filename] = fs.readFileSync(filePath, "utf-8");
  }
  return cache[filename];
}
