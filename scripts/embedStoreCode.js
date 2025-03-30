const fs = require("fs");
const path = require("path");

const sourcePath = path.resolve("lib/store.ts");
const targetDir = path.resolve("lib/__generated__");
const targetFile = path.join(targetDir, "storeCode.ts");

const rawCode = fs.readFileSync(sourcePath, "utf-8");
const moduleCode = `const storeCode = ${JSON.stringify(
  rawCode
)};\n\nexport default storeCode;\n`;

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetFile, moduleCode);

console.log("✅ storeCode.ts 生成成功");
