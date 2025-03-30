import { loadFile } from "@/lib/server/loadFile";

const storeCode =
  process.env.NODE_ENV === "development"
    ? loadFile("lib/store.ts")
    : loadFile(".next/storeCode.txt"); // 读取构建产物目录

export default storeCode;
