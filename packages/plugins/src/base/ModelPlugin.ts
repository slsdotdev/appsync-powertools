import { ITransformerPlugin } from "@gqlbase/core";
import type { ITransformerContext } from "@gqlbase/core/context";
import {
  DefinitionNode,
  DirectiveDefinitionNode,
  DirectiveNode,
  EnumNode,
  FieldNode,
  InputObjectNode,
  InputValueNode,
  InterfaceNode,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectNode,
  ScalarNode,
} from "@gqlbase/core/definition";
import { createPluginFactory, getTypeHint, InternalDirective } from "@gqlbase/core/plugins";
import { TransformerPluginExecutionError } from "@gqlbase/shared/errors";
import { camelCase, pascalCase, pluralize } from "@gqlbase/shared/format";
import { isClientOnly, isReadOnly, isServerOnly, isWriteOnly } from "./UtilitiesPlugin.js";
import { isBuildInScalar } from "@gqlbase/shared/definition";
import { isRelationField } from "./RelationsPlugin.js";

export const ModelDirective = {
  MODEL: "model",
} as const;

export const ModelOperation = {
  // Shorthand for read operations (get, list)
  READ: "read",

  // Shorthand for write operations (create, update, delete)
  WRITE: "write",

  // Query operations
  GET: "get",
  LIST: "list",

  // Mutation operations
  CREATE: "create",
  UPDATE: "update",
  UPSERT: "upsert",
  DELETE: "delete",

  // TBD
  // SYNC: "sync",
  // SUBSCRIBE: "subscribe",
} as const;

type OperationType = (typeof ModelOperation)[keyof typeof ModelOperation];

export const DEFAULT_READ_OPERATIONS: OperationType[] = ["get", "list"];
export const DEFAULT_WRITE_OPERATIONS: OperationType[] = ["create", "update", "delete"];

export const isModel = (definition: DefinitionNode): definition is ObjectNode => {
  return definition instanceof ObjectNode && definition.hasDirective(ModelDirective.MODEL);
};

export const shouldSkipFieldFromMutationInput = (field: FieldNode): boolean => {
  return isReadOnly(field) || isServerOnly(field) || isClientOnly(field) || isRelationField(field);
};

export const shouldSkipFieldFromFilterInput = (field: FieldNode): boolean => {
  return isWriteOnly(field) || isServerOnly(field) || isClientOnly(field) || isRelationField(field);
};

export const shouldSkipFieldFromSortInput = (field: FieldNode): boolean => {
  return isServerOnly(field) || isClientOnly(field);
};

export interface ModelPluginOptions {
  operations: OperationType[];
}

export class ModelPlugin implements ITransformerPlugin {
  public readonly name = "ModelPlugin";
  readonly context: ITransformerContext;
  private _defaultOperations: OperationType[];

  constructor(
    context: ITransformerContext,
    options: ModelPluginOptions = { operations: ["read", "write"] }
  ) {
    this.context = context;

    this._defaultOperations = this._expandOperations(options.operations);
  }

  private _expandOperations(operations: OperationType[]) {
    const expandedOperations = new Set<OperationType>();

    for (const operation of operations) {
      if (operation === "read") {
        DEFAULT_READ_OPERATIONS.forEach((op) => expandedOperations.add(op));
      } else if (operation === "write") {
        DEFAULT_WRITE_OPERATIONS.forEach((op) => expandedOperations.add(op));
      } else {
        expandedOperations.add(operation);
      }
    }

    return Array.from(expandedOperations);
  }

  private _getOperationNames(object: ObjectNode) {
    const directive = object.getDirective("model");

    if (!directive) {
      throw new TransformerPluginExecutionError(
        this.name,
        `@model directive not found for type ${object.name}`
      );
    }

    const args = directive.getArgumentsJSON<{ operations?: OperationType[] }>();

    if (args.operations && args.operations.length > 0) {
      return this._expandOperations(args.operations);
    }

    return this._defaultOperations;
  }

  // #region Filter Inputs

  private _createSizeFilterInput() {
    const input = InputObjectNode.create("SizeFilterInput", [
      InputValueNode.create("ne", NamedTypeNode.create("Int")),
      InputValueNode.create("eq", NamedTypeNode.create("Int")),
      InputValueNode.create("le", NamedTypeNode.create("Int")),
      InputValueNode.create("lt", NamedTypeNode.create("Int")),
      InputValueNode.create("ge", NamedTypeNode.create("Int")),
      InputValueNode.create("gt", NamedTypeNode.create("Int")),
      InputValueNode.create("between", ListTypeNode.create(NonNullTypeNode.create("Int"))),
    ]);

    return input;
  }

