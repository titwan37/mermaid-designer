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
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Lazy Load: Only trigger when the card scrolls into view
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

  // 2. Fetch, Render, and Cache
  useEffect(() => {
    if (!isVisible) return;

    const loadAndRender = async () => {
      const cacheKey = `mermaid-thumb-cache-${id}`;
      const cachedSvg = localStorage.getItem(cacheKey);

      // Return cached SVG immediately if it exists
      if (cachedSvg) {
        setSvgContent(cachedSvg);
        return;
      }

      try {
        // Fetch the raw .mmd text from the public folder
        const response = await fetch(path);
        if (!response.ok) throw new Error("Failed to fetch template");
        const mmdText = await response.text();

        // Render the SVG using Mermaid
        const renderId = `thumb-${id}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, mmdText);

        // Optional: Clean up hardcoded widths/heights so it scales perfectly in the thumbnail box
        const scalableSvg = svg
            .replace(/max-width: [\d.]+px;/g, '')
            .replace(/width="[\d.]+"/g, 'width="100%"')
            .replace(/height="[\d.]+"/g, 'height="100%"');

        setSvgContent(scalableSvg);
        
        // Cache the result for future visits
        localStorage.setItem(cacheKey, scalableSvg);
      } catch (error) {
        console.error(`Error rendering thumbnail for ${id}:`, error);
        // Fallback or error state could be handled here
      }
    };

    loadAndRender();
  }, [isVisible, id, path]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex justify-center items-center overflow-hidden"
    >
      {svgContent ? (
        <div 
          dangerouslySetInnerHTML={{ __html: svgContent }} 
          // Tailwind overrides to ensure the SVG behaves like a responsive image
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain pointer-events-none"
        />
      ) : (
        // Skeleton loader while fetching/rendering
        <div className="animate-pulse w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
            <span className="text-zinc-400 text-xs font-mono">Rendering...</span>
        </div>
      )}
    </div>
  );
}