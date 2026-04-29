// c:\Dev\mermaid-designer\app\editor\MermaidViewer.tsx
"use client";

import * as React from "react";
import mermaid from "mermaid";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { parseFrontMatter } from "./utils/mermaidConfig";
import { ThemeContext } from "../layout";
import { ZoomIn, ZoomOut, Maximize, Target, Expand } from "lucide-react";

type Props = {
  mmd: string;
  setError: (msg: string | null) => void;
};

export default function MermaidViewer({ mmd, setError }: Props) {
  const { dark } = React.useContext(ThemeContext);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const transformRef = React.useRef<any>(null);
  const [svg, setSvg] = React.useState<string>("");

  React.useEffect(() => {
    setError(null);
    const { config, diagram } = parseFrontMatter(mmd);

    const { theme, ...restConfig } = config;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: (theme as any) || (dark ? "dark" : "default"),
      ...restConfig,
    } as any);

    const renderDiagram = async () => {
      try {
        if (containerRef.current) containerRef.current.innerHTML = "";
        const renderId = `mermaid-svg-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(renderId, diagram);
        setSvg(renderedSvg);
      } catch (e: any) {
        let errorMessage = "Mermaid render error";
        if (typeof e === "string") errorMessage = e;
        else if (e?.message) errorMessage = e.message;
        else if (e?.str) errorMessage = e.str;
        // Inside your renderDiagram catch block:
        if (e && errorMessage.includes("Lexical error")) {
          setError("Syntax Hint: Check for unexpected characters or spaces before symbols like '<' or '('");
        } else {
          setError(errorMessage);
        }
        setSvg("");
      } finally {
        // Automatically fit the view once the SVG is injected
        setTimeout(() => {
          handleFitView();
        }, 100);
      }
    };

    renderDiagram();
  }, [mmd, setError, dark]);

  // Modified handleFitView that centers and maximizes the diagram
  const handleFitView = () => {
    const svgElement = containerRef.current?.querySelector("svg");
    if (svgElement && transformRef.current) {
      const { zoomToElement } = transformRef.current;
      // zoomToElement(element, scale, animationTime, animationType)
      // scale: 0 fits the element to the wrapper
      zoomToElement(svgElement, 0);
    }
  };

  // Handle native ESC key, container resize, or external fullscreen changes
  React.useEffect(() => {
    const handleTrigger = () => {
      // Small delay to allow the browser to complete layout/animation transitions
      setTimeout(() => {
        handleFitView();
      }, 300);
    };

    // Listen for fullscreen changes
    document.addEventListener("fullscreenchange", handleTrigger);

    // Listen for container resize (e.g. split-pane movement)
    const resizeObserver = new ResizeObserver(() => {
      handleTrigger();
    });

    if (viewerRef.current) {
      resizeObserver.observe(viewerRef.current);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleTrigger);
      resizeObserver.disconnect();
    };
  }, []);

  const toggleFullscreen = async () => {
    const el = viewerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => alert("Fullscreen blocked"));
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div ref={viewerRef} className="h-full w-full relative bg-white dark:bg-gray-900 overflow-hidden">
      <TransformWrapper
        ref={transformRef}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        centerOnInit={true}
        minScale={0.01}
        maxScale={10}
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* ── Toolbar ── */}
            <div className="absolute top-2 right-2 z-10 flex space-x-1 bg-white/90 dark:bg-gray-800/90 p-1 rounded-md shadow-md border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <button
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 transition-colors"
                onClick={() => zoomIn()}
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 transition-colors"
                onClick={() => zoomOut()}
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 transition-colors"
                onClick={() => resetTransform()}
                title="Reset to 100%"
              >
                <Target size={18} />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 transition-colors"
                onClick={handleFitView}
                title="Maximize & Center"
              >
                <Maximize size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
              <button
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 transition-colors"
                onClick={toggleFullscreen}
                title="Fullscreen"
              >
                <Expand size={18} />
              </button>
            </div>

            {/* SVG container */}
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="w-full h-full">
              <div
                ref={containerRef}
                className="h-full w-full flex items-center justify-center p-8 bg-white dark:bg-gray-900 mermaid-container"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </TransformComponent>

            <style jsx global>{`
              .mermaid-container svg {
                display: block;
                margin: auto;
                /* Remove constraints so the zoom engine can scale freely */
                max-width: none !important;
                max-height: none !important;
              }
            `}</style>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