  private _createSortDirection() {
    const enumNode = EnumNode.create("SortDirection", ["ASC", "DESC"]);
    return enumNode;
  }

  private _createStringLikeFilterInput(name: string, typeName: string) {
    const input = InputObjectNode.create(name, [
      InputValueNode.create("ne", NamedTypeNode.create(typeName)),
      InputValueNode.create("eq", NamedTypeNode.create(typeName)),
      InputValueNode.create("le", NamedTypeNode.create(typeName)),
      InputValueNode.create("lt", NamedTypeNode.create(typeName)),
      InputValueNode.create("ge", NamedTypeNode.create(typeName)),
      InputValueNode.create("gt", NamedTypeNode.create(typeName)),
      InputValueNode.create("in", ListTypeNode.create(NonNullTypeNode.create(typeName))),
      InputValueNode.create("contains", NamedTypeNode.create(typeName)),
      InputValueNode.create("notContains", NamedTypeNode.create(typeName)),
      InputValueNode.create("between", ListTypeNode.create(NonNullTypeNode.create(typeName))),
      InputValueNode.create("beginsWith", NamedTypeNode.create(typeName)),
      InputValueNode.create("exists", NamedTypeNode.create("Boolean")),
      InputValueNode.create("size", NamedTypeNode.create("SizeFilterInput")),
    ]);

    return input;
  }

  private _createNumberLikeFilterInput(name: string, typeName: string) {
    const input = InputObjectNode.create(name, [
      InputValueNode.create("ne", NamedTypeNode.create(typeName)),
      InputValueNode.create("eq", NamedTypeNode.create(typeName)),
      InputValueNode.create("le", NamedTypeNode.create(typeName)),
      InputValueNode.create("lt", NamedTypeNode.create(typeName)),
      InputValueNode.create("ge", NamedTypeNode.create(typeName)),
      InputValueNode.create("gt", NamedTypeNode.create(typeName)),
      InputValueNode.create("in", ListTypeNode.create(NonNullTypeNode.create(typeName))),
      InputValueNode.create("between", ListTypeNode.create(NonNullTypeNode.create(typeName))),
      InputValueNode.create("exists", NamedTypeNode.create("Boolean")),
    ]);

    return input;
  }

  private _createBooleanLikeFilterInput(name: string, typeName: string) {
    const input = InputObjectNode.create(name, [
      InputValueNode.create("ne", NamedTypeNode.create(typeName)),
      InputValueNode.create("eq", NamedTypeNode.create(typeName)),
      InputValueNode.create("exists", NamedTypeNode.create("Boolean")),
    ]);

    return input;
  }

  private _createIDLikeFilterInput(name: string, typeName: string) {
    const input = InputObjectNode.create(name, [
      InputValueNode.create("ne", NamedTypeNode.create(typeName)),
      InputValueNode.create("eq", NamedTypeNode.create(typeName)),
      InputValueNode.create("in", ListTypeNode.create(NonNullTypeNode.create(typeName))),
      InputValueNode.create("exists", NamedTypeNode.create("Boolean")),
    ]);

    return input;
  }

  private _createListLikeFilterInput(name: string, typeName: string) {
    const input = InputObjectNode.create(name, [
      InputValueNode.create("contains", NamedTypeNode.create(typeName)),
      InputValueNode.create("notContains", NamedTypeNode.create(typeName)),
      InputValueNode.create("size", NamedTypeNode.create("SizeFilterInput")),
    ]);

    return input;
  }

  private _createEnumLikeFilterInput(name: string, typeName: string) {
    const input = InputObjectNode.create(name, [
      InputValueNode.create("eq", NamedTypeNode.create(typeName)),
      InputValueNode.create("ne", NamedTypeNode.create(typeName)),
      InputValueNode.create("in", ListTypeNode.create(NonNullTypeNode.create(typeName))),
      InputValueNode.create("exists", NamedTypeNode.create("Boolean")),
    ]);

    return input;
  }

  private _createScalarFilterInput(node: ScalarNode, inputName: string) {
    const scalarType = getTypeHint(node);

    switch (scalarType) {
      case "string":
        return this._createStringLikeFilterInput(inputName, node.name);
      case "int":
      case "float":
        return this._createNumberLikeFilterInput(inputName, node.name);
      case "boolean":
        return this._createBooleanLikeFilterInput(inputName, node.name);
      case "id":
        return this._createIDLikeFilterInput(inputName, node.name);
      default:
        return null;
    }
  }

