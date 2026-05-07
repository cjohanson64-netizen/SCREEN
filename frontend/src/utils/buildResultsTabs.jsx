import MetricCards from "../components/MetricCards";
import TatReview from "../components/TatReview";
import RepetitionPanel from "../components/RepetitionPanel";
import AiPromptPanel from "../components/AiPromptPanel";
import ClusterReview from "../components/ClusterReview";
import FindingReview from "../components/FindingReview";
import PromptChainViewer from "../components/PromptChainViewer";

import { getTabSeverity } from "./formatters";

export function buildResultsTabs({
  result,
  code,
  filename,
  selectedProjectFile,
  highlightedLines,
  onHighlightLines,
}) {
  const findings = result?.tatReview?.findings ?? [];
  const repetition = result?.metrics?.repetition ?? {};
  const clusters = result?.tatReview?.clusters ?? {};
  const signals = result?.tatReview?.signals ?? [];
  const risks = result?.tatReview?.risks ?? [];

  return [
    {
      id: "metrics",
      label: "Metrics",
      content: <MetricCards metrics={result.metrics} />,
    },
    {
      id: "findings",
      label: "Review Findings",
      severity: getTabSeverity({ findings }),
      content: <FindingReview findings={findings} />,
    },
    {
      id: "tat-review",
      label: "Semantic Review",
      severity: getTabSeverity({ signals, risks }),
      content: <TatReview review={result.tatReview} code={code} />,
    },
    {
      id: "clusters",
      label: "Semantic Signal Clusters",
      severity: getTabSeverity({ clusters }),
      content: <ClusterReview clusters={clusters} />,
    },
    {
      id: "repeated-code",
      label: "Repeated Code",
      severity: getTabSeverity({ repetition }),
      content: (
        <RepetitionPanel
          repetition={repetition}
          highlightedLines={highlightedLines}
          onHighlightLines={onHighlightLines}
        />
      ),
    },
    {
      id: "ai-prompt",
      label: "AI Prompt",
      severity: getTabSeverity({
        findings,
        repetition,
        signals,
        risks,
      }),
      content: (
        <AiPromptPanel
          filename={filename}
          code={code}
          signals={signals}
          risks={risks}
          findings={findings}
          repetition={repetition}
          selectedProjectFile={selectedProjectFile}
        />
      ),
    },
    {
      id: "prompt-chain",
      label: "AI Prompt Chain",
      severity: result.promptChainRecommendation ? "medium" : null,
      content: (
        <PromptChainViewer
          recommendation={result.promptChainRecommendation}
        />
      ),
    },
  ];
}