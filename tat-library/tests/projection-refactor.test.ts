import { describe, expect, it } from "vitest";
import { projectGraphResult } from "../runtime/projection/projection";
import type { Graph, GraphNode } from "../runtime/graph/graph";
import type { RuntimeState } from "../runtime/engine/executeProgram";

function createTestGraph(): Graph {
  const assignmentNode: GraphNode = {
    id: "assignment1",
    semanticId: "assignment:1",
    value: { name: "Essay 1", type: "assignment" },
    state: {
      viewerRole: "TEACHER",
      viewerId: "teacher1",
    },
    meta: { type: "assignment", label: "Essay 1" },
  };

  const submissionNode: GraphNode = {
    id: "submission1",
    semanticId: "submission:1",
    value: { name: "Carl Submission", type: "submission" },
    state: {
      gradingState: "ungraded",
    },
    meta: { type: "submission" },
  };

  return {
    root: "assignment1",
    nodes: new Map<string, GraphNode>([
      ["assignment1", assignmentNode],
      ["submission1", submissionNode],
    ]),
    edges: [
      {
        id: "edge1",
        subject: "submission1",
        object: "assignment1",
        relation: "forAssignment",
        kind: "branch",
        meta: {},
        context: null,
      },
    ],
    history: [],

    state: {},
    meta: {},
  };
}

function createRuntimeState(): RuntimeState {
  return {
    bindings: {
      values: new Map(),
      nodes: new Map(),
    },
    actions: new Map(),
    projectionDefinitions: new Map(),
  } as unknown as RuntimeState;
}

describe("projection refactor behavior", () => {
  it("rejects removed app/UI-shaped projection formats", () => {
    const graph = createTestGraph();
    const state = createRuntimeState();

    for (const removedFormat of [
      "assignment_status",
      "menu",
      "list",
      "generations",
      "siblings",
      "ancestors",
      "descendants",
    ]) {
      const projection = {
        type: "ProjectExpr",
        projectionName: null,
        args: [
          {
            type: "Argument",
            key: { type: "Identifier", name: "format" },
            value: {
              type: "StringLiteral",
              value: removedFormat,
              raw: `"${removedFormat}"`,
            },
          },
          {
            type: "Argument",
            key: { type: "Identifier", name: "focus" },
            value: {
              type: "StringLiteral",
              value: "assignment1",
              raw: `"assignment1"`,
            },
          },
        ],
      } as any;

      expect(() => projectGraphResult(graph, projection, state)).toThrow(
        `Invalid @project format "${removedFormat}"`,
      );
    }
  });

  it("projects collection format with default include fields", () => {
    const graph = createTestGraph();
    const state = createRuntimeState();

    const projection = {
      type: "ProjectExpr",
      projectionName: null,
      args: [
        {
          type: "Argument",
          key: { type: "Identifier", name: "format" },
          value: {
            type: "StringLiteral",
            value: "collection",
            raw: `"collection"`,
          },
        },
        {
          type: "Argument",
          key: { type: "Identifier", name: "focus" },
          value: {
            type: "StringLiteral",
            value: "assignment1",
            raw: `"assignment1"`,
          },
        },
      ],
    } as any;

    const result = projectGraphResult(graph, projection, state);

    expect(result).toMatchObject({
      format: "collection",
      focus: {
        id: "assignment1",
        label: "Essay 1",
      },
      items: [],
    });
  });

  it("throws when projection format is invalid", () => {
    const graph = createTestGraph();
    const state = createRuntimeState();

    const projection = {
      type: "ProjectExpr",
      projectionName: null,
      args: [
        {
          type: "Argument",
          key: { type: "Identifier", name: "format" },
          value: {
            type: "StringLiteral",
            value: "fake_format",
            raw: `"fake_format"`,
          },
        },
      ],
    } as any;

    expect(() => projectGraphResult(graph, projection, state)).toThrow(
      `Invalid @project format "fake_format"`,
    );
  });
});