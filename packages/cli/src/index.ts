import { cac } from "cac";
import { readFileSync } from "node:fs";
import { transform } from "./transform/index.js";

export interface CliOptions {
  config?: string;
  output?: string;
  verbose?: boolean;
  watch?: boolean;
}

const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)).toString()
);

const cli = cac("gqlbase");

cli
  .option("-c, --config [file]", "Path to configuration file")
  .option("-o, --output [dir]", "Output directory for generated artifacts")
  .option("-v, --verbose", "Enable verbose logging")
  .option("-w, --watch", "Watch schema files for changes and automatically transform them");

cli.command("[...schema]", "Transform a GraphQL schema").action(transform);

cli.help();
cli.version(version);

export { cli };
