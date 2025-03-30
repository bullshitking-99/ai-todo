const fs = require("fs");
const path = require("path");

const source = fs.readFileSync("lib/store.ts", "utf-8");
const output = `const storeCode = ${JSON.stringify(
  source
)};\n\nexport default storeCode;\n`;

const outDir = path.resolve("build/gen");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "storeCode.ts"), output);
