const fs = require("fs");
const path = require("path");

// 构建目录中写入
const distPath = path.resolve(".next/storeCode.txt");
const code = fs.readFileSync("lib/store.ts", "utf-8");
fs.writeFileSync(distPath, code);
