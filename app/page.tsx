// app/page.tsx
"use client";

import * as React from "react";
import TemplateGallery from "./editor/TemplateGallery";
import EditorPage from "./editor/EditorPage";
import { templates } from "@/lib/templateData";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("templateId");
  const [preloadedCode, setPreloadedCode] = React.useState<string | null>(null);
  const [currentId, setCurrentId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const selected = templates.find((t) => t.id === templateId);

  React.useEffect(() => {
    // If the template ID changed, reset the code so we fetch the new one
    if (selected && selected.id !== currentId) {
      setPreloadedCode(null);
      setCurrentId(selected.id);
    }
  }, [selected, currentId]);

  const BASE_PATH = "/mermaid-designer";
  const fixPath = (p: string) => p.startsWith("http") ? p : `${BASE_PATH}${p}`;

  React.useEffect(() => {
    if (selected && !preloadedCode && !loading) {
      setLoading(true);
      fetch(fixPath(selected.path))
        .then((res) => res.text())
        .then((text) => {
          setPreloadedCode(text);
          setLoading(false);
        })
        .catch((err: any) => {
          const safeError = err?.message || String(err);
          console.error("Failed to load template:", safeError);
          setLoading(false);
        });
    }
  }, [selected, preloadedCode, loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (selected && preloadedCode) {
    return <EditorPage initialMMD={preloadedCode} />;
  }

  return <TemplateGallery />;
}

export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </React.Suspense>
  );
}
