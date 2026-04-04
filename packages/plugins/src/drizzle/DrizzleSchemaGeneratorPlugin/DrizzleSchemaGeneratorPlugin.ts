import ts from "typescript";
import { createPluginFactory, ITransformerContext, TransformerPluginBase } from "@gqlbase/core";
import { isBuildInScalar } from "@gqlbase/shared/definition";
import { createFileHeaders, jsonToObjectAst } from "@gqlbase/shared/codegen";
import { getTypeHint, isInternal } from "@gqlbase/core/plugins";
import {
  DefinitionNode,
  EnumNode,
  FieldNode,
  isDirectiveDefinitionNode,
  isEnumNode,
  isListTypeNode,
  isObjectLike,
  isObjectNode,
  isOperationNode,
  isScalarNode,
  ObjectNode,
} from "@gqlbase/core/definition";
import { TransformerPluginExecutionError } from "@gqlbase/shared/errors";
import { isClientOnly } from "../../base/UtilitiesPlugin/index.js";
import { isSemanticNullable } from "../../base/RfcFeaturesPlugin/index.js";
import { isRelationField } from "../../base/RelationsPlugin/index.js";
import { isModel } from "../../base/ModelPlugin/ModelPlugin.utils.js";
import {
  type DrizzleSchemaGeneratorPluginOptions,
  mergeOptions,
  toTableName,
  toTableVarName,
  resolveScalarType,
  resolveTypeHintType,
} from "./DrizzleSchemaGeneratorPlugin.utils.js";
import { camelCase, snakeCase } from "@gqlbase/shared/format";

export class DrizzleSchemaGeneratorPlugin extends TransformerPluginBase {
  private nodes: ts.Node[] = [];
  private options: ReturnType<typeof mergeOptions>;
  private drizzleImports = new Set<string>();
  private typeImports = new Set<string>();

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

  private _callExp(name: string, args: ts.Expression[] = []): ts.Expression {
    return ts.factory.createCallExpression(ts.factory.createIdentifier(name), undefined, args);
  }

