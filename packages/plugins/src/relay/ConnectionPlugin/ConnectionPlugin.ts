import { ITransformerContext } from "@gqlbase/core/context";
import { createPluginFactory, ITransformerPlugin } from "@gqlbase/core/plugins";
import {
  DefinitionNode,
  InputValueNode,
  InterfaceNode,
  ObjectNode,
  FieldNode,
  NonNullTypeNode,
  ListTypeNode,
  NamedTypeNode,
  DirectiveNode,
} from "@gqlbase/core/definition";
import { TransformerPluginExecutionError } from "@gqlbase/shared/errors";
import { pascalCase } from "@gqlbase/shared/format";
import { UtilityDirective } from "../../base/index.js";
import {
  FieldRelationship,
  isRelationField,
  isValidRelationTarget,
  parseFieldRelation,
} from "../../base/RelationsPlugin/index.js";
import { isConnectionNode, isEdgeNode } from "./ConnectionPlugin.utils.js";

export class ConnectionPlugin implements ITransformerPlugin {
  public readonly name = "ConnectionPlugin";
  readonly context: ITransformerContext;

  constructor(context: ITransformerContext) {
    this.context = context;
  }

  private _getConnectionTarget(object: ObjectNode | InterfaceNode, field: FieldNode) {
    const target = this.context.document.getNode(field.type.getTypeName());

    if (!target || !isValidRelationTarget(target)) {
      throw new TransformerPluginExecutionError(
        this.name,
        `Type ${target?.name ?? "unknwon type"} is not a valid connection target for ${object.name}.${field.name} `
      );
    }

    return target;
  }

  private _getFieldConnection(
    object: ObjectNode | InterfaceNode,
    field: FieldNode
  ): Required<FieldRelationship> | null {
    if (isRelationField(field)) {
      return null;
    }

    const target = this._getConnectionTarget(object, field);

    return parseFieldRelation(object, field, target);
  }

  private _setConnectionArguments(field: FieldNode) {
    if (!field.hasArgument("first")) {
      field.addArgument(InputValueNode.create("first", NamedTypeNode.create("Int")));
    }

    if (!field.hasArgument("after")) {
      field.addArgument(InputValueNode.create("after", NamedTypeNode.create("String")));
    }
  }

  private _createConnectionTypes(field: FieldNode, connection: FieldRelationship) {
    const { target } = connection;

    if (!isConnectionNode(target)) {
      const connectionTypeName = pascalCase(target.name, "connection");
      const edgeTypeName = pascalCase(target.name, "edge");

      let connectionType = this.context.document.getNode(connectionTypeName) as ObjectNode;
      let edgeType = this.context.document.getNode(edgeTypeName) as ObjectNode;

      if (!connectionType) {
        connectionType = ObjectNode.create(connectionTypeName, [
          FieldNode.create(
            "edges",
            NonNullTypeNode.create(ListTypeNode.create(NonNullTypeNode.create(edgeTypeName)))
          ),
          FieldNode.create("pageInfo", NonNullTypeNode.create("PageInfo")),
        ]);

        this.context.document.addNode(connectionType);
      }

      if (!edgeType) {
        edgeType = ObjectNode.create(`${target.name}Edge`, [
          FieldNode.create("cursor", NamedTypeNode.create("String"), null, [
            DirectiveNode.create(UtilityDirective.CLIENT_ONLY),
          ]),
          FieldNode.create("node", NamedTypeNode.create(target.name), null, [
            DirectiveNode.create(UtilityDirective.CLIENT_ONLY),
          ]),
        ]);

        this.context.document.addNode(edgeType);
      }

      this._setConnectionArguments(field);
      field.setType(NonNullTypeNode.create(connectionTypeName));
    }
  }

  private _createEdgesConnection(
    parent: ObjectNode | InterfaceNode,
    field: FieldNode,
    connection: FieldRelationship
  ) {
    this._createConnectionTypes(field, connection);
  }

  public init(): void {
    this.context.base.addNode(
      ObjectNode.create("PageInfo", [
        FieldNode.create("hasNextPage", NamedTypeNode.create("Boolean")),
        FieldNode.create("hasPreviousPage", NamedTypeNode.create("Boolean")),
        FieldNode.create("startCursor", NamedTypeNode.create("String")),
        FieldNode.create("endCursor", NamedTypeNode.create("String")),
      ])
    );
  }

  public match(definition: DefinitionNode): boolean {
    if (definition instanceof InterfaceNode || definition instanceof ObjectNode) {
      if (definition.name === "Mutation") return false;
      if (isConnectionNode(definition) || isEdgeNode(definition)) return false;
      if (!definition.fields?.length) return false;

      return true;
    }

    return false;
  }

  public execute(definition: ObjectNode | InterfaceNode) {
    for (const field of definition.fields ?? []) {
      const connection = this._getFieldConnection(definition, field);

      if (!connection) {
        continue;
      }

      if (connection.type === "oneToMany") {
        this._createEdgesConnection(definition, field, connection);
      }
    }
  }
}

export const connectionPlugin = createPluginFactory(ConnectionPlugin);
