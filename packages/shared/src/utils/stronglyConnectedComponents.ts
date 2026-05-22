/**
 * Tarjan's strongly-connected-components algorithm.
 *
 * Returns SCCs in **reverse topological order** — sinks first — which is the
 * natural order for emitting declarations where each must precede its
 * dependents (`const` codegen, build pipelines, etc.). A node with no
 * outgoing edges is its own single-node SCC.
 *
 * Edges pointing to identifiers not in `nodes` are silently ignored, so
 * callers can compute deps liberally without pre-filtering.
 *
 * @example
 * ```ts
 * const sccs = stronglyConnectedComponents(
 *   ["A", "B", "C"],
 *   (n) => ({ A: ["B"], B: ["C"], C: [] })[n] ?? []
 * );
 * // → [["C"], ["B"], ["A"]]  (C emitted first, A last)
 * ```
 */
export function stronglyConnectedComponents<T>(
  nodes: Iterable<T>,
  getEdges: (node: T) => Iterable<T>
): T[][] {
  const allNodes = new Set(nodes);
  const index = new Map<T, number>();
  const lowlink = new Map<T, number>();
  const onStack = new Set<T>();
  const stack: T[] = [];
  const sccs: T[][] = [];
  let counter = 0;

  const strongconnect = (v: T): void => {
    index.set(v, counter);
    lowlink.set(v, counter);
    counter++;
    stack.push(v);
    onStack.add(v);

    for (const w of getEdges(v)) {
      if (!allNodes.has(w)) continue;
      if (!index.has(w)) {
        strongconnect(w);
        const vLow = lowlink.get(v) ?? 0;
        const wLow = lowlink.get(w) ?? 0;
        lowlink.set(v, Math.min(vLow, wLow));
      } else if (onStack.has(w)) {
        const vLow = lowlink.get(v) ?? 0;
        const wIndex = index.get(w) ?? 0;
        lowlink.set(v, Math.min(vLow, wIndex));
      }
    }

    if (lowlink.get(v) === index.get(v)) {
      const scc: T[] = [];
      for (;;) {
        const w = stack.pop();
        if (w === undefined) break;
        onStack.delete(w);
        scc.push(w);
        if (w === v) break;
      }
      sccs.push(scc);
    }
  };

  for (const node of allNodes) {
    if (!index.has(node)) {
      strongconnect(node);
    }
  }

  return sccs;
}
