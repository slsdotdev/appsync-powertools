import { FieldNode, NonNullTypeNode } from "@gqlbase/core/definition";

export const RfcDirective = {
  SEMANTIC_NON_NULL: "semanticNonNull",
} as const;

export const isSemanticNullable = (field: FieldNode, level = 0) => {
  if (field.type instanceof NonNullTypeNode) {
    return false;
  }

  if (field.hasDirective(RfcDirective.SEMANTIC_NON_NULL)) {
    const args = field
      .getDirective(RfcDirective.SEMANTIC_NON_NULL)
      ?.getArgumentsJSON<{ levels: number[] }>();

    return !args?.levels?.includes(level);
  }

  return true;
};
