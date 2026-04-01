import ts from "typescript";
import { createPluginFactory, ITransformerContext, TransformerPluginBase } from "@gqlbase/core";
import { isBuildInScalar } from "@gqlbase/shared/definition";
import { createFileHeaders } from "@gqlbase/shared/codegen";
import { getTypeHint, isInternal } from "@gqlbase/core/plugins";
import {
  DefinitionNode,
  EnumNode,
  FieldNode,
  InputObjectNode,
  InputValueNode,
  InterfaceNode,
  isDirectiveDefinitionNode,
  isEnumNode,
  isInputObjectNode,
  isInterfaceNode,
  isNullableTypeNode,
  isObjectNode,
  isOperationNode,
  isScalarNode,
  isUnionNode,
  ListTypeNode,
  NonNullTypeNode,
  ObjectNode,
  TypeNode,
  UnionNode,
} from "@gqlbase/core/definition";
import { TransformerPluginExecutionError } from "@gqlbase/shared/errors";
import { isBaseScalar, type BaseScalarName } from "../../base/ScalarsPlugin/ScalarsPlugin.utils.js";
import {
  hasConstraints,
  parseConstraints,
  isServerOnly,
  isWriteOnly,
} from "../../base/UtilitiesPlugin/index.js";
import { isSemanticNullable } from "../../base/RfcFeaturesPlugin/index.js";
import { isRelationField } from "../../base/RelationsPlugin/index.js";
import {
  CUSTOM_SCALAR_ZOD_MAP,
  mergeOptions,
  ZodSchemaGeneratorPluginOptions,
} from "./ZodSchemaGeneratorPlugin.utils.js";

/**
 * Generates Zod schemas for the defined types in the GraphQL schema. This can be used for runtime validation of data against the schema.
 *
 * @example
 * ```graphql
 * # schema.graphql
 * enum UserRole {
 *   ADMIN
 *   USER
 * }
 *
 * type User {
 *   id: ID!
 *   name: String! `@constraint(min: 3, max: 50)`
 *   email: String!
 *   role: UserRole!
 * }
 * ```
 *
 * ```typescript
 * // generated/zod/validators.typegen.ts
 * import { z } from "zod";
 *
 * export const UserRoleSchema = z.enum(["ADMIN", "USER"]);
 *
 * export const UserSchema = z.object({
 *   id: z.string(),
 *   name: z.string().min(3).max(50),
 *   email: z.string(),
 *   role: UserRoleSchema,
 * });
 * ```
 */

export class ZodSchemaGeneratorPlugin extends TransformerPluginBase {
  private nodes: ts.Node[] = [];
  private options: Required<ZodSchemaGeneratorPluginOptions>;

  constructor(context: ITransformerContext, options: ZodSchemaGeneratorPluginOptions = {}) {
    super("ZodSchemaGeneratorPlugin", context);
    this.options = mergeOptions(options);
  }

