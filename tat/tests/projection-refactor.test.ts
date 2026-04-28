import { describe, expect, it } from "vitest";
import { projectGraphResult } from "../runtime/projection";
import type { Graph, GraphNode } from "../runtime/graph";
import type { RuntimeState } from "../runtime/executeProgram";

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
  it("projects assignment_status without changing output shape", () => {
    const graph = createTestGraph();
    const state = createRuntimeState();

    const projection = {
      type: "ProjectExpr",
      projectionName: null,
      syntax: "inline",
      args: [
        {
          type: "Argument",
          key: { type: "Identifier", name: "format" },
          value: {
            type: "StringLiteral",
            value: "assignment_status",
            raw: `"assignment_status"`,
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

    expect(result).toEqual({
      format: "assignment_status",
      node: {
        id: "assignment1",
        label: "Essay 1",
        type: "assignment",
      },
      viewer: {
        role: "TEACHER",
        viewerId: "teacher1",
      },
      status: {
        code: "needs_grading",
        label: "Needs Grading",
        tone: "warning",
      },
      nextAction: {
        code: "grade_submissions",
        label: "Grade Submissions",
      },
      meta: {
        submissionCount: 1,
        gradedCount: 0,
        ungradedCount: 1,
        hasSubmission: true,
        hasGrade: false,
      },
    });
  });

  it("projects list format with default include fields", () => {
    const graph = createTestGraph();
    const state = createRuntimeState();

    const projection = {
      type: "ProjectExpr",
      projectionName: null,
      syntax: "inline",
      args: [
        {
          type: "Argument",
          key: { type: "Identifier", name: "format" },
          value: {
            type: "StringLiteral",
            value: "list",
            raw: `"list"`,
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
      format: "list",
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
      syntax: "inline",
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