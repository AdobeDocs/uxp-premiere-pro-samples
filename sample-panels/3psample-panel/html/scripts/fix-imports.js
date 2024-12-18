const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "../..");
const indexFilePath = path.resolve(rootDir, "build-html/index.js");

console.log(`Fixing imports in ${indexFilePath}`);

const content = fs.readFileSync(indexFilePath, { encoding: "utf-8" });
const newContent = content.replace(
  'Object.defineProperty(exports, "__esModule", { value: true });',
  ""
); // remove the exports property line as we have no global exports at all 
fs.writeFileSync(indexFilePath, newContent, { encoding: "utf-8" });
