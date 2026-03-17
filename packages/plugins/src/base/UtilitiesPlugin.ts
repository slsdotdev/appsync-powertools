import { ITransformerContext } from "@gqlbase/core/context";
import { createPluginFactory, ITransformerPlugin } from "@gqlbase/core/plugins";
import {
  DefinitionNode,
  DirectiveDefinitionNode,
  FieldNode,
  InterfaceNode,
  ObjectNode,
} from "@gqlbase/core/definition";

export const UtilityDirective = {
  /** @serverOnly Marks a field as server-only, meaning it should only be resolved on the server and not exposed to the client. The field will be removed from the final schema */
  SERVER_ONLY: "serverOnly",

  /** @clientOnly Marks a field as client-only, meaning it will be resolved at runtime. This field does not get added to inputs. */
  CLIENT_ONLY: "clientOnly",

  /** @readOnly Marks a field as read-only, meaning it will be included in the schema but cannot be modified by the user. This field does not get added to inputs. */
  READ_ONLY: "readOnly",

  /** @writeOnly Marks a field as write-only, meaning it will only be available in inputs. */
  WRITE_ONLY: "writeOnly",

  /** @filterOnly Marks a field as filter-only, meaning it will only be available in the filter input */
  FILTER_ONLY: "filterOnly",

  /** @createOnly Marks a field as create-only, meaning it will only be available in the create input */
  CREATE_ONLY: "createOnly",

  /** @updateOnly Marks a field as update-only, meaning it will only be available in the update input */
  UPDATE_ONLY: "updateOnly",
} as const;

export const isReadOnly = (node: FieldNode): boolean => {
  return node.hasDirective(UtilityDirective.READ_ONLY);
};

export const isWriteOnly = (node: FieldNode): boolean => {
  return node.hasDirective(UtilityDirective.WRITE_ONLY);
};

export const isServerOnly = (node: FieldNode): boolean => {
  return node.hasDirective(UtilityDirective.SERVER_ONLY);
};

export const isClientOnly = (node: FieldNode): boolean => {
  return node.hasDirective(UtilityDirective.CLIENT_ONLY);
};

export const isFilterOnly = (node: FieldNode): boolean => {
  return node.hasDirective(UtilityDirective.FILTER_ONLY);
};

export const isCreateOnly = (node: FieldNode): boolean => {
  return node.hasDirective(UtilityDirective.CREATE_ONLY);
};

export const isUpdateOnly = (node: FieldNode): boolean => {
  return node.hasDirective(UtilityDirective.UPDATE_ONLY);
};

/**
 * Adds utility directives to the schema that can be used to mark fields as server-only, client-only, read-only, write-only, filter-only, create-only, or update-only.
 */

export class UtilitiesPlugin implements ITransformerPlugin {
  public readonly name = "UtilitiesPlugin";
  readonly context: ITransformerContext;

  constructor(context: ITransformerContext) {
    this.context = context;
  }

  public init(): void {
    this.context.base
      .addNode(DirectiveDefinitionNode.create(UtilityDirective.READ_ONLY, ["FIELD_DEFINITION"]))
      .addNode(DirectiveDefinitionNode.create(UtilityDirective.WRITE_ONLY, ["FIELD_DEFINITION"]))
      .addNode(DirectiveDefinitionNode.create(UtilityDirective.SERVER_ONLY, ["FIELD_DEFINITION"]))
      .addNode(DirectiveDefinitionNode.create(UtilityDirective.CLIENT_ONLY, ["FIELD_DEFINITION"]))
      .addNode(DirectiveDefinitionNode.create(UtilityDirective.FILTER_ONLY, ["FIELD_DEFINITION"]))
      .addNode(DirectiveDefinitionNode.create(UtilityDirective.CREATE_ONLY, ["FIELD_DEFINITION"]))
      .addNode(DirectiveDefinitionNode.create(UtilityDirective.UPDATE_ONLY, ["FIELD_DEFINITION"]));
  }

  public match(definition: DefinitionNode) {
    if (definition instanceof ObjectNode || definition instanceof InterfaceNode) {
      return true;
    }

    return false;
  }

  public cleanup(definition: ObjectNode | InterfaceNode): void {
    for (const field of definition.fields ?? []) {
      if (field.hasDirective(UtilityDirective.READ_ONLY)) {
        field.removeDirective(UtilityDirective.READ_ONLY);
      }

      if (field.hasDirective(UtilityDirective.CLIENT_ONLY)) {
        field.removeDirective(UtilityDirective.CLIENT_ONLY);
      }

      if (field.hasDirective(UtilityDirective.FILTER_ONLY)) {
        definition.removeField(field.name);
      }

      if (field.hasDirective(UtilityDirective.CREATE_ONLY)) {
        definition.removeField(field.name);
      }

      if (field.hasDirective(UtilityDirective.UPDATE_ONLY)) {
        definition.removeField(field.name);
      }

      if (field.hasDirective(UtilityDirective.WRITE_ONLY)) {
        definition.removeField(field.name);
      }

      if (field.hasDirective(UtilityDirective.SERVER_ONLY)) {
        definition.removeField(field.name);
      }
    }
  }

  public after(): void {
    this.context.document
      .removeNode(UtilityDirective.READ_ONLY)
      .removeNode(UtilityDirective.WRITE_ONLY)
      .removeNode(UtilityDirective.SERVER_ONLY)
      .removeNode(UtilityDirective.CLIENT_ONLY)
      .removeNode(UtilityDirective.FILTER_ONLY)
      .removeNode(UtilityDirective.CREATE_ONLY)
      .removeNode(UtilityDirective.UPDATE_ONLY);
  }
}

export const utilsPlugin = createPluginFactory(UtilitiesPlugin);
