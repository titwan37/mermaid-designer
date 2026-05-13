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
  /** Key for the built-in IconMapper */
  thumbnailSvg: string;
  /** Path to static thumbnail */
  thumbnailStatic: string;
  /** Absolute path to the source .mmd file */
  path: string;
  /** Short description displayed in the gallery */
  description: string;
  /** Use‑case tags that appear as pill badges */
  useCases: string[];
}

/** 
 * Export templates directly from the JSON file.
 * Typed as MermaidTemplate[] for type safety throughout the app.
 */
export const templates = templateJson as MermaidTemplate[];
