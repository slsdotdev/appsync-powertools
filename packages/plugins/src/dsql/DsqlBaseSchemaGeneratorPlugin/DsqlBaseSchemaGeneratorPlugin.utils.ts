import { BuildInScalar, isBuildInScalar } from "@gqlbase/shared/definition";
import { BaseScalarName, isBaseScalar } from "../../base/index.js";
import { TypeHintValueType } from "@gqlbase/core/plugins";

export interface ScalarConfig {
  type: string;
  options?: Record<string, unknown>;
}

export interface DsqlBaseSchemaGeneratorPluginOptions {
  emitOutput?: boolean;
  scalarMap?: Record<string, string | ScalarConfig>;
}

export const DEFAULT_OPTIONS: Required<DsqlBaseSchemaGeneratorPluginOptions> = {
  emitOutput: false,
  scalarMap: {},
};

export const mergeOptions = (options: DsqlBaseSchemaGeneratorPluginOptions = {}) => {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    scalarMap: { ...DEFAULT_OPTIONS.scalarMap, ...options.scalarMap },
  };
};

export const SCALAR_TYPE_MAP: Record<BuildInScalar | BaseScalarName, ScalarConfig> = {
  ID: { type: "uuid" },
  String: { type: "text" },
  Int: { type: "int" },
  Float: { type: "real" },
  Boolean: { type: "bool" },
  UUID: { type: "uuid" },
  DateTime: { type: "timestamp", options: { mode: "iso" } },
  Date: { type: "date", options: { mode: "iso" } },
  Time: { type: "time", options: { mode: "iso" } },
  Timestamp: { type: "timestamp" },
  URL: { type: "text" },
  EmailAddress: { type: "text" },
  PhoneNumber: { type: "text" },
  IPAddress: { type: "text" },
  JSON: { type: "json" },
};

export const TYPE_HINT_TYPE_MAP: Record<TypeHintValueType, ScalarConfig> = {
  id: { type: "uuid" },
  string: { type: "text" },
  number: { type: "real" },
  boolean: { type: "bool" },
  object: { type: "json" },
  unknown: { type: "text" },
};

export const resolveScalarDataType = (
  typeName: string,
  config?: Record<string, string | ScalarConfig>
): ScalarConfig | null => {
  if (config?.[typeName]) {
    const mapping = config[typeName];

    if (typeof mapping === "string") {
      return { type: mapping };
    }

    return mapping;
  }

  if (isBuildInScalar(typeName) || isBaseScalar(typeName)) {
    return SCALAR_TYPE_MAP[typeName];
  }

  return null;
};

export function resolveTypeHintDataType(hintValue: TypeHintValueType): ScalarConfig {
  return TYPE_HINT_TYPE_MAP[hintValue];
}
