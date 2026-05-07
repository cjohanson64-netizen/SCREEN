import { useState } from "react";
import "./App.css";
import Hero from "./components/Hero";
import ProjectHealthDashboard from "./components/ProjectHealthDashboard";
import CodePanel from "./components/CodePanel";
import Footer from "./components/Footer";

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
      <div className="app-shell">
        <Hero />
        <ProjectHealthDashboard
          projectGraph={projectGraph}
          onProjectGraphChange={setProjectGraph}
          onAnalyzeFile={handleAnalyzeProjectFile}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Hero />
      <CodePanel
        key={selectedProjectFile?.path ?? "manual-code-panel"}
        selectedProjectFile={selectedProjectFile}
        onBackToHealthGraph={handleBackToHealthGraph}
      />
      <Footer />
    </div>
  );
}
