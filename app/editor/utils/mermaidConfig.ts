export type MermaidConfig = {
  layout?: string;
  theme?: string;
  look?: string;
  [key: string]: any;
};

/**
 * Extracts a YAML front‑matter block (--- ... ---) and returns:
 *   - config: the parsed object (or {} if none)
 *   - diagram: the remaining Mermaid definition
 */
export function parseFrontMatter(mmd: string): {
  config: MermaidConfig;
  diagram: string;
} {
  const fmMatch = mmd.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) {
    return { config: {}, diagram: mmd };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const yaml = require("js-yaml");
    const raw = yaml.load(fmMatch[1]) as any;
    const config = raw?.config ?? raw ?? {};
    const diagram = mmd.slice(fmMatch[0].length);
    return { config, diagram };
  } catch {
    return { config: {}, diagram: mmd };
  }
}
