import { useMemo, useState, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import TatLogo from "../assets/TAT-Logo.svg";
import ScreenLogo from "../assets/SCREEN-Logo.svg";
import "../styles/features/project-health-dashboard.css";

const API_URL = "http://localhost:5050/api/project/upload";

function getRiskColor(riskLevel) {
  if (riskLevel === "high") return "#ef4444";
  if (riskLevel === "medium") return "#f59e0b";
  return "#22c55e";
}

function toGraphData(projectGraph) {
  if (!projectGraph) {
    return {
      nodes: [],
      links: [],
    };
  }

  return {
    nodes: projectGraph.nodes.map((node) => ({
      id: node.path,
      name: node.name,
      path: node.path,
      content: node.content,
      metrics: node.metrics,
      imports: node.imports,
      dependents: node.dependents,
    })),
    links: projectGraph.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      importPath: edge.importPath,
    })),
  };
}

export default function ProjectHealthDashboard({
  projectGraph,
  onProjectGraphChange,
  onAnalyzeFile,
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const graphData = useMemo(() => toGraphData(projectGraph), [projectGraph]);

  const graphPanelRef = useRef(null);
  const [graphSize, setGraphSize] = useState({
    width: 900,
    height: 600,
  });

  useEffect(() => {
    if (!graphPanelRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setGraphSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(graphPanelRef.current);

    return () => observer.disconnect();
  }, []);

  async function handleProjectUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setIsUploading(true);
    setError("");
    setSelectedNode(null);

    const formData = new FormData();
    formData.append("project", file);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload project.");
      }

      onProjectGraphChange(data.graph);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="project-health-dashboard">
      <header className="project-health-header">
        <div>
          <p className="eyebrow">
            Python measures. TAT interprets. React explains.
          </p>
          <br />
          <div className="logo">
            <img className="screen-logo" src={ScreenLogo} alt="" />
          </div>
          <div className="logo">
            <img className="tat-logo" src={TatLogo} alt="TAT Logo" />
            <h2>Powered by TryAngleTree</h2>
          </div>
          <p>Load a project, analyze code, generate AI prompt for refactor</p>
        </div>
      </header>
      <label className="project-upload-button">
        Upload Project Zip
        <input
          type="file"
          accept=".zip"
          onChange={handleProjectUpload}
          disabled={isUploading}
        />
      </label>

      {isUploading && <p className="status-message">Building graph...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="project-health-layout">
        <div className="graph-panel" ref={graphPanelRef}>
          {graphData.nodes.length > 0 ? (
            <ForceGraph2D
              width={graphSize.width}
              height={graphSize.height}
              graphData={graphData}
              nodeLabel={(node) =>
                `${node.name}\nRisk: ${node.metrics.riskLevel}`
              }
              nodeColor={(node) => getRiskColor(node.metrics.riskLevel)}
              nodeRelSize={6}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              linkColor={() => "rgba(148, 163, 184, 0.6)"}
              onNodeClick={(node) => setSelectedNode(node)}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = Math.max(10 / globalScale, 4);
                const radius = 6;

                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = getRiskColor(node.metrics.riskLevel);
                ctx.fill();

                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = "#e5e7eb";
                ctx.fillText(label, node.x, node.y + radius + 2);
              }}
            />
          ) : (
            <div className="empty-graph-state">
              <h2>No project loaded yet</h2>
              <p>Upload your test zip to generate the first health graph.</p>
            </div>
          )}
        </div>

        <aside className="node-detail-panel">
          {selectedNode ? (
            <NodeDetails node={selectedNode} onAnalyzeFile={onAnalyzeFile} />
          ) : (
            <div className="empty-details-state">
              <h2>Select a file</h2>
              <p>Click a node to inspect metrics and relationships.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function NodeDetails({ node, onAnalyzeFile }) {
  const metrics = node.metrics;

  function handleAnalyzeClick() {
    onAnalyzeFile({
      path: node.path,
      name: node.name,
      content: node.content,
      metrics: node.metrics,
      imports: node.imports,
      dependents: node.dependents,
    });
  }

  return (
    <div>
      <h2>{node.name}</h2>
      <p className="file-path">{node.path}</p>

      <div className={`risk-pill risk-${metrics.riskLevel}`}>
        {metrics.riskLevel.toUpperCase()} RISK
      </div>

      <div className="metrics-grid">
        <Metric label="Risk" value={metrics.risk} />
        <Metric label="Complexity" value={metrics.complexity} />
        <Metric label="Lines" value={metrics.lineCount} />
        <Metric label="Functions" value={metrics.functionCount} />
        <Metric label="Branches" value={metrics.branchCount} />
        <Metric label="Fan In" value={metrics.fanIn} />
        <Metric label="Fan Out" value={metrics.fanOut} />
      </div>

      <RelationshipList title="Imports" items={node.imports} />
      <RelationshipList title="Imported By" items={node.dependents} />

      <button className="analyze-file-button" onClick={handleAnalyzeClick}>
        Analyze This File
      </button>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RelationshipList({ title, items }) {
  return (
    <div className="relationship-list">
      <h3>{title}</h3>

      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>None</p>
      )}
    </div>
  );
}
