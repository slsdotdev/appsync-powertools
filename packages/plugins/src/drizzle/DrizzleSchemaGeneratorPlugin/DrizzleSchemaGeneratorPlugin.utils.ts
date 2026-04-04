import { snakeCase, pluralize, camelCase } from "@gqlbase/shared/format";

export interface DrizzleSchemaGeneratorPluginOptions {
  dialect?: "postgresql" | "mysql" | "sqlite";
  fileName?: string;
  emitOutput?: boolean;
  scalarMap?: Record<string, string>;
}

export const DEFAULT_OPTIONS: Required<Omit<DrizzleSchemaGeneratorPluginOptions, "scalarMap">> & {
  scalarMap: Record<string, string>;
} = {
  dialect: "postgresql",
  fileName: "schema.ts",
  emitOutput: false,
  scalarMap: {},
} as const;

export const mergeOptions = (options: DrizzleSchemaGeneratorPluginOptions = {}) => {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    scalarMap: { ...DEFAULT_OPTIONS.scalarMap, ...options.scalarMap },
  };
};

/**
 * Maps built-in GraphQL scalars and gqlbase base scalars to Drizzle pg-core column functions.
 * Custom scalars (e.g. Decimal) must be provided via `options.scalarMap`.
 */
export const PG_SCALAR_MAP: Record<string, string> = {
  ID: "uuid",
  String: "text",
  Int: "integer",
  Float: "doublePrecision",
  Boolean: "boolean",
  UUID: "uuid",
  DateTime: "timestamp",
  Date: "date",
  Time: "time",
  Timestamp: "timestamp",
  URL: "text",
  EmailAddress: "text",
  PhoneNumber: "text",
  IPAddress: "text",
  JSON: "jsonb",
};

/**
 * Fallback mapping from @gqlbase_typehint values to Drizzle pg-core column functions.
 */
export const TYPE_HINT_DRIZZLE_MAP: Record<string, string> = {
  id: "uuid",
  string: "text",
  number: "doublePrecision",
  boolean: "boolean",
  object: "jsonb",
  unknown: "text",
};

export function toTableName(typeName: string): string {
  return snakeCase(pluralize(typeName));
}

export function toTableVarName(typeName: string): string {
  return camelCase(pluralize(typeName));
}

export function toColumnValue(typeName: string, options: DrizzleSchemaGeneratorPluginOptions) {
  if (options.scalarMap && options.scalarMap[typeName]) {
    return options.scalarMap[typeName];
  }

  if (PG_SCALAR_MAP[typeName]) {
    return PG_SCALAR_MAP[typeName];
  }

  if (TYPE_HINT_DRIZZLE_MAP[typeName]) {
    return TYPE_HINT_DRIZZLE_MAP[typeName];
  }

  throw new Error(
    `Unsupported type "${typeName}". Please provide a mapping for this type in the plugin options.`
  );
}
