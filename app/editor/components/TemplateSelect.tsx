// c:\Dev\mermaid-designer\app\editor\components\TemplateSelect.tsx
"use client";

import * as React from "react";

type Props = {
  onSelect: (template: string) => void;
};

type Template = {
  name: string;
  path: string; // public URL relative to /templates/
};

export default function TemplateSelect({ onSelect }: Props) {
  const [templates, setTemplates] = React.useState<Template[]>([]);

  // Hard‑coded list – you can add more files under public/templates
  React.useEffect(() => {
    setTemplates([
      { name: "📊 Flowchart (advanced)", path: "/mermaid-designer/templates/flowchart_advanced.mmd" },
      { name: "🔄 Sequence diagram", path: "/mermaid-designer/templates/sequence.mmd" },
      { name: "📅 Gantt chart", path: "/mermaid-designer/templates/gantt.mmd" },
      { name: "🏛️ Architecture", path: "/mermaid-designer/templates/architecture.mmd" },
      { name: "📦 Block diagram", path: "/mermaid-designer/templates/block.mmd" },
      { name: "🌐 C4 Context", path: "/mermaid-designer/templates/c4.mmd" },
      { name: "📦 C4 Container", path: "/mermaid-designer/templates/c4container.mmd" },
      { name: "🏷️ Class diagram", path: "/mermaid-designer/templates/class.mmd" },
      { name: "🗄️ Entity Relationship", path: "/mermaid-designer/templates/er.mmd" },
      { name: "🌿 Git Graph", path: "/mermaid-designer/templates/git.mmd" },
      { name: "🐟 Ishikawa", path: "/mermaid-designer/templates/ishikawa.mmd" },
      { name: "🦴 Ishikawa (beta)", path: "/mermaid-designer/templates/ishikawa_beta.mmd" },
      { name: "📋 Kanban", path: "/mermaid-designer/templates/kanban.mmd" },
      { name: "🧠 Mindmap", path: "/mermaid-designer/templates/mindmap.mmd" },
      { name: "📨 Packet", path: "/mermaid-designer/templates/packet.mmd" },
      { name: "🥧 Pie chart", path: "/mermaid-designer/templates/pie.mmd" },
      { name: "📏 Quadrant chart", path: "/mermaid-designer/templates/quadrant.mmd" },
      { name: "🎯 Radar chart", path: "/mermaid-designer/templates/radar.mmd" },
      { name: "📝 Requirement", path: "/mermaid-designer/templates/requirement.mmd" },
      { name: "🌊 Sankey diagram", path: "/mermaid-designer/templates/sankey.mmd" },
      { name: "⚙️ State diagram", path: "/mermaid-designer/templates/state.mmd" },
      { name: "⏳ Timeline", path: "/mermaid-designer/templates/timeline.mmd" },
      { name: "⏳ Timeline (advanced)", path: "/mermaid-designer/templates/timeline-advanced.mmd" },
      { name: "🌲 TreeView", path: "/mermaid-designer/templates/treeview.mmd" },
      { name: "🗺️ Treemap", path: "/mermaid-designer/templates/treemap.mmd" },
      { name: "🚶 User Journey", path: "/mermaid-designer/templates/user_journey.mmd" },
      { name: "🚀 Data Engineer's Journey", path: "/mermaid-designer/templates/data_engineer_journey.mmd" },
      { name: "⚪ Venn diagram", path: "/mermaid-designer/templates/venn.mmd" },
      { name: "🗺️ Wardley Map", path: "/mermaid-designer/templates/wardley.mmd" },
      { name: "📈 XY Chart", path: "/mermaid-designer/templates/xychart.mmd" },
      { name: "📜 ZenUML", path: "/mermaid-designer/templates/zenuml.mmd" },
      { name: "⚡ Event Modeling", path: "/mermaid-designer/templates/evtmodeling.mmd" },
    ]);
  }, []);

  const load = async (path: string) => {
    const resp = await fetch(path);
    const text = await resp.text();
    onSelect(text);
  };

  return (
    <select
      className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
      suppressHydrationWarning
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
        const tmpl = templates.find((t: Template) => t.path === e.target.value);
        if (tmpl) load(tmpl.path);
      }}
    >
      <option value="">— Load template —</option>
      {templates.map((t: Template) => (
        <option key={t.path} value={t.path}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
