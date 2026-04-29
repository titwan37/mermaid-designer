// lib/templateData.ts
import templateJson from "./templates.json";

/** Strict contract for every template that the gallery can display */
export interface MermaidTemplate {
  /** Unique identifier – used in URLs */
  id: string;
  /** Human‑readable title shown on the card */
  title: string;
  /** Category for filtering (e.g. "Architecture", "Strategy", "Flowchart") */
  category: string;
  /** Path (relative to /public) of a small SVG thumbnail */
  thumbnailSvg: string;
  /** Short description displayed in the gallery */
  description: string;
  /** Use‑case tags that appear as pill badges */
  useCases: string[];
  /** The actual Mermaid source that should be loaded in the editor */
  mermaidCode: string;
}

/** 
 * Export templates directly from the JSON file.
 * Typed as MermaidTemplate[] for type safety throughout the app.
 */
export const templates = templateJson as MermaidTemplate[];