  private _createFilterInput(target: ObjectNode | InterfaceNode): InputObjectNode {
    const filterInputName = pascalCase(target.name, "filter", "input");
    let filterInput = this.context.document.getNode(filterInputName);

    if (filterInput && !(filterInput instanceof InputObjectNode)) {
      throw new TransformerPluginExecutionError(
        this.name,
        `Type ${filterInputName} is not an input type`
      );
    }

    if (!filterInput) {
      filterInput = InputObjectNode.create(filterInputName);

      for (const field of target.fields ?? []) {
        if (shouldSkipFieldFromFilterInput(field)) {
          continue;
        }

        const typeName = field.type.getTypeName();
        const inputName = pascalCase(typeName, "filter", "input");

        if (isBuildInScalar(typeName)) {
          filterInput.addField(InputValueNode.create(field.name, NamedTypeNode.create(inputName)));
          continue;
        }

        const typeDef = this.context.document.getNodeOrThrow(typeName);

        if (typeDef instanceof ScalarNode) {
          const scalarFilterInputName = pascalCase(typeDef.name, "filter", "input");

          if (!this.context.document.hasNode(scalarFilterInputName)) {
            const scalarFilterInput = this._createScalarFilterInput(typeDef, scalarFilterInputName);

            if (scalarFilterInput) {
              this.context.document.addNode(scalarFilterInput);
            }
          }
        }

        if (field.type instanceof ListTypeNode && typeDef instanceof ScalarNode) {
          const listFilterInputName = pascalCase(typeDef.name, "list", "filter", "input");

          if (!this.context.document.hasNode(listFilterInputName)) {
            const listFilterInput = this._createListLikeFilterInput(listFilterInputName, typeName);
            this.context.document.addNode(listFilterInput);
          }

          filterInput.addField(
            InputValueNode.create(field.name, NamedTypeNode.create(listFilterInputName))
          );

          continue;
        }

        if (typeDef instanceof EnumNode) {
          if (!this.context.document.hasNode(inputName)) {
            this.context.document.addNode(this._createEnumLikeFilterInput(inputName, typeDef.name));
          }

          filterInput.addField(InputValueNode.create(field.name, NamedTypeNode.create(inputName)));
        }

        // TODO: handle custom scalars filter inputs based on @gqlbase_typehint directive
        // TODO: handle nested objects filtering
      }

      filterInput.addField(InputValueNode.create("and", ListTypeNode.create(filterInputName)));
      filterInput.addField(InputValueNode.create("or", ListTypeNode.create(filterInputName)));
      filterInput.addField(InputValueNode.create("not", NamedTypeNode.create(filterInputName)));

      this.context.document.addNode(filterInput);
    }

    return filterInput;
  }

  private _createMutationInput(
    model: ObjectNode,
    inputName: string,
    requiredFields: string[] = []
  ) {
    const input = InputObjectNode.create(inputName);

    for (const field of model.fields ?? []) {
      if (shouldSkipFieldFromMutationInput(field)) {
        continue;
      }

      const fieldTypeName = field.type.getTypeName();

      if (requiredFields.includes(field.name)) {
        input.addField(InputValueNode.create(field.name, NonNullTypeNode.create(fieldTypeName)));
        continue;
      }

      // Buildin scalars
      if (isBuildInScalar(fieldTypeName)) {
        input.addField(InputValueNode.create(field.name, NamedTypeNode.create(fieldTypeName)));
        continue;
      }

      const typeDef = this.context.document.getNode(fieldTypeName);

      if (!typeDef) {
        throw new TransformerPluginExecutionError(this.name, `Unknown type ${fieldTypeName}`);
      }

      if (typeDef instanceof ScalarNode || typeDef instanceof EnumNode) {
        input.addField(InputValueNode.create(field.name, NamedTypeNode.create(fieldTypeName)));
        continue;
      }

      if (typeDef instanceof ObjectNode) {
        if (typeDef.hasDirective("model")) {
          continue;
        }

        const inputName = pascalCase(fieldTypeName, "input");

        if (!this.context.document.hasNode(inputName)) {
          this._createMutationInput(typeDef, inputName);
        }

        input.addField(InputValueNode.create(field.name, NamedTypeNode.create(inputName)));
      }
    }

    this.context.document.addNode(input);
  }

