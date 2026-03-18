import path from "node:path";
import fs from "node:fs";

export const ensureOutputDirectoryExists = (outputPath: string) => {
  const outputDir = path.resolve(process.cwd(), outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
};

export function writeOutputFile(outDir: string, fileName: string, content: string): void {
  ensureOutputDirectoryExists(outDir);

  const outputPath = path.resolve(outDir, fileName);
  fs.writeFileSync(outputPath, content, { encoding: "utf-8" });
}
