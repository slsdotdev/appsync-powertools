import { ArgumentNode } from "./ArgumentNode.js";

export const isArgument = (node: unknown): node is ArgumentNode => {
  return node instanceof ArgumentNode;
};
