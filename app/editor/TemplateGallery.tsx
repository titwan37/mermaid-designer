/* app/editor/TemplateGallery.tsx */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MermaidTemplate, templates } from "@/lib/templateData";

const IconMapper = ({ type }: { type: string }) => {
  const baseClass = "w-full h-full text-emerald-500/80 dark:text-emerald-400/80";
  
  switch (type) {
    case 'flowchart':
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <rect x="3" y="14" width="6" height="4" rx="1" />
          <rect x="15" y="14" width="6" height="4" rx="1" />
          <path d="M12 7v4m0 0H6v3m6-3h6v3" />
        </svg>
      );
    case 'architecture':
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      );
    case 'chart':
    case 'radar':
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3v18M3 12h18" />
          <path d="M18.36 5.64l-12.72 12.72M5.64 5.64l12.72 12.72" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
  }
};

export default function TemplateGallery() {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const openTemplate = (id: string) => {
    // router.push already accounts for the basePath: '/mermaid-designer'
    router.push(`/?templateId=${encodeURIComponent(id)}`);
  };

  return (
    <section className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      {/* Header & Toggle Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Template Gallery
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Select a starting architecture for your design.
          </p>
        </div>

        {/* Polished Segmented Control Toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Dynamic Grid / List Container */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col space-y-4'
        }
      >
        {templates.map((tpl: MermaidTemplate) => (
          <div
            key={tpl.id}
            onClick={() => openTemplate(tpl.id)}
            className={`group cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:dark:bg-zinc-900 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-600 overflow-hidden flex ${
              viewMode === 'grid' ? 'flex-col' : 'flex-col md:flex-row'
            }`}
          >
            {/* Thumbnail Area - With subtle canvas dot-grid */}
            <div
              className={`relative flex justify-center items-center bg-zinc-50 dark:bg-zinc-950/50 p-8 ${
                viewMode === 'grid'
                  ? 'border-b border-zinc-200 dark:border-zinc-800 h-48'
                  : 'md:w-1/3 md:border-r border-zinc-200 dark:border-zinc-800 border-b md:border-b-0 shrink-0 min-h-[200px]'
              }`}
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(161, 161, 170, 0.15) 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            >
              <div className="w-20 h-20 transition-transform duration-300 group-hover:scale-110">
                <IconMapper type={tpl.thumbnailSvg} />
              </div>

              {/* Category Badge overlaying the image */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full bg-white/80 dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 backdrop-blur-sm">
                  {tpl.category}
                </span>
              </div>
            </div>

            {/* Text Content Area */}
            <div className="p-5 flex flex-col justify-between flex-grow">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {tpl.title}
                </h2>
                <p className={`text-sm text-zinc-500 dark:text-zinc-400 mb-4 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-3'}`}>
                  {tpl.description}
                </p>
              </div>

              {/* Use Case Tags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {tpl.useCases.map((caseTag) => (
                  <span
                    key={caseTag}
                    className="px-2.5 py-1 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium"
                  >
                    {caseTag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}