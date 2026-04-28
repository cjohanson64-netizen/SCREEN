import { describe, expect, it } from "vitest";

import {
  evaluateDerivePath,
  evaluateDeriveSum,
  evaluateGraphControlExpr,
  evaluateGraphQuery,
  evaluateLoopCount,
} from "../runtime/evaluateGraphControl";

import type { Graph, GraphNode } from "../runtime/graph";

function stringLiteral(value: string) {
  return {
    type: "StringLiteral",
    value,
    raw: `"${value}"`,
  } as any;
}

function numberLiteral(value: number) {
  return {
    type: "NumberLiteral",
    value,
    raw: String(value),
  } as any;
}

function identifier(name: string) {
  return {
    type: "Identifier",
    name,
  } as any;
}

function createGraphControlTestGraph(): Graph {
  const rootNode: GraphNode = {
    id: "root",
    semanticId: "node:root",
    value: {
      name: "Root",
      type: "task",
    },
    state: {
      status: "active",
      points: 10,
    },
    meta: {
      label: "Root Task",
      priority: "high",
    },
  };

  const childNode: GraphNode = {
    id: "child",
    semanticId: "node:child",
    value: {
      name: "Child",
      type: "task",
    },
    state: {
      status: "ready",
      points: 5,
    },
    meta: {
      label: "Child Task",
      priority: "medium",
    },
  };

  const grandchildNode: GraphNode = {
    id: "grandchild",
    semanticId: "node:grandchild",
    value: {
      name: "Grandchild",
      type: "task",
    },
    state: {
      status: "ready",
      points: 2,
    },
    meta: {
      label: "Grandchild Task",
      priority: "low",
    },
  };

  return {
    root: "root",
    nodes: new Map<string, GraphNode>([
      ["root", rootNode],
      ["child", childNode],
      ["grandchild", grandchildNode],
    ]),
    edges: [
      {
        id: "edge-root-child",
        subject: "root",
        relation: "contains",
        object: "child",
        kind: "branch",
        meta: {},
        context: null,
      },
      {
        id: "edge-child-grandchild",
        subject: "child",
        relation: "contains",
        object: "grandchild",
        kind: "branch",
        meta: {},
        context: null,
      },
    ],
    state: {},
    meta: {},
    history: [],
  };
}

function containsPathExpr() {
  return {
    type: "DerivePathExpr",
    node: identifier("root"),
    relation: stringLiteral("contains"),
    direction: stringLiteral("outgoing"),
    depth: numberLiteral(2),
    where: null,
  } as any;
}

describe("evaluateGraphControl refactor behavior", () => {
  it("evaluates edge-existence @query using scoped from/to references", () => {
    const graph = createGraphControlTestGraph();

    const query = {
      type: "GraphQueryExpr",
      subject: identifier("from"),
      relation: stringLiteral("contains"),
      object: identifier("to"),
      node: null,
      state: null,
      meta: null,
      equals: null,
    } as any;

    const result = evaluateGraphQuery(graph, query, {
      scope: {
        from: "root",
        to: "child",
      },
      bindings: {
        values: new Map(),
        nodes: new Map(),
      },
      actions: new Map(),
    });

    expect(result).toBe(true);
  });

  it("evaluates state @query with equals", () => {
    const graph = createGraphControlTestGraph();

    const query = {
      type: "GraphQueryExpr",
      subject: null,
      relation: null,
      object: null,
      node: identifier("child"),
      state: stringLiteral("status"),
      meta: null,
      equals: stringLiteral("ready"),
    } as any;

    const result = evaluateGraphQuery(graph, query, {
      bindings: {
        values: new Map(),
        nodes: new Map(),
      },
      actions: new Map(),
    });

    expect(result).toBe(true);
  });

  it("evaluates comparison expressions through evaluateGraphControlExpr", () => {
    const graph = createGraphControlTestGraph();

    const expr = {
      type: "ComparisonExpr",
      operator: "==",
      left: stringLiteral("READY"),
      right: stringLiteral("ready"),
    } as any;

    const result = evaluateGraphControlExpr(graph, expr, {
      bindings: {
        values: new Map(),
        nodes: new Map(),
      },
      actions: new Map(),
    });

    expect(result).toBe(true);
  });

  it("evaluates derived paths across graph edges", () => {
    const graph = createGraphControlTestGraph();

    const result = evaluateDerivePath(graph, containsPathExpr(), {
      bindings: {
        values: new Map(),
        nodes: new Map(),
      },
      actions: new Map(),
    });

    expect(result).toEqual(["child", "grandchild"]);
  });

  it("evaluates derived sum from collected state values", () => {
    const graph = createGraphControlTestGraph();

    const collectExpr = {
      type: "DeriveCollectExpr",
      path: containsPathExpr(),
      layer: stringLiteral("state"),
      key: stringLiteral("points"),
    } as any;

    const sumExpr = {
      type: "DeriveSumExpr",
      collect: collectExpr,
      from: null,
      field: null,
    } as any;

    const result = evaluateDeriveSum(graph, sumExpr, {
      bindings: {
        values: new Map(),
        nodes: new Map(),
      },
      actions: new Map(),
    });

    expect(result).toBe(7);
  });

  it("evaluates loop count from a derived numeric expression", () => {
    const graph = createGraphControlTestGraph();

    const countExpr = {
      type: "DeriveSumExpr",
      collect: {
        type: "DeriveCollectExpr",
        path: containsPathExpr(),
        layer: stringLiteral("state"),
        key: stringLiteral("points"),
      },
      from: null,
      field: null,
    } as any;

    const result = evaluateLoopCount(graph, countExpr, {
      bindings: {
        values: new Map(),
        nodes: new Map(),
      },
    });

    expect(result).toBe(7);
  });

  it("preserves expected guard/error behavior for invalid query modes", () => {
    const graph = createGraphControlTestGraph();

    const invalidQuery = {
      type: "GraphQueryExpr",
      subject: identifier("root"),
      relation: stringLiteral("contains"),
      object: identifier("child"),
      node: identifier("child"),
      state: stringLiteral("status"),
      meta: null,
      equals: null,
    } as any;

    expect(() =>
      evaluateGraphQuery(graph, invalidQuery, {
        bindings: {
          values: new Map(),
          nodes: new Map(),
        },
        actions: new Map(),
      }),
    ).toThrow(
      "@query must use exactly one mode: edge existence, state query, or meta query",
    );
  });
});