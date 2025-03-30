import fs from "fs";
import path from "path";

export async function readFilesRecursive(dir) {
  let allContent = "";

  function readDirectory(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively read subdirectory
        readDirectory(filePath);
      } else if (/\.(jsx|js|html|css)$/i.test(file)) {
        // Only process .jsx, .js, .html, .css files
        const content = fs.readFileSync(filePath, "utf-8");
        allContent += `\n\n### ${filePath} ###\n${content}`;
      }
    }
  }

  readDirectory(dir);
  return allContent;
}
