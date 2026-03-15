import { createLogger } from "@gqlbase/shared/logger";
import { parseConfig } from "../config/parseConfig.js";
import { createTransformer } from "@gqlbase/core";
import { definitionFromFiles } from "@gqlbase/shared/definition";
import path from "node:path";

export interface TransformCliOptions {
  config?: string;
  output?: string;
  verbose?: boolean;
  watch?: boolean;
}

export async function transform(schema: string[], options: TransformCliOptions) {
  const config = await parseConfig({
    config: options.config,
    output: options.output,
    verbose: options.verbose,
    watch: options.watch,
    schema: schema.length ? schema : undefined,
  });

  const logLevel = config.verbose ? "debug" : "info";
  const logger = createLogger("transform", logLevel);

  logger.debug("Starting transformation");
  logger.debug("Input schema", schema);
  logger.debug("Config", config);

  const transformer = createTransformer({
    outputDirectory: config.output,
    plugins: [],
    logger,
  });

  const source = Array.isArray(config.schema)
    ? config.schema.map((s) => path.resolve(process.cwd(), s))
    : path.resolve(process.cwd(), config.schema);

  logger.debug("Resolved schema source", source);

  const definition = definitionFromFiles(
    Array.isArray(config.schema)
      ? config.schema.map((s) => path.resolve(process.cwd(), s))
      : path.resolve(process.cwd(), config.schema)
  );

  logger.debug("Parsed GraphQL definition\n\n", definition);
  transformer.transform(definition);
}