  private _getContent() {
    const file = ts.createSourceFile(
      this.options.fileName,
      /*sourceText*/ "",
      ts.ScriptTarget.Latest,
      /*setParentNodes*/ false,
      ts.ScriptKind.TS
    );

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.CarriageReturnLineFeed,
      removeComments: false,
    });

    return printer.printList(ts.ListFormat.MultiLine, ts.factory.createNodeArray(this.nodes), file);
  }

  private _zCall(name: string, args: ts.Expression[] = []): ts.Expression {
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("z"),
        ts.factory.createIdentifier(name)
      ),
      undefined,
      args
    );
  }

  private _chainCall(
    expr: ts.Expression,
    method: string,
    args: ts.Expression[] = []
  ): ts.Expression {
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(expr, ts.factory.createIdentifier(method)),
      undefined,
      args
    );
  }

  private _parseZodExpression(zodCode: string): ts.Expression {
    const sourceFile = ts.createSourceFile("temp.ts", zodCode, ts.ScriptTarget.Latest, false);
    const statement = sourceFile.statements[0];
    if (ts.isExpressionStatement(statement)) {
      return statement.expression;
    }
    throw new TransformerPluginExecutionError(
      this.name,
      `Failed to parse Zod expression: ${zodCode}`
    );
  }

  private _createScalarZodExpression(typeName: string, suffix = "Schema"): ts.Expression {
    if (isBuildInScalar(typeName)) {
      switch (typeName) {
        case "ID":
        case "String":
          return this._zCall("string");
        case "Int":
          return this._zCall("int");
        case "Float":
          return this._zCall("number");
        case "Boolean":
          return this._zCall("boolean");
      }
    }

    if (isBaseScalar(typeName)) {
      const zodCode = CUSTOM_SCALAR_ZOD_MAP[typeName as BaseScalarName];
      return this._parseZodExpression(zodCode);
    }

    const typeDef = this.context.document.getNodeOrThrow(typeName);

    if (isScalarNode(typeDef)) {
      const hint = getTypeHint(typeDef);
      switch (hint) {
        case "id":
        case "string":
          return this._zCall("string");
        case "number":
          return this._zCall("number");
        case "boolean":
          return this._zCall("boolean");
        case "object":
          return this._parseZodExpression("z.record(z.string(), z.unknown())");
        case "unknown":
        default:
          return this._zCall("unknown");
      }
    }

    return ts.factory.createIdentifier(`${typeName}${suffix}`);
  }

  private _applyConstraints(expr: ts.Expression, field: FieldNode | InputValueNode): ts.Expression {
    if (!hasConstraints(field)) {
      return expr;
    }

    const constraints = parseConstraints(field);

    let result = expr;

    if (constraints.min !== undefined) {
      result = this._chainCall(result, "min", [ts.factory.createNumericLiteral(constraints.min)]);
    }

    if (constraints.max !== undefined) {
      result = this._chainCall(result, "max", [ts.factory.createNumericLiteral(constraints.max)]);
    }

    if (constraints.pattern !== undefined) {
      result = this._chainCall(result, "regex", [
        ts.factory.createRegularExpressionLiteral(`/${constraints.pattern}/`),
      ]);
    }

    return result;
  }

  private _applyNullable(expr: ts.Expression, level: number): ts.Expression {
    const nullable = this._chainCall(expr, "nullable");
    return level === 0 ? this._chainCall(nullable, "optional") : nullable;
  }

  private _createOutputFieldZodExpression(
    field: FieldNode,
    fieldType: TypeNode,
    level = 0
  ): ts.Expression {
    if (fieldType instanceof NonNullTypeNode) {
      return this._createOutputFieldZodExpression(field, fieldType.type, level);
    }

    if (fieldType instanceof ListTypeNode) {
      const elementExpr = this._createOutputFieldZodExpression(field, fieldType.type, level + 1);
      let arrayExpr = this._zCall("array", [elementExpr]);

      if (isSemanticNullable(field, level)) {
        arrayExpr = this._applyNullable(arrayExpr, level);
      }

      return arrayExpr;
    }

    // Named type (leaf)
    let expr = this._createScalarZodExpression(fieldType.name);
    expr = this._applyConstraints(expr, field);

    if (isSemanticNullable(field, level)) {
      expr = this._applyNullable(expr, level);
    }

    return expr;
  }

  private _createInputFieldZodExpression(
    field: InputValueNode,
    fieldType: TypeNode,
    level = 0,
    suffix = "Schema"
  ): ts.Expression {
    if (fieldType instanceof NonNullTypeNode) {
      return this._createInputFieldZodExpression(field, fieldType.type, level, suffix);
    }

    if (fieldType instanceof ListTypeNode) {
      const elementExpr = this._createInputFieldZodExpression(
        field,
        fieldType.type,
        level + 1,
        suffix
      );
      let arrayExpr = this._zCall("array", [elementExpr]);

      if (isNullableTypeNode(field.type, level)) {
        arrayExpr = this._applyNullable(arrayExpr, level);
      }

      return arrayExpr;
    }

    let expr = this._createScalarZodExpression(fieldType.name, suffix);
    expr = this._applyConstraints(expr, field);

    if (isNullableTypeNode(field.type, level)) {
      expr = this._applyNullable(expr, level);
    }

    return expr;
  }

  private _createObjectFieldProperties(
    definition: ObjectNode | InterfaceNode
  ): ts.ObjectLiteralElementLike[] {
    const properties: ts.ObjectLiteralElementLike[] = [];

    for (const field of definition.fields ?? []) {
      if (
        isInternal(field) ||
        isWriteOnly(field) ||
        isServerOnly(field) ||
        isRelationField(field)
      ) {
        continue;
      }

      const zodExpr = this._createOutputFieldZodExpression(field, field.type);

      properties.push(
        ts.factory.createPropertyAssignment(ts.factory.createIdentifier(field.name), zodExpr)
      );
    }

    return properties;
  }

  private _createInputFieldProperties(
    definition: InputObjectNode,
    excludes: string[] = [],
    suffix = "Schema"
  ): ts.ObjectLiteralElementLike[] {
    const properties: ts.ObjectLiteralElementLike[] = [];

    for (const field of definition.fields ?? []) {
      if (excludes.includes(field.name)) {
        continue;
      }

      const zodExpr = this._createInputFieldZodExpression(field, field.type, 0, suffix);

      properties.push(
        ts.factory.createPropertyAssignment(ts.factory.createIdentifier(field.name), zodExpr)
      );
    }

    return properties;
  }

  private _createSchemaConstDeclaration(
    name: string,
    initializer: ts.Expression,
    suffix = "Schema",
    exported = true
  ): ts.VariableStatement {
    return ts.factory.createVariableStatement(
      exported ? [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)] : undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(`${name}${suffix}`),
            undefined,
            undefined,
            initializer
          ),
        ],
        ts.NodeFlags.Const
      )
    );
  }

  private _getSelfReferenceFields(definition: InputObjectNode): InputValueNode[] {
    const selfRefs: InputValueNode[] = [];

    for (const field of definition.fields ?? []) {
      if (field.type.getTypeName() === definition.name) {
        selfRefs.push(field);
      }
    }

    return selfRefs;
  }

  private _generateEnum(definition: EnumNode) {
    if (!definition.values?.length) {
      throw new TransformerPluginExecutionError(
        this.name,
        `Enum type ${definition.name} must have at least one value.`
      );
    }

    const args = definition.values.map((v) => ts.factory.createStringLiteral(v.name));

    const initializer = this._zCall("enum", [ts.factory.createArrayLiteralExpression(args)]);

    this.nodes.push(this._createSchemaConstDeclaration(definition.name, initializer));
  }

  private _generateObject(definition: ObjectNode | InterfaceNode) {
    const properties = this._createObjectFieldProperties(definition);

    const initializer = this._zCall("object", [
      ts.factory.createObjectLiteralExpression(properties, true),
    ]);

    this.nodes.push(this._createSchemaConstDeclaration(definition.name, initializer));
  }

  private _generateInputObject(definition: InputObjectNode) {
    const selfRefs = this._getSelfReferenceFields(definition);

    if (selfRefs.length > 0) {
      const properties = this._createInputFieldProperties(
        definition,
        selfRefs.map((f) => f.name)
      );

      const base = this._zCall("object", [
        ts.factory.createObjectLiteralExpression(properties, true),
      ]);

      const extension = InputObjectNode.create(definition.name, undefined, undefined, selfRefs);

      const initializer = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier(`${definition.name}Base`),
          ts.factory.createIdentifier("extend")
        ),
        undefined,
        [
          ts.factory.createObjectLiteralExpression(
            this._createInputFieldProperties(extension, undefined, "Base"),
            true
          ),
        ]
      );

      this.nodes.push(
        this._createSchemaConstDeclaration(definition.name, base, "Base", false),
        this._createSchemaConstDeclaration(definition.name, initializer)
      );

      return;
    }

    const properties = this._createInputFieldProperties(definition);
    const initializer = this._zCall("object", [
      ts.factory.createObjectLiteralExpression(properties, true),
    ]);

    this.nodes.push(this._createSchemaConstDeclaration(definition.name, initializer));
  }

  private _generateUnion(definition: UnionNode) {
    if (!definition.types?.length) {
      throw new TransformerPluginExecutionError(
        this.name,
        `Union type ${definition.name} must have at least one member type.`
      );
    }

    const memberRefs = definition.types.map((type) =>
      ts.factory.createIdentifier(`${type.name}Schema`)
    );

    const initializer = this._zCall("union", [ts.factory.createArrayLiteralExpression(memberRefs)]);

    this.nodes.push(this._createSchemaConstDeclaration(definition.name, initializer));
  }

  public before() {
    const headers = createFileHeaders();
    this.nodes = [...headers];

    // import * as z from "zod/v4";
    this.nodes.push(
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          undefined,
          undefined,
          ts.factory.createNamespaceImport(ts.factory.createIdentifier("z"))
        ),
        ts.factory.createStringLiteral("zod/v4"),
        undefined
      ),
      ts.factory.createIdentifier("\n")
    );
  }

  public match(definition: DefinitionNode): boolean {
    return (
      !isOperationNode(definition) &&
      !isInternal(definition) &&
      !isScalarNode(definition) &&
      !isDirectiveDefinitionNode(definition)
    );
  }

  public generate(definition: DefinitionNode) {
    if (isEnumNode(definition)) {
      return this._generateEnum(definition);
    }

    if (isObjectNode(definition)) {
      return this._generateObject(definition);
    }

    if (isInterfaceNode(definition)) {
      return this._generateObject(definition);
    }

    if (isInputObjectNode(definition)) {
      return this._generateInputObject(definition);
    }

    if (isUnionNode(definition)) {
      return this._generateUnion(definition);
    }
  }

  public output() {
    const content = this._getContent();

    this.context.files.push({
      type: "ts",
      path: `zod/${this.options.fileName}`,
      filename: this.options.fileName,
      content,
    });

    return this.options.emitOutput ? { zodSchemas: content } : {};
  }
}

export const zodSchemaGeneratorPlugin = createPluginFactory(ZodSchemaGeneratorPlugin);
