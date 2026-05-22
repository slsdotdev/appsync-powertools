import { describe, expect, it } from "vitest";
import { stronglyConnectedComponents } from "./stronglyConnectedComponents.js";

const graph = (edges: Record<string, string[]>) => (node: string) => edges[node] ?? [];

describe("stronglyConnectedComponents", () => {
  it("returns nodes in reverse topological order for a DAG", () => {
    const sccs = stronglyConnectedComponents(
      ["A", "B", "C"],
      graph({ A: ["B"], B: ["C"], C: [] })
    );

    expect(sccs).toEqual([["C"], ["B"], ["A"]]);
  });

  it("groups mutually-reachable nodes into a single SCC", () => {
    // A → B → C → A is a 3-cycle.
    const sccs = stronglyConnectedComponents(
      ["A", "B", "C"],
      graph({ A: ["B"], B: ["C"], C: ["A"] })
    );

    expect(sccs).toHaveLength(1);
    expect(new Set(sccs[0])).toEqual(new Set(["A", "B", "C"]));
  });

  it("preserves topo order between SCCs", () => {
    // {B,C} form a cycle; A depends on B; D is disconnected.
    const sccs = stronglyConnectedComponents(
      ["A", "B", "C", "D"],
      graph({ A: ["B"], B: ["C"], C: ["B"], D: [] })
    );

    const order = sccs.map((s) => [...s].sort().join(""));
    // The cycle SCC must appear before the singleton that depends into it.
    expect(order.indexOf("BC")).toBeLessThan(order.indexOf("A"));
    // D is its own single-node SCC, independent of the rest.
    expect(order).toContain("D");
  });

  it("reports a self-loop as a single-node SCC (caller checks the back-edge)", () => {
    const sccs = stronglyConnectedComponents(["A"], graph({ A: ["A"] }));

    expect(sccs).toEqual([["A"]]);
  });

  it("ignores edges to nodes outside the given set", () => {
    // B is not in `nodes`, so the edge A → B is silently dropped.
    const sccs = stronglyConnectedComponents(["A"], graph({ A: ["B"] }));

    expect(sccs).toEqual([["A"]]);
  });

  it("handles disconnected components", () => {
    const sccs = stronglyConnectedComponents(
      ["A", "B", "C", "D"],
      graph({ A: ["B"], C: ["D"] })
    );

    const components = sccs.map((s) => [...s].sort().join(""));
    expect(components.sort()).toEqual(["A", "B", "C", "D"]);
  });

  it("returns an empty array for no nodes", () => {
    expect(stronglyConnectedComponents([], () => [])).toEqual([]);
  });
});
