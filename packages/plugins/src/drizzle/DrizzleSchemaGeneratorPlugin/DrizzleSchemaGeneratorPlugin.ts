import ts from "typescript";
import { createPluginFactory, ITransformerContext, TransformerPluginBase } from "@gqlbase/core";
import { isBuildInScalar } from "@gqlbase/shared/definition";
import { createFileHeaders } from "@gqlbase/shared/codegen";
import { getTypeHint, isInternal } from "@gqlbase/core/plugins";
import {
  DefinitionNode,
  EnumNode,
  FieldNode,
  isDirectiveDefinitionNode,
  isEnumNode,
  isListTypeNode,
  isObjectNode,
  isOperationNode,
  isScalarNode,
  ObjectNode,
} from "@gqlbase/core/definition";
import { TransformerPluginExecutionError } from "@gqlbase/shared/errors";
import { isBaseScalar } from "../../base/ScalarsPlugin/ScalarsPlugin.utils.js";
import { isClientOnly } from "../../base/UtilitiesPlugin/index.js";
import { isSemanticNullable } from "../../base/RfcFeaturesPlugin/index.js";
import { isRelationField } from "../../base/RelationsPlugin/index.js";
import { isModel } from "../../base/ModelPlugin/ModelPlugin.utils.js";
import {
  type DrizzleSchemaGeneratorPluginOptions,
  mergeOptions,
  PG_SCALAR_MAP,
  TYPE_HINT_DRIZZLE_MAP,
  toTableName,
  toTableVarName,
  toColumnName,
  toEnumVarName,
  toEnumDbName,
} from "./DrizzleSchemaGeneratorPlugin.utils.js";

export class DrizzleSchemaGeneratorPlugin extends TransformerPluginBase {
  private nodes: ts.Node[] = [];
  private options: ReturnType<typeof mergeOptions>;
  private enumNames = new Set<string>();
  private drizzleImports = new Set<string>();
  private jsonbTypeImports = new Set<string>();

  constructor(context: ITransformerContext, options: DrizzleSchemaGeneratorPluginOptions = {}) {
    super("DrizzleSchemaGeneratorPlugin", context);
    this.options = mergeOptions(options);
  }

