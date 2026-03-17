import { TransformerContext } from "@gqlbase/core";
import { DocumentNode, InterfaceNode, ObjectNode } from "@gqlbase/core/definition";
import { beforeEach, describe, expect, it } from "vitest";
import { NodeInterfacePlugin } from "./NodeInterfacePlugin.js";

const document = DocumentNode.fromSource(/* GraphQL */ `
  type User implements Node {
    id: ID!
  }
`);

const context = new TransformerContext({
  outputDirectory: "__test__",
});

const plugin = new NodeInterfacePlugin(context);
context.registerPlugin(plugin);

describe("NodeInterfacePlugin", () => {
  beforeEach(() => {
    context.finishWork();
    context.startWork(document);
  });

  describe("the `before` hook", () => {
    it("it throws when user declares invalid `Node` type", () => {
      context.finishWork();
      context.startWork(
        DocumentNode.fromSource(/* GraphQL */ `
          type Node {
            id: ID!
          }
        `)
      );

      expect(() => plugin.before()).toThrow();
    });

    it("added interface definition", () => {
      plugin.before();
      const iface = context.document.getNode("Node") as InterfaceNode;

      expect(iface).toBeInstanceOf(InterfaceNode);
      expect(iface.hasField("id")).toBeTruthy();
    });

    it("added `Query.node` field", () => {
      plugin.before();

      const queryNode = context.document.getQueryNode();
      expect(queryNode).toBeInstanceOf(ObjectNode);
      expect(queryNode.hasField("node")).toBeTruthy();
    });
  });
});
