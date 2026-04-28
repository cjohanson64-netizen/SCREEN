import { useState } from "react";

export default function ResultsTabs({ tabs = [] }) {
  const visibleTabs = tabs.filter((tab) => tab && tab.content);

  const [activeId, setActiveId] = useState("");
  const [seenTabs, setSeenTabs] = useState([]);

  if (!visibleTabs.length) return null;

  const activeTab =
    visibleTabs.find((tab) => tab.id === activeId) ?? visibleTabs[0];

  function handleTabClick(id) {
    setActiveId(id);
    setSeenTabs((prev) => [...new Set([...prev, id])]);
  }

  return (
    <section className="results-tabs">
      <nav className="tabs-nav">
        {visibleTabs.map((tab) => {
          const isActive = activeTab.id === tab.id;

          return (
            <button
              key={tab.id}
              className={`tab-button ${isActive ? "active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="tab-label">{tab.label}</span>

              {tab.severity && !seenTabs.includes(tab.id) && (
                <span
                  className={`tab-dot ${tab.severity}`}
                  title={`Has ${tab.severity} severity issues`}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="tab-panel">{activeTab.content}</div>
    </section>
  );
}
