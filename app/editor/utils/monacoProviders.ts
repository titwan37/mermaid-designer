import { Monaco } from "@monaco-editor/react";

function logAutocomplete(type: "info" | "success" | "warn" | "error" | "abort", message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("autocomplete-log", {
        detail: { type, message },
      })
    );
  }
}

function getApiUrl(path: string) {
  if (typeof window !== "undefined" && window.location.pathname.includes("/mermaid-designer")) {
    return `/mermaid-designer${path}`;
  }
  return path;
}

export function registerMermaidAutocomplete(monaco: Monaco) {
  logAutocomplete("info", "Engine 1: Mermaid Syntax Autocomplete initialized successfully.");

  return monaco.languages.registerCompletionItemProvider("markdown", {
    provideCompletionItems: (model: any, position: any) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        {
          label: "flowchart LR",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "flowchart LR\n    ",
          documentation: "Left-to-Right Flowchart",
          range,
        },
        {
          label: "flowchart TD",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "flowchart TD\n    ",
          documentation: "Top-Down Flowchart",
          range,
        },
        {
          label: "sequenceDiagram",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "sequenceDiagram\n    ",
          documentation: "Sequence Diagram",
          range,
        },
        {
          label: "subgraph",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "subgraph ${1:title}\n    $0\nend",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Mermaid Subgraph",
          range,
        },
        {
          label: "classDef",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "classDef ${1:className} fill:${2:#f9f},stroke:${3:#333},stroke-width:${4:2px};",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Mermaid class definition style",
          range,
        },
        {
          label: "arrow",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "--> ",
          documentation: "Directed arrow link",
          range,
        },
        {
          label: "dotted_arrow",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "-.-> ",
          documentation: "Dotted directed arrow link",
          range,
        },
        {
          label: "thick_arrow",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "==> ",
          documentation: "Thick directed arrow link",
          range,
        },
      ];

      return { suggestions };
    },
  });
}

export function registerInlineAICompletions(monaco: Monaco) {
  let abortController: AbortController | null = null;
  let debounceTimeout: any = null;
  let isQueryInFlight = false;

  logAutocomplete("info", "Engine 2: AI Inline Completion Provider initialized successfully.");

  return (monaco.languages as any).registerInlineCompletionsProvider("markdown", {
    provideInlineCompletions: async (model: any, position: any, context: any, token: any) => {
      // 1. Cancel previous pending completions immediately
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      if (abortController) {
        abortController.abort();
        if (isQueryInFlight) {
          logAutocomplete("abort", "User resumed typing. Active suggestion query aborted.");
          isQueryInFlight = false;
        }
      }

      // 2. Setup AbortController for the current fetch
      abortController = new AbortController();
      const signal = abortController.signal;

      // Handle editor-provided cancellation token
      token.onCancellationRequested(() => {
        abortController?.abort();
        if (isQueryInFlight) {
          logAutocomplete("abort", "Monaco editor cancelled active query.");
          isQueryInFlight = false;
        }
      });

      // 3. Debounce to prevent querying AI on every keystroke
      return new Promise((resolve) => {
        debounceTimeout = setTimeout(async () => {
          try {
            const textBefore = model.getValueInRange({
              startLineNumber: Math.max(1, position.lineNumber - 20),
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            });

            const textAfter = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: Math.min(model.getLineCount(), position.lineNumber + 10),
              endColumn: 1,
            });

            // Do not query for tiny edits
            if (textBefore.trim().length < 5) {
              return resolve({ items: [] });
            }

            const apiUrl = getApiUrl("/api/autocomplete");
            logAutocomplete("info", "User paused typing for 3000ms. Sending FIM prompt to Next.js API...");
            isQueryInFlight = true;

            const response = await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prefix: textBefore, suffix: textAfter }),
              signal,
            });

            isQueryInFlight = false;

            if (!response.ok) {
              let errData: any = {};
              let isJson = false;
              try {
                errData = await response.json();
                isJson = true;
              } catch {
                errData = { error: await response.text() };
              }

              let serverError = errData.error || JSON.stringify(errData);

              if (response.status === 404 && !isJson) {
                throw new Error(`status 404 (Not Found). Nginx subpath routing issue at "${apiUrl}".`);
              } else {
                throw new Error(`status ${response.status}: ${serverError}`);
              }
            }

            const data = await response.json();

            if (data.suggestion) {
              const displaySug = data.suggestion.replace(/\n/g, "\\n");
              logAutocomplete("success", `AI suggestion loaded successfully: "${displaySug}"`);
              return resolve({
                items: [
                  {
                    insertText: data.suggestion,
                    range: new monaco.Range(
                      position.lineNumber,
                      position.column,
                      position.lineNumber,
                      position.column
                    ),
                  },
                ],
              });
            } else {
              logAutocomplete("info", "AI autocomplete query completed: no suggestion returned from LLM.");
            }
          } catch (err: any) {
            isQueryInFlight = false;
            if (err.name === "AbortError" || signal.aborted) {
              logAutocomplete("abort", "API generation request aborted successfully. CPU thread freed.");
            } else {
              logAutocomplete("error", `AI completion failed: ${err.message}`);
              console.error("AI autocomplete fetch error:", err);
            }
          }
          resolve({ items: [] });
        }, 3000); // 3000ms (3 seconds) idle delay before invoking API
      });
    },
    freeInlineCompletions: () => { },
  });
}
