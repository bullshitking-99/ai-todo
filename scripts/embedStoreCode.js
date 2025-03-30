// scripts/embedStoreCode.js
const fs = require("fs");

const rawCode = fs.readFileSync("lib/store.ts", "utf-8");
const moduleCode = `const storeCode = ${JSON.stringify(
  rawCode
)};\n\nexport default storeCode;\n`;

fs.writeFileSync("lib/storeCode.ts", moduleCode);
