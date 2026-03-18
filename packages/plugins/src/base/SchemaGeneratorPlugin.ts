import { createPluginFactory, ITransformerContext, ITransformerPlugin } from "@gqlbase/core";
import { writeOutputFile } from "@gqlbase/shared/files";

export class SchemaGeneratorPlugin implements ITransformerPlugin {
  public readonly name = "SchemaGeneratorPlugin";
  readonly context: ITransformerContext;

  constructor(context: ITransformerContext) {
    this.context = context;
  }

  public init(): void {
    // No initialization needed for this plugin
  }

  public match(): boolean {
    return false;
  }

  public generate() {
    const schema = this.context.document.print();
    writeOutputFile(this.context.outputDirectory, "schema.graphql", schema);
  }
}

export const schemaGeneratorPlugin = createPluginFactory(SchemaGeneratorPlugin);
