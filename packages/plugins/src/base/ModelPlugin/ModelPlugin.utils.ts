import { DefinitionNode, FieldNode, ObjectNode } from "@gqlbase/core/definition";
import {
  isClientOnly,
  isCreateOnly,
  isFilterOnly,
  isReadOnly,
  isServerOnly,
  isUpdateOnly,
} from "../UtilitiesPlugin/index.js";
import { isRelationField } from "../RelationsPlugin/index.js";

export interface ModelPluginOptions {
  operations: OperationType[];
}

export const ModelDirective = {
  MODEL: "model",
} as const;

export const ModelOperation = {
  /** Shorthand for read operations (`get`, `list`) */
  READ: "read",

  /** Shorthand for write operations (`create`, `update`, `delete`) */
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

export type OperationType = (typeof ModelOperation)[keyof typeof ModelOperation];

export const DEFAULT_READ_OPERATIONS = ["get", "list"] as const satisfies OperationType[];
export const DEFAULT_WRITE_OPERATIONS = [
  "create",
  "update",
  "delete",
] as const satisfies OperationType[];

export const isModel = (definition: DefinitionNode): definition is ObjectNode => {
  return definition instanceof ObjectNode && definition.hasDirective(ModelDirective.MODEL);
};

export const shouldSkipFieldFromInput = (field: FieldNode): boolean => {
  return isReadOnly(field) || isServerOnly(field) || isClientOnly(field) || isRelationField(field);
};

export const shouldSkipFieldFromFilterInput = (field: FieldNode): boolean => {
  return (
    shouldSkipFieldFromInput(field) ||
    ((isCreateOnly(field) || isUpdateOnly(field)) && !isFilterOnly(field))
  );
};

export const shouldSkipFieldFromCreateInput = (field: FieldNode): boolean => {
  return (
    shouldSkipFieldFromInput(field) ||
    ((isFilterOnly(field) || isUpdateOnly(field)) && !isCreateOnly(field))
  );
};

export const shouldSkipFieldFromUpdateInput = (field: FieldNode): boolean => {
  return (
    shouldSkipFieldFromInput(field) ||
    ((isFilterOnly(field) || isCreateOnly(field)) && !isUpdateOnly(field))
  );
};
