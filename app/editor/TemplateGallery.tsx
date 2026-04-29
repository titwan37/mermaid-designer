"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MermaidTemplate, templates } from "@/lib/templateData";
import MermaidThumbnail from "../../components/MermaidThumbnail"; // Import the dynamic thumbnail component

export default function TemplateGallery() {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const openTemplate = (id: string) => {
    // Navigate to the editor with the chosen template ID
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
            suppressHydrationWarning
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'grid'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
          >
            Grid
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'list'
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
            className={`group cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:dark:bg-zinc-900 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-600 overflow-hidden flex ${viewMode === 'grid' ? 'flex-col' : 'flex-col md:flex-row'
              }`}
          >
            {/* Thumbnail Area - With subtle canvas dot-grid */}
            <div
              className={`relative flex justify-center items-center bg-zinc-50 dark:bg-zinc-950/50 p-4 ${viewMode === 'grid'
                ? 'border-b border-zinc-200 dark:border-zinc-800 h-56'
                : 'md:w-1/3 md:border-r border-zinc-200 dark:border-zinc-800 border-b md:border-b-0 shrink-0 h-48'
                }`}
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(161, 161, 170, 0.15) 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            >
              {/* Dynamic Live Rendering Thumbnail Component */}
              <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
                <MermaidThumbnail id={tpl.id} path={tpl.path} />
              </div>

              {/* Category Badge overlaying the image */}
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full bg-white/90 dark:bg-black/80 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 backdrop-blur-sm">
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