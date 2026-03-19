import { beforeEach, describe, expect, it } from "vitest";
import {
  DirectiveDefinitionNode,
  DocumentNode,
  EnumNode,
  InputObjectNode,
  ObjectNode,
} from "@gqlbase/core/definition";
import { ModelPlugin } from "./ModelPlugin.js";
import { TransformerContext } from "@gqlbase/core";

const document = DocumentNode.fromSource(/* GraphQL */ `
  scalar Tag

  enum Status {
    ACTIVE
    INACTIVE
  }

  type Model @model {
    id: ID!
    name: String!
    decription: String
    count: Int
    isActive: Boolean
    rating: Float
    tags: [Tag]
    status: Status
  }
`);

const context = new TransformerContext({
  outputDirectory: "test-output",
});

const plugin = new ModelPlugin(context);
context.registerPlugin(plugin);

describe("ModelPlugin", () => {
  describe("on init plugin", () => {
    beforeEach(() => {
      context.finishWork();
      context.startWork(document);
    });

    it(`throws if directive already defined`, () => {
      expect(() => plugin.init()).toThrow();
    });

    it(`adds model directive directive definition`, () => {
      expect(context.document.getNode("model")).toBeInstanceOf(DirectiveDefinitionNode);
      expect(context.document.getNode("ModelOperation")).toBeInstanceOf(EnumNode);
      expect(context.document.getNode("IDFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("StringFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("IntFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("FloatFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("BooleanFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("SizeFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("SortDirection")).toBeInstanceOf(EnumNode);
    });
  });

  describe("on executing model node", () => {
    beforeEach(() => {
      context.finishWork();
      context.startWork(document);
      plugin.execute(context.document.getNode("Model") as ObjectNode);
    });

    it("creates query fields", () => {
      const query = context.document.getQueryNode();

      expect(query.hasField("getModel")).toBeTruthy();
      expect(query.getField("getModel")?.hasArgument("id")).toBeTruthy();
      expect(query.hasField("listModels")).toBeTruthy();
      expect(query.getField("listModels")?.hasArgument("filter")).toBeTruthy();
      expect(context.document.getNode("ModelFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(query.getField("listModels")?.hasDirective("hasMany")).toBeTruthy();
    });

    it("creates mutation fields", () => {
      const mutationNode = context.document.getMutationNode();
      expect(mutationNode.hasField("createModel")).toBeTruthy();
      expect(mutationNode.getField("createModel")?.hasArgument("input")).toBeTruthy();
      expect(mutationNode.getField("createModel")?.type.getTypeName()).toBe("Model");

      expect(mutationNode.hasField("updateModel")).toBeTruthy();
      expect(mutationNode.getField("updateModel")?.hasArgument("input")).toBeTruthy();
      expect(mutationNode.getField("updateModel")?.type.getTypeName()).toBe("Model");

      expect(mutationNode.hasField("deleteModel")).toBeTruthy();
      expect(mutationNode.getField("deleteModel")?.hasArgument("id")).toBeTruthy();
      expect(mutationNode.getField("deleteModel")?.type.getTypeName()).toBe("Model");
    });

    it("creates operation inputs", () => {
      expect(context.document.getNode("ModelFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("TagListFilterInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("StatusFilterInput")).toBeInstanceOf(InputObjectNode);

      expect(context.document.getNode("CreateModelInput")).toBeInstanceOf(InputObjectNode);
      expect(context.document.getNode("UpdateModelInput")).toBeInstanceOf(InputObjectNode);
    });
  });

  describe("on cleanup nodes", () => {
    beforeEach(() => {
      context.finishWork();
      context.startWork(document);
      plugin.execute(context.document.getNode("Model") as ObjectNode);
      plugin.cleanup(context.document.getNode("Model") as ObjectNode);
    });

    it("removes model node", () => {
      const model = context.document.getNode("Model") as ObjectNode;
      expect(model.hasDirective("model")).toBe(false);
    });
  });

  describe("on run `after` hook", () => {
    beforeEach(() => {
      context.startWork(document);
      plugin.after();
    });

    it("removes `model` directive definition", () => {
      expect(context.document.getNode("model")).toBeUndefined();
      expect(context.document.getNode("ModelOperation")).toBeUndefined();
    });
  });
});
