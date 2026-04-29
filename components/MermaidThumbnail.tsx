"use client";

import React, { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";

interface MermaidThumbnailProps {
    id: string;
    path: string;
}

export default function MermaidThumbnail({ id, path }: MermaidThumbnailProps) {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasError, setHasError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Lazy Load Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // 2. Fetch & Render
    useEffect(() => {
        if (!isVisible) return;

        const loadAndRender = async () => {
            const cacheKey = `mermaid-thumb-cache-${id}`;
            const cachedSvg = localStorage.getItem(cacheKey);

            if (cachedSvg) {
                setSvgContent(cachedSvg);
                return;
            }

            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

                const mmdText = await response.text();

                // 🛡️ GUARD: Did Next.js return a 404 HTML page instead of the .mmd file?
                if (mmdText.trim().startsWith("<") && mmdText.toLowerCase().includes("html")) {
                    throw new Error(`File not found. Next.js returned an HTML page for path: ${path}`);
                }

                const safeId = id.replace(/[^a-zA-Z0-9]/g, "-");
                const renderId = `thumb-${safeId}-${Date.now()}`;

                // Clean the code: remove frontmatter, replace non-breaking spaces, and trim
                const cleanCode = mmdText
                    .replace(/^---[\s\S]*?---(\r?\n)*/, "")
                    .replace(/\u00A0/g, " ")
                    .trim();

                const { svg } = await mermaid.render(renderId, cleanCode);

                // 📐 CALIBRATION: Remove fixed dimensions and use preserveAspectRatio for proper scaling
                const scalableSvg = svg
                    .replace(/max-width: [\d.]+px;/g, 'max-width: 100%;') // Allow it to be smaller than 100%
                    .replace(/max-height: [\d.]+px;/g, 'max-height: 100%;') // Allow it to be smaller than 100%
                    .replace(/width="[\d.]+"/g, '')                       // Remove fixed width
                    .replace(/height="[\d.]+"/g, '')                      // Remove fixed height
                    .replace(/<svg /, '<svg style="max-width: 100%; max-height: 100%; height: auto;" preserveAspectRatio="xMidYMid meet" ');

                setSvgContent(scalableSvg);
                localStorage.setItem(cacheKey, scalableSvg);

            } catch (error: any) {
                // 🛡️ HYPER-SAFE FIX: Ensure we only ever log/state a flat string.
                // Some Mermaid errors are non-serializable objects that crash the Next.js dev overlay.
                // let errorMessage = "Unknown rendering error";
                // try {
                //   errorMessage = typeof error?.message === 'string' ? error.message : String(error);
                // } catch (sfe) {
                //   errorMessage = "An error occurred that could not be stringified.";
                // }

                // console.error(`[Mermaid Gallery Error - ${id}]:`, errorMessage);
                // setHasError(true);

                // 🛡️ HYPER-SAFE FIX: Ensure we only ever log a flat string.
                // Raw Mermaid errors can be circular objects that crash the Next.js dev overlay.
                let errorMessage = "Unknown rendering error";
                try {
                    errorMessage = typeof error?.message === 'string' ? error.message : String(error);
                } catch (sfe) {
                    errorMessage = "An error occurred that could not be stringified.";
                }

                console.warn(`[Mermaid Gallery Warning - ${id}]: ` + errorMessage.slice(0, 200));
                setHasError(true);
            }
        };

        loadAndRender();
    }, [isVisible, id, path]);

    // Render Error State
    if (hasError) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-lg text-zinc-400">
                <span className="text-xs font-mono text-center px-2">Preview unavailable<br />(Check File Path)</span>
            </div>
        );
    }

    // Render SVG or Skeleton
    return (
        <div
            ref={containerRef}
            className="w-full h-full flex justify-center items-center overflow-hidden"
        >
            {svgContent ? (
                <div
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    className="w-full h-full flex items-center justify-center pointer-events-none 
                        [&_text]:!fill-zinc-800 dark:[&_text]:!fill-zinc-100 
                        [&_.label]:!fill-zinc-800 dark:[&_.label]:!fill-zinc-100 
                        [&_rect]:!stroke-zinc-300 dark:[&_rect]:!stroke-zinc-700 
                        [&_path]:!stroke-zinc-300 dark:[&_path]:!stroke-zinc-700 
                        [&_line]:!stroke-zinc-300 dark:[&_line]:!stroke-zinc-700
                        [&_text]:!text-[10px] [&_.label]:!text-[10px] [&>svg]:scale-[0.7] [&>svg]:transform-gpu"
                />
            ) : (
                <div className="animate-pulse w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                    <span className="text-zinc-400 text-xs font-mono">Rendering...</span>
                </div>
            )}
        </div>
    );
}