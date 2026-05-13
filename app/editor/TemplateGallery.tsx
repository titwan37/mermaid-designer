"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MermaidTemplate, templates } from "@/lib/templateData";
import MermaidThumbnail from "../../components/MermaidThumbnail";
import { ThemeContext } from "../layout";
import iconMaps from "@/lib/iconmaps.json";

const BASE_PATH = "/mermaid-designer";
const fixPath = (p: string) => p.startsWith("http") ? p : `${BASE_PATH}${p}`;

// Brought back and enhanced your IconMapper!
const IconMapper = ({ type, className }: { type: string; className?: string }) => {
  const baseClass = className || "w-16 h-16 text-zinc-400 dark:text-zinc-500 drop-shadow-sm flex items-center justify-center [&>svg]:w-full [&>svg]:h-full";
  const iconData = iconMaps.find((i: any) => i.id === type.toLowerCase());

  if (iconData) {
    return (
      <div
        className={baseClass}
        dangerouslySetInnerHTML={{ __html: iconData.iconmap }}
      />
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
};

const Clock = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return <>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</>;
};

const ThumbnailWithFallback = ({ id, staticPath, livePath, title }: { id: string; staticPath: string; livePath: string; title: string }) => {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return <MermaidThumbnail id={id} path={livePath} />;
  }

  return (
    <img
      src={staticPath}
      alt={`${title} preview`}
      className="w-full h-full object-contain drop-shadow-md"
      onError={() => setFailed(true)}
    />
  );
};

export default function TemplateGallery() {
  const router = useRouter();
  const { dark, toggle, mounted } = React.useContext(ThemeContext);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const openTemplate = (id: string) => {
    router.push(`/?templateId=${encodeURIComponent(id)}`);
  };

  return (
    <section className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Template Gallery
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Select a starting architecture for your design.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {/* Add a live clock */}
          <div className="px-3 py-1 bg-white dark:bg-zinc-700/50 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center space-x-2">
            <span className="text-emerald-500 animate-pulse">●</span>
            <p className="text-sm font-mono text-zinc-600 dark:text-zinc-300">
              <Clock />
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              suppressHydrationWarning
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Grid
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              List
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

          <button
            className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
            onClick={toggle}
            suppressHydrationWarning
          >
            {!mounted ? "..." : dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-4'}>
        {templates.map((tpl: MermaidTemplate) => (
          <div
            key={tpl.id}
            onClick={() => openTemplate(tpl.id)}
            className={`group cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:dark:bg-zinc-900 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-600 overflow-hidden flex ${viewMode === 'grid' ? 'flex-col' : 'flex-col md:flex-row'}`}
          >

            {/* === THE 3D FLIP CONTAINER === */}
            <div
              className={`relative [perspective:1000px] shrink-0 ${viewMode === 'grid' ? 'border-b border-zinc-200 dark:border-zinc-800 h-56' : 'md:w-1/3 md:border-r border-zinc-200 dark:border-zinc-800 border-b md:border-b-0 h-48'}`}
            >
              {/* The inner card that rotates */}
              <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                {/* FRONT FACE: Cached Static SVG/PNG with Live Fallback */}
                <div
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-center p-4"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(161, 161, 170, 0.15) 1px, transparent 0)', backgroundSize: '16px 16px' }}
                >
                  <ThumbnailWithFallback
                    id={tpl.id}
                    staticPath={fixPath(tpl.thumbnailStatic)}
                    livePath={fixPath(tpl.path)}
                    title={tpl.title}
                  />

                  {/* Category Badge overlaying the image */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/80 border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm shadow-sm">
                      <IconMapper
                        type={tpl.category}
                        className="w-3 h-3 text-zinc-500 dark:text-zinc-400 [&>svg]:w-full [&>svg]:h-full"
                      />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                        {tpl.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK FACE: Minimalist Icon + Dot Grid */}
                <div
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center bg-white dark:bg-zinc-900"
                >
                  <IconMapper type={tpl.category} />
                </div>

              </div>
            </div>
            {/* ============================== */}

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

              <div className="flex flex-wrap gap-2 mt-auto">


                {tpl.useCases.map((caseTag) => (
                  <span key={caseTag} className="px-2.5 py-1 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
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