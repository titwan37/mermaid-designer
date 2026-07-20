// lib/sanitizeConsole.ts

/**
 * Safely stringifies or strips non-serializable objects (like DOM nodes and circular structures)
 * to prevent Next.js logger or other dev overlays from crashing with "Converting circular structure to JSON".
 */
export function setupConsoleSanitizer() {
  if (typeof window === "undefined") return;

  const originalError = console.error;
  const originalWarn = console.warn;

  function sanitize(arg: any, seen = new WeakSet()): any {
    if (arg === null || arg === undefined) return arg;
    
    // Primitive types
    if (typeof arg !== "object" && typeof arg !== "function") {
      return arg;
    }

    // Handle DOM Elements which contain circular fiber nodes
    if (arg instanceof HTMLElement || (arg.nodeType === 1 && typeof arg.nodeName === "string")) {
      return `[HTMLElement: ${arg.tagName || arg.nodeName}]`;
    }
    
    // Handle specific object types
    if (arg instanceof Error) {
      return {
        name: arg.name,
        message: arg.message,
        stack: arg.stack,
        // specifically for mermaid parsing errors
        str: (arg as any).str,
        hash: (arg as any).hash ? sanitize((arg as any).hash, seen) : undefined
      };
    }

    // Check for circular structures
    if (seen.has(arg)) {
      return "[Circular]";
    }
    seen.add(arg);

    // Arrays
    if (Array.isArray(arg)) {
      return arg.map((item) => sanitize(item, seen));
    }

    // Plain objects
    const sanitizedObj: any = {};
    for (const key in arg) {
      try {
        sanitizedObj[key] = sanitize(arg[key], seen);
      } catch (e) {
        sanitizedObj[key] = "[Unserializable]";
      }
    }
    return sanitizedObj;
  }

  console.error = (...args: any[]) => {
    try {
      const safeArgs = args.map(arg => sanitize(arg));
      originalError.apply(console, safeArgs);
    } catch (e) {
      originalError.apply(console, ["[Console Sanitizer Failed]", e]);
    }
  };

  console.warn = (...args: any[]) => {
    try {
      const safeArgs = args.map(arg => sanitize(arg));
      originalWarn.apply(console, safeArgs);
    } catch (e) {
      originalWarn.apply(console, ["[Console Sanitizer Failed]", e]);
    }
  };
}
