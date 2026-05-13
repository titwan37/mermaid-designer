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

export default function EditorPage({ initialMMD }: { initialMMD?: string }) {
    const { dark, toggle, mounted } = React.useContext(ThemeContext);
    const [editorValue, setEditorValue] = React.useState<string>(initialMMD ?? DEFAULT_MMD);
    const [code, setCode] = React.useState<string>(initialMMD ?? DEFAULT_MMD);
    const [error, setError] = React.useState<string | null>(null);

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

    const Clock = () => {
        const [time, setTime] = React.useState(new Date());

        React.useEffect(() => {
            const timer = setInterval(() => setTime(new Date()), 1000);
            return () => clearInterval(timer);
        }, []);

        return <>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</>;
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
                <ActionBar code={code} onLoad={loadText} />
            </header>

            <main className={`flex flex-1 overflow-hidden relative ${isResizing ? "cursor-col-resize select-none" : ""}`}>
                {/* Editor */}
                <section
                    style={{ width: `${splitPercent}%` }}
                    className="h-full border-r border-gray-200 dark:border-gray-700"
                >
                    <Editor
                        height="100%"
                        defaultLanguage="markdown"
                        value={editorValue}
                        theme={dark ? "vs-dark" : "light"}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            wordWrap: "on",
                        }}
                    />
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
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 z-40">
                            <pre className="bg-white dark:bg-gray-800 text-red-600 p-4 rounded shadow-lg max-w-full overflow-auto">
                                {error}
                            </pre>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
