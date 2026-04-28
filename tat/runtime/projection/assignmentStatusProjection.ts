import type { Graph, GraphNode } from "../graph.js";
import { getIncomingEdges, getNode } from "../graph.js";
import type { ProjectFieldContext, ProjectSpec } from "./projectTypes.js";
import { computeNodeLabel, resolveFocusNode } from "./projectionUtils.js";

export function projectAssignmentStatusFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "assignment_status";
  node: {
    id: string;
    label: string;
    type: "assignment";
  };
  viewer: {
    role: string;
    viewerId: string;
  };
  status: {
    code: string;
    label: string;
    tone: string;
  };
  nextAction: {
    code: string;
    label: string;
  };
  meta: {
    submissionCount?: number;
    gradedCount?: number;
    ungradedCount?: number;
    hasSubmission?: boolean;
    hasGrade?: boolean;
  };
} {
  const focusNode = resolveFocusNode(context.graph, spec.focus);
  const viewerRole =
    typeof focusNode.state.viewerRole === "string"
      ? focusNode.state.viewerRole
      : "TEACHER";
  const viewerId =
    typeof focusNode.state.viewerId === "string"
      ? focusNode.state.viewerId
      : "";
  const assignmentSubmissionNodes = getAssignmentSubmissionNodes(
    context.graph,
    focusNode.id,
  );
  const relevantSubmissionNodes =
    viewerRole === "STUDENT"
      ? getStudentAssignmentSubmissionNodes(
          context.graph,
          assignmentSubmissionNodes,
          viewerId,
        )
      : assignmentSubmissionNodes;
  const submissionCount = relevantSubmissionNodes.length;
  const gradedCount = relevantSubmissionNodes.filter(
    (node) => node.state.gradingState === "graded",
  ).length;
  const ungradedCount = relevantSubmissionNodes.filter(
    (node) => node.state.gradingState === "ungraded",
  ).length;
  const hasSubmission = submissionCount > 0;
  const hasGrade = gradedCount > 0;
  const gradingState =
    viewerRole === "STUDENT"
      ? deriveStudentAssignmentGradingState(relevantSubmissionNodes)
      : undefined;

  const statusPayload = deriveAssignmentStatusProjection(
    viewerRole,
    submissionCount,
    ungradedCount,
    hasSubmission,
    hasGrade,
    gradingState,
  );

  return {
    format: "assignment_status",
    node: {
      id: focusNode.id,
      label: computeNodeLabel(focusNode),
      type: "assignment",
    },
    viewer: {
      role: viewerRole,
      viewerId,
    },
    status: {
      code: statusPayload.status.code,
      label: statusPayload.status.label,
      tone: statusPayload.status.tone,
    },
    nextAction: {
      code: statusPayload.nextAction.code,
      label: statusPayload.nextAction.label,
    },
    meta: {
      ...(submissionCount !== undefined ? { submissionCount } : {}),
      ...(gradedCount !== undefined ? { gradedCount } : {}),
      ...(ungradedCount !== undefined ? { ungradedCount } : {}),
      ...(hasSubmission !== undefined ? { hasSubmission } : {}),
      ...(hasGrade !== undefined ? { hasGrade } : {}),
    },
  };
}

function getAssignmentSubmissionNodes(
  graph: Graph,
  assignmentNodeId: string,
): GraphNode[] {
  return getIncomingEdges(graph, assignmentNodeId)
    .filter((edge) => edge.relation === "forAssignment")
    .map((edge) => getNode(graph, edge.subject))
    .filter((node) => node.meta.type === "submission");
}

function getStudentAssignmentSubmissionNodes(
  graph: Graph,
  assignmentSubmissionNodes: GraphNode[],
  viewerId: string,
): GraphNode[] {
  const viewerSemanticId = `student:${viewerId}`;

  return assignmentSubmissionNodes.filter((submissionNode) =>
    getIncomingEdges(graph, submissionNode.id).some((edge) => {
      if (edge.relation !== "submitted") return false;
      const studentNode = getNode(graph, edge.subject);
      return studentNode.semanticId === viewerSemanticId;
    }),
  );
}

function deriveStudentAssignmentGradingState(
  submissionNodes: GraphNode[],
): string | undefined {
  if (submissionNodes.some((node) => node.state.gradingState === "ungraded")) {
    return "ungraded";
  }

  if (submissionNodes.some((node) => node.state.gradingState === "graded")) {
    return "graded";
  }

  return undefined;
}

function deriveAssignmentStatusProjection(
  viewerRole: string,
  submissionCount: number | undefined,
  ungradedCount: number | undefined,
  hasSubmission: boolean | undefined,
  hasGrade: boolean | undefined,
  gradingState: string | undefined,
): {
  status: {
    code: string;
    label: string;
    tone: string;
  };
  nextAction: {
    code: string;
    label: string;
  };
} {
  if (viewerRole === "STUDENT") {
    if (hasSubmission === false) {
      return {
        status: {
          code: "awaiting_submission",
          label: "Not Submitted",
          tone: "danger",
        },
        nextAction: { code: "submit_work", label: "Submit Assignment" },
      };
    }

    if (hasSubmission === true && gradingState === "ungraded") {
      return {
        status: { code: "submitted", label: "Submitted", tone: "info" },
        nextAction: { code: "wait_for_grade", label: "Wait for Grade" },
      };
    }

    if (hasSubmission === true && gradingState === "graded") {
      return {
        status: { code: "graded", label: "Graded", tone: "success" },
        nextAction: { code: "review_feedback", label: "Review Feedback" },
      };
    }
  }

  if (viewerRole === "TEACHER" || viewerRole === "ADMIN") {
    if (submissionCount === 0) {
      return {
        status: {
          code: "no_submissions",
          label: "No Submissions",
          tone: "neutral",
        },
        nextAction: { code: "none", label: "No Action Needed" },
      };
    }

    if ((submissionCount ?? 0) > 0 && (ungradedCount ?? 0) > 0) {
      return {
        status: {
          code: "needs_grading",
          label: "Needs Grading",
          tone: "warning",
        },
        nextAction: { code: "grade_submissions", label: "Grade Submissions" },
      };
    }

    if ((submissionCount ?? 0) > 0 && (ungradedCount ?? 0) === 0) {
      return {
        status: { code: "graded", label: "Graded", tone: "success" },
        nextAction: { code: "view_submissions", label: "View Submissions" },
      };
    }
  }

  if (hasSubmission === true && hasGrade === true) {
    return {
      status: { code: "graded", label: "Graded", tone: "success" },
      nextAction: { code: "review_feedback", label: "Review Feedback" },
    };
  }

  return {
    status: { code: "unknown", label: "Unknown", tone: "neutral" },
    nextAction: { code: "none", label: "No Action Available" },
  };
}
