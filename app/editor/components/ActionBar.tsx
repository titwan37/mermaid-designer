"use client";

import * as React from "react";
import html2canvas from "html2canvas";

type Props = {
  code: string;
  onLoad?: (text: string) => void;
};

export default function ActionBar({ code, onLoad }: Props) {
  //const previewRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (onLoad) onLoad(text);
    };
    reader.readAsText(file);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMMD = () => {
    downloadBlob(new Blob([code], { type: "text/plain" }), "diagram.mmd");
  };

  const downloadSVG = () => {
    const svgEl = document.querySelector(".mermaid-container svg");
    if (!svgEl) {
      console.warn("SVG element not found inside .mermaid-container");
      return;
    }
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    downloadBlob(new Blob([svgString], { type: "image/svg+xml" }), "diagram.svg");
  };

  const downloadPNG = async () => {
    // Target the container instead of the SVG directly to avoid html2canvas cloning bugs
    const container = document.querySelector(".mermaid-container") as HTMLElement;
    if (!container) {
      console.warn("Mermaid container not found");
      return;
    }

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: "white",
        scale: 1, 
        logging: false,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = "diagram.png";
      downloadLink.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Diagram code copied to clipboard!");
    } catch {
      alert("Failed to copy – your browser may block clipboard access.");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".mmd,.txt,.mermaid"
        onChange={handleFileUpload}
      />
      <button
        className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:opacity-90"
        onClick={() => fileInputRef.current?.click()}
        suppressHydrationWarning
      >
        📂 Load
      </button>

      <button
        className="px-2 py-1 text-sm bg-primary text-slate-900 dark:text-white rounded hover:opacity-90"
        onClick={downloadMMD}
        suppressHydrationWarning
      >
        ⬇️ .mmd
      </button>
      <button
        className="px-2 py-1 text-sm bg-primary text-slate-900 dark:text-white rounded hover:opacity-90"
        onClick={downloadSVG}
        suppressHydrationWarning
      >
        📥 SVG
      </button>
      <button
        className="px-2 py-1 text-sm bg-primary text-slate-900 dark:text-white rounded hover:opacity-90"
        onClick={downloadPNG}
        suppressHydrationWarning
      >
        📥 PNG
      </button>
      <button
        className="px-2 py-1 text-sm bg-accent text-slate-900 dark:text-white rounded hover:opacity-90"
        onClick={copyToClipboard}
        suppressHydrationWarning
      >
        📋 Copy
      </button>
    </div>
  );
}
