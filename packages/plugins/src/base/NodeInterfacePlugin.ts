import { createPluginFactory, type ITransformerPlugin } from "@gqlbase/core/plugins";
import type { ITransformerContext } from "@gqlbase/core/context";
import {
  DefinitionNode,
  DirectiveNode,
  FieldNode,
  InputValueNode,
  InterfaceNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectNode,
} from "@gqlbase/core/definition";
import { TransformerPluginExecutionError } from "@gqlbase/shared/errors";

/**
 * Adds a `Node` interface with an `id: ID!` field to the schema and ensures that all types that implement the `Node` interface also have the `id: ID!` field.
 *
 */

export class NodeInterfacePlugin implements ITransformerPlugin {
  public readonly name = "NodeInterfacePlugin";
  readonly context: ITransformerContext;

  constructor(context: ITransformerContext) {
    this.context = context;
  }

  public init(): void {
    this.context.base.addNode(
      InterfaceNode.create("Node", [
        FieldNode.create("id", NonNullTypeNode.create(NamedTypeNode.create("ID"))),
      ])
    );
  }

  match(definition: DefinitionNode): boolean {
    if (definition instanceof ObjectNode) {
      if (definition.hasInterface("Node") || definition.hasDirective("model")) {
        return true;
      }
    }

    return false;
  }

  before(): void {
    const queryNode = this.context.document.getQueryNode();

    if (!queryNode.hasField("node")) {
      queryNode.addField(
        FieldNode.create(
          "node",
          NamedTypeNode.create("Node"),
          [InputValueNode.create("id", NonNullTypeNode.create(NamedTypeNode.create("ID")))],
          [DirectiveNode.create("hasOne")]
        )
      );
    }
  }

  execute(definition: ObjectNode): void {
    const nodeInterface = this.context.document.getNode("Node") as InterfaceNode;

    if (!nodeInterface) {
      throw new TransformerPluginExecutionError(
        this.name,
        "Node Interface not found. Make sure you run `plugin.init()` before executing."
      );
    }

    // In definition has directive `@model` it should also implement `Node` interface
    if (definition.hasDirective("model")) {
      definition.addInterface(nodeInterface.name);
    }

    // Make sure that all fields declared by `Node` interface are declared by definition as well
    const nodeFields = nodeInterface.fields ?? [];

    for (const field of nodeFields) {
      if (!definition.hasField(field.name)) {
        definition.addField(FieldNode.fromDefinition(field.serialize()));
      } else {
        const nodeFieldTypeName = field.type.getTypeName();
        const fieldTypename = definition.getField(field.name)?.type.getTypeName();

        if (nodeFieldTypeName !== fieldTypename) {
          throw new TransformerPluginExecutionError(
            this.name,
            `Field ${field.name} in ${definition.name} has different type than the one declared in Node interface. Expected ${nodeFieldTypeName}, got ${fieldTypename}`
          );
        }
      }
    }
  }

  public after(): void {
    const iface = this.context.document.getNode("Node");

    if (!iface || !(iface instanceof InterfaceNode)) {
      throw new TransformerPluginExecutionError(
        this.name,
        "Node Interface not found. Make sure you run `plugin.init()` before executing."
      );
    }

    // Node interface should have only 1 field, the `id`
    for (const field of iface.fields ?? []) {
      if (field.name !== "id") {
        iface.removeField(field.name);
      }
    }
  }
}

export const nodeInterfacePlugin = createPluginFactory(NodeInterfacePlugin);
