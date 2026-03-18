import { globSync } from "tinyglobby";
import { readFileSync } from "node:fs";
import path from "node:path";

function validateSourcePaths(paths: string[]): string[] {
  const validPaths: string[] = [];

  for (const filePath of paths) {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === ".graphql" || extension === ".gql") {
      validPaths.push(filePath);
    }
  }

  return validPaths;
}

export function definitionFromFiles(source: string | string[]): string {
  const files = Array.isArray(source) ? source : [source];
  const paths = globSync(files).map((entry) => entry.toString());

  const validPaths = validateSourcePaths(paths);

  if (!validPaths.length) {
    throw new Error(
      `No valid GraphQL files (.graphql, .gql) found in provided source: ${files.join(", ")}`
    );
  }

  let definition = "";

  for (const path of paths) {
    definition += readFileSync(path, { encoding: "utf-8" });
  }

  return definition;
}