  // #endregion Filter Inputs

  // #region Operations

  private _createGetQueryField(model: ObjectNode) {
    const fieldName = camelCase("get", model.name);
    const queryNode = this.context.document.getQueryNode();

    if (!queryNode.hasField(fieldName)) {
      const field = FieldNode.create(
        fieldName,
        NamedTypeNode.create(model.name),
        [InputValueNode.create("id", NonNullTypeNode.create("ID"))],
        [DirectiveNode.create("hasOne")]
      );

      queryNode.addField(field);
    }
  }

  /**
   * TODO: Handle sort input
   */
  private _createListQueryField(model: ObjectNode) {
    const fieldName = camelCase("list", pluralize(model.name));
    const filterInputName = pascalCase(model.name, "filter", "input");
    const queryNode = this.context.document.getQueryNode();

    if (!this.context.document.hasNode(filterInputName)) {
      this._createFilterInput(model);
    }

    let field = queryNode.getField(fieldName);

    if (!field) {
      field = FieldNode.create(fieldName, NamedTypeNode.create(model.name), null, [
        DirectiveNode.create("hasMany"),
      ]);

      queryNode.addField(field);
    }

    if (!field.hasArgument("filter")) {
      field.addArgument(InputValueNode.create("filter", NamedTypeNode.create(filterInputName)));
    }
  }

  private _createDeleteMutationField(model: ObjectNode) {
    const fieldName = camelCase("delete", model.name);
    const mutationNode = this.context.document.getMutationNode();

    if (!mutationNode.hasField(fieldName)) {
      const field = FieldNode.create(fieldName, NamedTypeNode.create(model.name), [
        InputValueNode.create("id", NonNullTypeNode.create(NamedTypeNode.create("ID"))),
      ]);

      mutationNode.addField(field);
    }
  }

  private _createMutationField(model: ObjectNode, verb: "create" | "update" | "upsert") {
    const fieldName = camelCase(verb, model.name);
    const inputName = pascalCase(verb, model.name, "input");
    const mutationNode = this.context.document.getMutationNode();

    if (!this.context.document.getNode(inputName)) {
      this._createMutationInput(model, inputName, verb === "update" ? ["id"] : []);
    }

    if (!mutationNode.hasField(fieldName)) {
      const field = FieldNode.create(fieldName, NamedTypeNode.create(model.name), [
        InputValueNode.create("input", NonNullTypeNode.create(NamedTypeNode.create(inputName))),
      ]);

      mutationNode.addField(field);
    }
  }

  // #endregion Operations

  public init() {
    this.context.base
      .addNode(
        EnumNode.create("ModelOperation", Object.values(ModelOperation), [
          DirectiveNode.create(InternalDirective.INTERNAL),
        ])
      )
      .addNode(
        DirectiveDefinitionNode.create(
          "model",
          ["OBJECT"],
          [
            InputValueNode.create(
              "operations",
              ListTypeNode.create(NonNullTypeNode.create("ModelOperation"))
            ),
          ]
        )
      )
      .addNode(this._createIDLikeFilterInput("IDFilterInput", "ID"))
      .addNode(this._createStringLikeFilterInput("StringFilterInput", "String"))
      .addNode(this._createNumberLikeFilterInput("IntFilterInput", "Int"))
      .addNode(this._createNumberLikeFilterInput("FloatFilterInput", "Float"))
      .addNode(this._createBooleanLikeFilterInput("BooleanFilterInput", "Boolean"))
      .addNode(this._createSizeFilterInput())
      .addNode(this._createSortDirection());
  }

  public match(definition: DefinitionNode) {
    return isModel(definition);
  }

  public execute(definition: ObjectNode) {
    // 1. Add operation fields
    const operations = this._getOperationNames(definition);

    for (const verb of operations) {
      switch (verb) {
        case "get":
          this._createGetQueryField(definition);
          continue;
        case "list":
          this._createListQueryField(definition);
          continue;
        case "delete":
          this._createDeleteMutationField(definition);
          continue;
        case "create":
        case "upsert":
        case "update":
          this._createMutationField(definition, verb);
          continue;
        default:
          continue;
      }
    }
  }

  public cleanup(definition: ObjectNode): void {
    definition.removeDirective(ModelDirective.MODEL);
  }

  public after(): void {
    this.context.document.removeNode(ModelDirective.MODEL).removeNode("ModelOperation");
  }
}

export const modelPlugin = createPluginFactory(ModelPlugin);
