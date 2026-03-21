import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TransformerContext } from "@gqlbase/core";
import {
  DirectiveDefinitionNode,
  DocumentNode,
  EnumNode,
  ObjectNode,
} from "@gqlbase/core/definition";
import { ConnectionPlugin } from "./ConnectionPlugin.js";

const document = DocumentNode.fromSource(/* GraphQL */ `
  type User {
    id: ID!
    username: String!
  }

  type Todo {
    id: ID
    content: String
    resources: Resource @hasMany
  }

  type Document {
    url: String!
  }

  type Message {
    content: String!
  }

  union Resource = Document | Message

  type Query {
    me: User @hasOne
    todos: Todo @hasMany
  }
`);

describe.skip("ConnectionPlugin", () => {
  let context = new TransformerContext();
  let plugin = new ConnectionPlugin(context);

  beforeAll(() => {
    context = new TransformerContext();
    plugin = new ConnectionPlugin(context);
    context.registerPlugin(plugin);
  });

  beforeEach(() => {
    context.finishWork();
    context.startWork(document);
  });

  it("adds connection directive definitions", () => {
    expect(context.document.getNode("ConnectionRelationType")).toBeInstanceOf(EnumNode);
    expect(context.document.getNode("hasOne")).toBeInstanceOf(DirectiveDefinitionNode);
    expect(context.document.getNode("hasMany")).toBeInstanceOf(DirectiveDefinitionNode);
  });

  describe("on execute object node", () => {
    beforeEach(() => {
      plugin.execute(context.document.getNode("Query") as ObjectNode);
      plugin.execute(context.document.getNode("Todo") as ObjectNode);
    });

    it("creates connection types", () => {
      expect(context.document.getNode("TodoConnection")).toBeInstanceOf(ObjectNode);
      expect(context.document.getNode("TodoEdge")).toBeInstanceOf(ObjectNode);
      expect(context.document.getNode("ResourceConnection")).toBeInstanceOf(ObjectNode);
      expect(context.document.getNode("ResourceEdge")).toBeInstanceOf(ObjectNode);
    });

    it("updates field types", () => {
      const todosField = (context.document.getNode("Query") as ObjectNode).getField("todos");
      const resourcesField = (context.document.getNode("Todo") as ObjectNode).getField("resources");

      expect(todosField?.type.getTypeName()).toBe("TodoConnection");
      expect(todosField?.hasArgument("first")).toBe(true);
      expect(todosField?.hasArgument("after")).toBe(true);

      expect(resourcesField?.type.getTypeName()).toBe("ResourceConnection");
      expect(resourcesField?.hasArgument("first")).toBe(true);
      expect(resourcesField?.hasArgument("after")).toBe(true);
    });
  });

  describe("creates corrent connection types for one-to-many relationships", () => {
    const schema = /* GraphQL */ `
      interface Document {
        id: ID
        type: String
      }

      type Todo implements Document {
        id: ID
        type: String
        content: String
      }

      type Message implements Document {
        id: ID
        type: String
        title: String
      }

      type Query {
        documents: Document @hasMany
      }
    `;

    beforeEach(() => {
      context.finishWork();
      context.startWork(DocumentNode.fromSource(schema));
      plugin.execute(context.document.getQueryNode());
    });

    it("creates connection types with correct edge type", () => {
      const connectionType = context.document.getNode("DocumentConnection") as ObjectNode;
      const edgeType = context.document.getNode("DocumentEdge") as ObjectNode;

      expect(connectionType).toBeInstanceOf(ObjectNode);
      expect(edgeType).toBeInstanceOf(ObjectNode);
      expect(connectionType.getField("edges")?.type.getTypeName()).toBe("DocumentEdge");
      expect(edgeType.getField("node")?.type.getTypeName()).toBe("Document");
    });

    it("adds field attributes to connection field", () => {
      const documentsField = context.document.getQueryNode().getField("documents");

      expect(documentsField?.hasArgument("first")).toBe(true);
      expect(documentsField?.hasArgument("after")).toBe(true);
    });
  });
});
