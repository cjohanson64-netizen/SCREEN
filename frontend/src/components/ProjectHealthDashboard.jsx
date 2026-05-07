import { useMemo, useState } from "react";

const API_URL = "http://localhost:5050/api/project/upload";

function getRiskColor(riskLevel) {
  if (riskLevel === "high") return "#ef4444";
  if (riskLevel === "medium") return "#f59e0b";
  return "#22c55e";
}

function getRiskRank(riskLevel) {
  if (riskLevel === "high") return 3;
  if (riskLevel === "medium") return 2;
  if (riskLevel === "low") return 1;
  return 0;
}

function buildRiskTooltip(node) {
  const metrics = node.file?.metrics ?? node.metrics ?? {};
  const factors = getRiskFactors(metrics);
  const riskLevel = metrics.riskLevel ?? node.riskLevel ?? "unknown";

  const lines = [node.name, `Risk Level: ${riskLevel}`];

  if (factors.length > 0) {
    lines.push("", "Risk Factors:");
    factors.forEach((factor) => {
      lines.push(`• ${factor}`);
    });
  } else {
    lines.push("", "• No major risk factors detected");
  }

  return lines.join("\n");
}

function buildRiskAriaLabel(node) {
  const metrics = node.file?.metrics ?? node.metrics ?? {};
  const factors = getRiskFactors(metrics);
  const riskLevel = metrics.riskLevel ?? node.riskLevel ?? "unknown";

  if (!factors.length) {
    return `${node.name}. Risk level ${riskLevel}. No major risk factors detected.`;
  }

  return `${node.name}. Risk level ${riskLevel}. Risk factors include: ${factors.join(
    ", ",
  )}.`;
}

function getRiskFactors(metrics = {}) {
  const factors = [];

  if ((metrics.complexity ?? 0) >= 70) {
    factors.push(`high complexity (${metrics.complexity})`);
  }

  if ((metrics.lineCount ?? 0) >= 300) {
    factors.push(`large file (${metrics.lineCount} lines)`);
  }

  if ((metrics.functionCount ?? 0) >= 12) {
    factors.push(`many functions (${metrics.functionCount})`);
  }

  if ((metrics.branchCount ?? 0) >= 20) {
    factors.push(`many branches (${metrics.branchCount})`);
  }

  if ((metrics.fanIn ?? 0) >= 5) {
    factors.push(`high fan-in (${metrics.fanIn})`);
  }

  if ((metrics.fanOut ?? 0) >= 5) {
    factors.push(`high fan-out (${metrics.fanOut})`);
  }

  return factors;
}

function getHighestRisk(left = "low", right = "low") {
  return getRiskRank(right) > getRiskRank(left) ? right : left;
}

function createTreeNode(name, path, type = "folder") {
  return {
    name,
    path,
    type,
    children: {},
    file: null,
    riskLevel: "low",
  };
}

function buildProjectTree(projectGraph) {
  const root = createTreeNode("Project Root", "", "folder");

  if (!projectGraph?.nodes?.length) {
    return root;
  }

  for (const fileNode of projectGraph.nodes) {
    const parts = fileNode.path.split("/").filter(Boolean);
    let cursor = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join("/");

      if (!cursor.children[part]) {
        cursor.children[part] = createTreeNode(
          part,
          path,
          isFile ? "file" : "folder",
        );
      }

      cursor = cursor.children[part];

      if (isFile) {
        cursor.type = "file";
        cursor.file = fileNode;
        cursor.riskLevel = fileNode.metrics?.riskLevel ?? "low";
      }
    });
  }

  propagateFolderRisk(root);

  const rootChildren = Object.values(root.children).sort(sortTreeNodes);

  if (rootChildren.length === 1 && rootChildren[0].type === "folder") {
    return rootChildren[0];
  }

  return root;
}

function propagateFolderRisk(node) {
  if (node.type === "file") {
    return node.riskLevel;
  }

  let riskLevel = "low";

  Object.values(node.children).forEach((child) => {
    const childRisk = propagateFolderRisk(child);
    riskLevel = getHighestRisk(riskLevel, childRisk);
  });

  node.riskLevel = riskLevel;
  return riskLevel;
}

