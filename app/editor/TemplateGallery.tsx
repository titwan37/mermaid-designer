/* app/editor/TemplateGallery.tsx */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MermaidTemplate, templates } from "@/lib/templateData";

export default function TemplateGallery() {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const openTemplate = (id: string) => {
    // Navigate to the editor with the chosen template ID
    router.push(`/mermaid-designer?templateId=${encodeURIComponent(id)}`);
  };

  return (
    <section className="p-4 max-w-7xl mx-auto">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Mermaid Template Gallery
        </h1>
        <button
          className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? 'List View' : 'Grid View'}
        </button>
      </div>

      {/* Grid or List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {templates.map((tpl: MermaidTemplate) => (
          <div
            key={tpl.id}
            className="cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 shadow hover:shadow-lg transition-all"
            onClick={() => openTemplate(tpl.id)}
          >
            {/* Thumbnail */}
            <div className="p-4 flex justify-center items-center bg-gray-50 dark:bg-zinc-800 rounded-t-lg">
              <img
                src={tpl.thumbnailSvg}
                alt={tpl.title}
                className="max-h-32 w-auto object-contain"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                {tpl.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {tpl.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {tpl.useCases.map((caseTag) => (
                  <span
                    key={caseTag}
                    className="px-2 py-0.5 text-xs rounded bg-primary/20 text-primary dark:bg-primary/30"
                  >
                    {caseTag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Category: {tpl.category}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