  private _chainCallExp(
    expr: ts.Expression,
    method: string,
    args: ts.Expression[] = [],
    typeArgs: ts.TypeNode[] | undefined = undefined
  ): ts.Expression {
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(expr, ts.factory.createIdentifier(method)),
      typeArgs,
      args
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

  private _resolveScalarColumn(typeName: string, columnDbName: string): ts.Expression {
    let columnType = resolveScalarType(typeName, this.options);

    if (!columnType) {
      const typeDef = this.context.document.getNodeOrThrow(typeName);

      if (isScalarNode(typeDef)) {
        const hint = getTypeHint(typeDef);
        columnType = resolveTypeHintType(hint);
      }

      if (!columnType) {
        throw new TransformerPluginExecutionError(
          this.name,
          `Unsupported scalar type "${typeName}". Please provide a mapping via options.scalarMap or ensure the scalar has a valid @gqlbase_typehint.`
        );
      }
    }

    const callArgs: ts.Expression[] = [ts.factory.createStringLiteral(columnDbName)];

    if (columnType.config) {
      callArgs.push(jsonToObjectAst(columnType.config));
    }

    this.drizzleImports.add(columnType.type);
    return this._callExp(columnType.type, callArgs);
  }

  private _isPrimaryKey(field: FieldNode): boolean {
    return field.name === "id";
  }

  private _applyColumnContraints(column: ts.Expression, field: FieldNode): ts.Expression {
    let expr = column;

    if (this._isPrimaryKey(field)) {
      expr = this._chainCallExp(expr, "primaryKey");
      expr = this._chainCallExp(expr, "defaultRandom");
      return expr; // id is always non-null via primaryKey, skip further processing
    }

    if (isListTypeNode(field.type)) {
      expr = this._chainCallExp(expr, "array");
    }

    if (!isSemanticNullable(field)) {
      expr = this._chainCallExp(expr, "notNull");
    }

    // TODO: aditional contraints based on `parseConstraints(field)` from UtilitiesPlugin and passed as options, eg. dates as text.
    // some `base` scalars will also have predefined constrains, like EmailAddress, IPAddress, URL, etc. which we can apply here as well.
    // For defaults, we should consider register directives so we can reliably identify them here, instead of relying on heuristics like field name + type.

    return expr;
  }

  private _createColumnExpression(field: FieldNode): ts.Expression {
    const fieldTypeName = field.type.getTypeName();
    const columnDbName = snakeCase(field.name);

    if (isBuildInScalar(fieldTypeName)) {
      const column = this._resolveScalarColumn(fieldTypeName, columnDbName);
      return this._applyColumnContraints(column, field);
    }

    const typeDef = this.context.document.getNodeOrThrow(fieldTypeName);

    if (isScalarNode(typeDef)) {
      const column = this._resolveScalarColumn(fieldTypeName, columnDbName);
      return this._applyColumnContraints(column, field);
    }

    if (isEnumNode(typeDef)) {
      const enumVarName = camelCase(fieldTypeName, "enum");
      const column = this._callExp(enumVarName, [ts.factory.createStringLiteral(columnDbName)]);

      return this._applyColumnContraints(column, field);
    }

    if (isObjectLike(typeDef) && !isModel(typeDef) && !isOperationNode(typeDef)) {
      this.drizzleImports.add("json");
      this.typeImports.add(fieldTypeName);

      const columnType = this._callExp("json", [ts.factory.createStringLiteral(columnDbName)]);
      const typeRef = ts.factory.createTypeReferenceNode(fieldTypeName);

      return this._applyColumnContraints(
        this._chainCallExp(columnType, "$type", [], [typeRef]),
        field
      );
    }

    throw new TransformerPluginExecutionError(
      this.name,
      `Unsupported field type "${field.type.getTypeName()}" for field "${field.name}".`
    );
  }

  private _generateEnum(definition: EnumNode) {
    if (!definition.values?.length) {
      throw new TransformerPluginExecutionError(
        this.name,
        `Enum type ${definition.name} must have at least one value.`
      );
    }

    this.drizzleImports.add("pgEnum");

    const enumDbName = snakeCase(definition.name);
    const enumVarName = camelCase(definition.name, "enum");
    const values = definition.values.map((v) => ts.factory.createStringLiteral(v.name));

    const initializer = this._callExp("pgEnum", [
      ts.factory.createStringLiteral(enumDbName),
      ts.factory.createArrayLiteralExpression(values),
    ]);

    this.nodes.push(this._createExportedConst(enumVarName, initializer));
  }

  private _generateTableRelations(definition: ObjectNode, tableVarName: string) {
    const relations: ts.Expression[] = [];

    for (const field of definition.fields ?? []) {
      if (isRelationField(field)) {
        const relatedTableName = toTableVarName(field.type.getTypeName());
        relations.push(ts.factory.createIdentifier(relatedTableName));
      }
    }

    if (relations.length > 0) {
      const initializer = this._callExp("relations", [ts.factory.createIdentifier(tableVarName)]);
      this.nodes.push(this._createExportedConst(camelCase(tableVarName, "relations"), initializer));
    }
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

    const initializer = this._callExp("pgTable", [
      ts.factory.createStringLiteral(tableName),
      ts.factory.createObjectLiteralExpression(columnProperties, true),
    ]);

    this.nodes.push(this._createExportedConst(tableVarName, initializer));
    this._generateTableRelations(definition, tableVarName);
  }

  public before() {
    this.nodes = [];
    this.drizzleImports.clear();
    this.typeImports.clear();
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
    const importNodes: ts.Node[] = [this._createNamedImport(["relations"], "drizzle-orm")];

    if (this.drizzleImports.size > 0) {
      importNodes.push(
        this._createNamedImport([...this.drizzleImports].sort(), "drizzle-orm/pg-core")
      );
    }

    if (this.typeImports.size > 0) {
      importNodes.push(
        this._createTypeOnlyNamedImport([...this.typeImports].sort(), "../models.typegen.js")
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

export const drizzleSchemaGeneratorPlugin = createPluginFactory(DrizzleSchemaGeneratorPlugin);
