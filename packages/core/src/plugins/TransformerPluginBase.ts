import { ITransformerContext } from "../context/ITransformerContext.js";
import { DefinitionNode } from "../definition/index.js";

import { ITransformerPlugin } from "./ITransformerPlugin.js";

/**
 * A base class for transformer plugins that provides default implementations for the `init` and `match` methods. This allows plugin authors to only implement the methods they need, while still adhering to the `ITransformerPlugin` interface.
 */

export abstract class TransformerPluginBase implements ITransformerPlugin {
  readonly name: string;
  readonly context: ITransformerContext;

  constructor(name: string, context: ITransformerContext) {
    this.name = name;
    this.context = context;
  }

  public init(): void {
    // Default implementation does nothing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public match(definition: DefinitionNode): boolean {
    // Default implementation matches nothing
    return false;
  }
}