function sortTreeNodes(a, b) {
  if (a.type !== b.type) {
    return a.type === "folder" ? -1 : 1;
  }

  return a.name.localeCompare(b.name);
}

export default function ProjectHealthDashboard({
  projectGraph,
  onProjectGraphChange,
  onAnalyzeFile,
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const projectTree = useMemo(
    () => buildProjectTree(projectGraph),
    [projectGraph],
  );

  async function handleProjectUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setIsUploading(true);
    setError("");
    setSelectedNode(null);
    setExpandedPaths(new Set());

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

  function toggleFolder(path) {
    setExpandedPaths((current) => {
      const next = new Set(current);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  }

  function handleSelectFile(fileNode) {
    const selected = {
      path: fileNode.path,
      name: fileNode.name,
      content: fileNode.content,
      metrics: fileNode.metrics,
      imports: fileNode.imports ?? [],
      dependents: fileNode.dependents ?? [],
      validImportPaths: fileNode.validImportPaths ?? [],
      nearbyFiles: fileNode.nearbyFiles ?? [],
    };

    setSelectedNode(selected);
    onAnalyzeFile(selected);
  }

  return (
    <section className="project-health-dashboard">
      <div className="project-upload-area">
        <label className="project-upload-button">
          Upload Project Zip
          <input
            type="file"
            accept=".zip"
            onChange={handleProjectUpload}
            disabled={isUploading}
          />
        </label>

        {isUploading && <p className="status-message">Building file tree...</p>}
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="project-health-layout">
        <div className="project-tree-panel">
          {Object.keys(projectTree.children ?? {}).length > 0 ? (
            <ProjectCascadeTree
              rootNode={projectTree}
              expandedPaths={expandedPaths}
              selectedPath={selectedNode?.path}
              onToggleFolder={toggleFolder}
              onSelectFile={handleSelectFile}
            />
          ) : (
            <div className="empty-graph-state">
              <h2>No project loaded yet</h2>
              <p>Upload your project zip to generate the first file tree.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectCascadeTree({
  rootNode,
  expandedPaths,
  selectedPath,
  onToggleFolder,
  onSelectFile,
}) {
  const rootChildren = Object.values(rootNode.children ?? {}).sort(
    sortTreeNodes,
  );

  return (
    <div className="project-tree-shell">
      <div className="project-tree-title">
        <span
          className="tree-risk-dot"
          style={{ background: getRiskColor(rootNode.riskLevel) }}
        />
        <h2>{rootNode.name}</h2>
      </div>

      <div className="project-cascade-tree">
        {rootChildren.map((node) => (
          <div className="project-root-column" key={node.path}>
            <TreeNode
              node={node}
              depth={0}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  depth,
  expandedPaths,
  selectedPath,
  onToggleFolder,
  onSelectFile,
}) {
  const isFolder = node.type === "folder";
  const isExpanded = expandedPaths.has(node.path) || depth === 0;
  const isSelected = selectedPath === node.path;
  const children = Object.values(node.children ?? {}).sort(sortTreeNodes);

  function handleClick() {
    if (isFolder) {
      onToggleFolder(node.path);
      return;
    }

    if (node.file) {
      onSelectFile(node.file);
    }
  }

  return (
    <div className="tree-node-group">
      <button
        type="button"
        className={`tree-node tree-node-${node.type} ${
          isSelected ? "selected" : ""
        }`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        onClick={handleClick}
        title={buildRiskTooltip(node)}
        aria-label={buildRiskAriaLabel(node)}
      >
        <span
          className="tree-risk-dot"
          style={{ background: getRiskColor(node.riskLevel) }}
        />

        <span className="tree-node-icon">{isFolder ? "▸" : "•"}</span>

        <span className="tree-node-name">{node.name}</span>

        {isFolder && <span className="tree-node-count">{children.length}</span>}
      </button>

      {isFolder && isExpanded && children.length > 0 && (
        <div className="tree-node-children">
          {children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}