/* c:\Dev\mermaid-designer\app\editor\EditorPage.tsx */
"use client";

import * as React from "react";
import Editor from "@monaco-editor/react";
import MermaidViewer from "./MermaidViewer";
import ActionBar from "./components/ActionBar";
import TemplateSelect from "./components/TemplateSelect";
import { ThemeContext } from "../layout";
import debounce from "lodash.debounce";
import ErrorBoundary from "./utils/errorBoundary";
import Link from "next/link";
import { registerMermaidAutocomplete, registerInlineAICompletions } from "./utils/monacoProviders";
import ConsoleLog from "./components/ConsoleLog";

const DEFAULT_MMD = `---
config:
  layout: dagre
  theme: neutral
  look: handDrawn
---
flowchart LR
    subgraph Foundation ["🔒 Governance & Foundation"]
        G(["Consent & Metadata"])
        F[("Immutable Logs")]
    end
    G -. Policies .-> F
    classDef gov fill:#f1f8e9,stroke:#33691e,stroke-width:2px,color:#1b5e20
    G:::gov
    F:::gov`;

async function getMermaidLiveUrl(code: string): Promise<string> {
  try {
    const state = {
      code,
      mermaid: JSON.stringify({ theme: "default" }, null, 2),
      autoSync: true,
      updateDiagram: true
    };
    const jsonStr = JSON.stringify(state);
    
    if (typeof window !== "undefined" && "CompressionStream" in window) {
      const stream = new Blob([jsonStr]).stream();
      const compressedStream = stream.pipeThrough(new (window as any).CompressionStream("deflate-raw"));
      const compressedBlob = await new Response(compressedStream).blob();
      const buffer = await compressedBlob.arrayBuffer();
      
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
        
      return `https://mermaid.live/edit#pako:${base64}`;
    }
  } catch (err) {
    console.error("Failed to compress for mermaid.live:", err);
  }
  return `https://mermaid.live/edit`;
}

export default function EditorPage({ initialMMD }: { initialMMD?: string }) {
  const { dark, toggle, mounted } = React.useContext(ThemeContext);
  const [editorValue, setEditorValue] = React.useState<string>(initialMMD ?? DEFAULT_MMD);
  const [code, setCode] = React.useState<string>(initialMMD ?? DEFAULT_MMD);
  const [error, setError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [filename, setFilename] = React.useState<string>("diagram");

  const providersRef = React.useRef<{ dispose: () => void }[]>([]);

  const handleEditorMount = React.useCallback((editor: any, monaco: any) => {
    // Clean up any existing registered providers first
    providersRef.current.forEach((p: any) => p.dispose());
    providersRef.current = [];

    // Register new providers
    const completionProvider = registerMermaidAutocomplete(monaco);
    const inlineCompletionProvider = registerInlineAICompletions(monaco);

    providersRef.current.push(completionProvider, inlineCompletionProvider);
  }, []);

  React.useEffect(() => {
    return () => {
      providersRef.current.forEach((p: any) => p.dispose());
      providersRef.current = [];
    };
  }, []);

  const debouncedSetCode = React.useCallback(
    debounce((value: string) => setCode(value), 500),
    []
  );

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
      debouncedSetCode(value);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setFilename(baseName);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          loadText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const Clock = () => {
    const [time, setTime] = React.useState(new Date());
    React.useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);
    return (
      <>
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })}
      </>
    );
  };

  const loadText = (text: string) => {
    setEditorValue(text);
    setCode(text);
  };

  const [splitPercent, setSplitPercent] = React.useState(30);
  const [isResizing, setIsResizing] = React.useState(false);

  const startResizing = React.useCallback(() => setIsResizing(true), []);
  const stopResizing = React.useCallback(() => setIsResizing(false), []);
  const resize = React.useCallback(
    (e: any) => {
      if (isResizing) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 15 && newWidth < 85) {
          setSplitPercent(newWidth);
        }
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="flex flex-col h-screen">
      {/* ── Action bar ── */}
      <header className="flex items-center justify-between p-2 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="px-3 py-1 text-sm font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors flex items-center"
          >
            ← Gallery
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 text-sm font-medium bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={toggle}
            suppressHydrationWarning
          >
            {!mounted ? "..." : dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <TemplateSelect onSelect={loadText} />
        </div>

        <div className="px-3 py-1 bg-white dark:bg-zinc-700/50 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center space-x-2">
          <span className="text-emerald-500 animate-pulse">●</span>
          <p className="text-sm font-mono text-zinc-600 dark:text-zinc-300">
            <Clock />
          </p>
        </div>
        <ActionBar code={code} onLoad={loadText} filename={filename} setFilename={setFilename} />
      </header>

      <main className={`flex flex-1 overflow-hidden relative ${isResizing ? "cursor-col-resize select-none" : ""}`}>
        {/* Editor */}
        <section
          style={{ width: `${splitPercent}%` }}
          className="h-full border-r border-gray-200 dark:border-gray-700 relative"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={editorValue}
            theme={dark ? "vs-dark" : "light"}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              wordWrap: "on",
              inlineSuggest: {
                enabled: true,
              },
            }}
          />

          {dragActive && (
            <div
              className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-dashed border-emerald-500 backdrop-blur-[2px] flex flex-col items-center justify-center z-50 transition-all duration-300"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-full">
                  <svg className="w-8 h-8 text-emerald-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Drop your Mermaid (.mmd) file
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Release to import directly into the editor
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Resizer Handle */}
        <div
          className="w-1.5 h-full bg-gray-200 dark:bg-gray-700 hover:bg-primary/50 cursor-col-resize transition-colors z-30"
          onMouseDown={startResizing}
        />

        {/* Mermaid preview */}
        <section
          style={{ width: `${100 - splitPercent}%` }}
          className="h-full relative overflow-hidden"
        >
          <ErrorBoundary>
            <MermaidViewer mmd={code} setError={setError} />
          </ErrorBoundary>
          {error && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-6 z-40 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 max-w-lg w-full flex flex-col space-y-4">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <span className="text-xl">⚠️</span>
                  <h3 className="font-bold text-base font-sans">Mermaid Syntax Error</h3>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/50 rounded-lg text-xs text-red-700 dark:text-red-300 font-mono overflow-auto max-h-40 leading-relaxed whitespace-pre-wrap">
                  {error}
                </div>
                
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
                  A syntax error occurred during rendering. You can check the code structure above or debug it with full syntax visualization in the official Mermaid Live Editor.
                </p>

                <div className="flex space-x-3 pt-2 font-sans">
                  <button
                    onClick={async () => {
                      const url = await getMermaidLiveUrl(code);
                      window.open(url, "_blank");
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-center"
                  >
                    🚀 Open & Debug on Mermaid.live
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <ConsoleLog />
    </div>
  );
}