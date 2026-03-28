import { DefinitionNode } from "@gqlbase/core/definition";

const OPERATION_NODE_NAME = ["Query", "Mutation", "Subscription"] as const;

export const isOperationNode = (node: DefinitionNode) => {
  return OPERATION_NODE_NAME.includes(node.name as (typeof OPERATION_NODE_NAME)[number]);
};
