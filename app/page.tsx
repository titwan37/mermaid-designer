// app/page.tsx
"use client";

import TemplateGallery from "./editor/TemplateGallery";
import EditorPage from "./editor/EditorPage";
import { templates } from "@/lib/templateData";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("templateId");

  const selected = templates.find((t) => t.id === templateId);

  // If a template is selected, render the editor pre‑loaded with its code
  if (selected) {
    return <EditorPage initialMMD={selected.mermaidCode} />;
  }

  // Otherwise show the polished gallery
  return <TemplateGallery />;
}
