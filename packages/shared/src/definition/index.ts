import { globSync, readFileSync } from "node:fs";

export function definitionFromFiles(files: string | string[]): string {
  const paths = globSync(files).map((entry) => entry.toString());

  let definition = "";

  for (const path of paths) {
    definition += readFileSync(path, { encoding: "utf-8" });
  }

  return definition;
}