  private _getContent(nodes: ts.Node[]) {
    const file = ts.createSourceFile(
      this.options.fileName,
      "",
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    );

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.CarriageReturnLineFeed,
      removeComments: false,
    });

    return printer.printList(ts.ListFormat.MultiLine, ts.factory.createNodeArray(nodes), file);
  }

  private _call(name: string, args: ts.Expression[] = []): ts.Expression {
    return ts.factory.createCallExpression(ts.factory.createIdentifier(name), undefined, args);
  }

  private _callWithStringArg(name: string, arg: string): ts.Expression {
    return ts.factory.createCallExpression(ts.factory.createIdentifier(name), undefined, [
      ts.factory.createStringLiteral(arg),
    ]);
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

  private _chainCallWithTypeArg(
    expr: ts.Expression,
    method: string,
    typeArg: string
  ): ts.Expression {
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(expr, ts.factory.createIdentifier(method)),
      [ts.factory.createTypeReferenceNode(typeArg)],
      []
    );
  }

  private _createExportedConst(name: string, initializer: ts.Expression): ts.VariableStatement {
    return ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(name, undefined, undefined, initializer)],
        ts.NodeFlags.Const
      )
    );
  }

  private _createNamedImport(names: string[], from: string): ts.ImportDeclaration {
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        undefined,
        undefined,
        ts.factory.createNamedImports(
          names.map((n) =>
            ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(n))
          )
        )
      ),
      ts.factory.createStringLiteral(from),
      undefined
    );
  }

  private _createTypeOnlyNamedImport(names: string[], from: string): ts.ImportDeclaration {
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        undefined,
        undefined,
        ts.factory.createNamedImports(
          names.map((n) =>
            ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(n))
          )
        )
      ),
      ts.factory.createStringLiteral(from),
      undefined
    );
  }

  private _shouldSkipField(field: FieldNode): boolean {
    return isInternal(field) || isClientOnly(field) || isRelationField(field);
  }

  private _isNestedValueType(typeName: string): boolean {
    const node = this.context.document.getNode(typeName);
    return !!node && isObjectNode(node) && !isModel(node) && !isOperationNode(node);
  }

  private _resolveScalarColumnFn(typeName: string): string {
    // 1. User-provided scalarMap
    if (this.options.scalarMap[typeName]) {
      return this.options.scalarMap[typeName];
    }

    // 2. Built-in GraphQL scalars
    if (isBuildInScalar(typeName)) {
      return PG_SCALAR_MAP[typeName];
    }

    // 3. gqlbase base scalars
    if (isBaseScalar(typeName)) {
      return PG_SCALAR_MAP[typeName];
    }

    // 4. Custom scalar — fall back to @gqlbase_typehint
    const typeDef = this.context.document.getNode(typeName);
    if (typeDef && isScalarNode(typeDef)) {
      const hint = getTypeHint(typeDef);
      return TYPE_HINT_DRIZZLE_MAP[hint] ?? "text";
    }

    return "text";
  }

  private _createColumnExpression(field: FieldNode): ts.Expression {
    const fieldTypeName = field.type.getTypeName();
    const columnDbName = toColumnName(field.name);
    const isList = isListTypeNode(field.type);

    let expr: ts.Expression;

    if (this._isNestedValueType(fieldTypeName)) {
      // jsonb("column_name").$type<TypeName>()
      this.drizzleImports.add("jsonb");
      this.jsonbTypeImports.add(fieldTypeName);
      expr = this._callWithStringArg("jsonb", columnDbName);
      expr = this._chainCallWithTypeArg(expr, "$type", fieldTypeName);
    } else if (this.enumNames.has(fieldTypeName)) {
      // enumVarName("column_name")
      const enumVarName = toEnumVarName(fieldTypeName);
      expr = this._callWithStringArg(enumVarName, columnDbName);
    } else {
      // scalar("column_name")
      const drizzleFn = this._resolveScalarColumnFn(fieldTypeName);
      this.drizzleImports.add(drizzleFn);
      expr = this._callWithStringArg(drizzleFn, columnDbName);
    }

    // Apply special defaults before array/notNull
    if (field.name === "id" && (fieldTypeName === "UUID" || fieldTypeName === "ID")) {
      expr = this._chainCall(expr, "primaryKey");
      expr = this._chainCall(expr, "defaultRandom");
      return expr; // id is always non-null via primaryKey, skip further processing
    }

    const isTimestampDefault =
      (field.name === "createdAt" || field.name === "updatedAt") && fieldTypeName === "DateTime";

    if (isTimestampDefault) {
      expr = this._chainCall(expr, "defaultNow");
    }

    if (isList) {
      expr = this._chainCall(expr, "array");
    }

    if (!isSemanticNullable(field)) {
      expr = this._chainCall(expr, "notNull");
    }

    return expr;
  }

  private _generateEnum(definition: EnumNode) {
    if (!definition.values?.length) {
      throw new TransformerPluginExecutionError(
        this.name,
        `Enum type ${definition.name} must have at least one value.`
      );
    }

    this.drizzleImports.add("pgEnum");
    this.enumNames.add(definition.name);

    const enumDbName = toEnumDbName(definition.name);
    const enumVarName = toEnumVarName(definition.name);
    const values = definition.values.map((v) => ts.factory.createStringLiteral(v.name));

    const initializer = this._call("pgEnum", [
      ts.factory.createStringLiteral(enumDbName),
      ts.factory.createArrayLiteralExpression(values),
    ]);

    this.nodes.push(this._createExportedConst(enumVarName, initializer));
  }

  private _generateTable(definition: ObjectNode) {
    this.drizzleImports.add("pgTable");

    const tableName = toTableName(definition.name);
    const tableVarName = toTableVarName(definition.name);

    const columnProperties: ts.ObjectLiteralElementLike[] = [];

    for (const field of definition.fields ?? []) {
      if (this._shouldSkipField(field)) {
        continue;
      }

      const columnExpr = this._createColumnExpression(field);
      columnProperties.push(
        ts.factory.createPropertyAssignment(ts.factory.createIdentifier(field.name), columnExpr)
      );
    }

    const initializer = this._call("pgTable", [
      ts.factory.createStringLiteral(tableName),
      ts.factory.createObjectLiteralExpression(columnProperties, true),
    ]);

    this.nodes.push(this._createExportedConst(tableVarName, initializer));
  }

  public before() {
    this.nodes = [];
    this.enumNames.clear();
    this.drizzleImports.clear();
    this.jsonbTypeImports.clear();
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

    if (isObjectNode(definition) && isModel(definition)) {
      return this._generateTable(definition);
    }
  }

  public output() {
    const headers = createFileHeaders();
    const importNodes: ts.Node[] = [];

    if (this.drizzleImports.size > 0) {
      importNodes.push(
        this._createNamedImport([...this.drizzleImports].sort(), "drizzle-orm/pg-core")
      );
    }

    if (this.jsonbTypeImports.size > 0) {
      importNodes.push(
        this._createTypeOnlyNamedImport([...this.jsonbTypeImports].sort(), "./types.typegen.js")
      );
    }

    const allNodes = [...headers, ...importNodes, ts.factory.createIdentifier("\n"), ...this.nodes];

    const content = this._getContent(allNodes);

    this.context.files.push({
      type: "ts",
      path: `drizzle/${this.options.fileName}`,
      filename: this.options.fileName,
      content,
    });

    return this.options.emitOutput ? { drizzleSchema: content } : {};
  }
}

export const drizzleSchemaGeneratorPlugin =
  createPluginFactory<DrizzleSchemaGeneratorPluginOptions>(DrizzleSchemaGeneratorPlugin);
