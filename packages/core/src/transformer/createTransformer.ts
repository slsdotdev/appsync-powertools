import { IPluginFactory } from "../plugins/IPluginFactory.js";
import { TransformerContext } from "../context/TransformerContext.js";
import { GraphQLTransformer } from "./GraphQLTransformer.js";
import { createLogger, Logger } from "@gqlbase/shared/logger";

export interface GraphQLTransformerOptions {
  outputDirectory?: string;
  plugins: (IPluginFactory | IPluginFactory[])[];
  logger?: Logger;
}

export function createTransformer(options: GraphQLTransformerOptions) {
  const { outputDirectory = "generated", plugins } = options;

  const context = new TransformerContext({ outputDirectory });
  const logger = options.logger ?? createLogger("GraphQLTransformer");

  for (const pluginEntry of plugins.flat()) {
    const plugin = pluginEntry.create(context);
    context.registerPlugin(plugin);
  }

  return new GraphQLTransformer(context, { logger });
}
