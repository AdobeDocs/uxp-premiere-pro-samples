const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "../..");
const dstDir = path.resolve(rootDir, "build-html/src");
console.log(`Fixing imports in ${dstDir}`);

const files = fs.readdirSync(dstDir);

files.forEach((file) => {
  const filePath = path.resolve(dstDir, file);
  const content = fs.readFileSync(filePath, { encoding: "utf-8" });
  const newContent = content
    .replace(
      /Object\.defineProperty(exports, "__esModule", { value: true });/g,
      ""
    )
    .replace(/exports\./g, "module.exports.");

  fs.writeFileSync(filePath, newContent, { encoding: "utf-8" });
});
