import { ITransformerContext, TransformerPluginBase } from "@gqlbase/core";

/**
 * Provides utility directives for Drizzle schema generation.
 */
export class DrizzleUtilitiesPlugin extends TransformerPluginBase {
  constructor(context: ITransformerContext) {
    super("DrizzleUtilitiesPlugin", context);
  }
}
