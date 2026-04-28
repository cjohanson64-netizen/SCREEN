import { useState } from "react";
import "./styles/foundation/theme.css";
import "./styles/foundation/base.css";
import "./styles/layout/app-layout.css";
import "./styles/layout/grids.css";
import "./styles/ui/panel.css";
import "./styles/ui/buttons.css";
import "./styles/ui/forms.css";
import "./styles/ui/badges.css";
import "./styles/ui/cards.css";
import "./styles/ui/tabs.css";
import "./styles/features/review.css";
import "./styles/features/repetition.css";
import "./styles/features/highlighted-code.css";
import "./styles/features/findings.css";
import "./styles/features/prompt-config.css";
import "./styles/features/project-health-dashboard.css";
import ProjectHealthDashboard from "./components/ProjectHealthDashboard";
import CodePanel from "./components/CodePanel";

export default function App() {
  const [activeView, setActiveView] = useState("health");
  const [selectedProjectFile, setSelectedProjectFile] = useState(null);
  const [projectGraph, setProjectGraph] = useState(null);

  function handleAnalyzeProjectFile(fileContext) {
    setSelectedProjectFile(fileContext);
    setActiveView("code");
  }

  function handleBackToHealthGraph() {
    setActiveView("health");
  }

  if (activeView === "health") {
    return (
      <ProjectHealthDashboard
        projectGraph={projectGraph}
        onProjectGraphChange={setProjectGraph}
        onAnalyzeFile={handleAnalyzeProjectFile}
      />
    );
  }

  return (
    <CodePanel
      key={selectedProjectFile?.path ?? "manual-code-panel"}
      selectedProjectFile={selectedProjectFile}
      onBackToHealthGraph={handleBackToHealthGraph}
    />
  );
}
