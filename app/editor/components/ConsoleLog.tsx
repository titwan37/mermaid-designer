"use client";

import * as React from "react";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warn" | "error" | "abort";
  message: string;
}

function getApiUrl(path: string) {
  if (typeof window !== "undefined" && window.location.pathname.includes("/mermaid-designer")) {
    return `/mermaid-designer${path}`;
  }
  return path;
}

export default function ConsoleLog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [status, setStatus] = React.useState<"idle" | "checking" | "ready" | "error">("idle");
  const logEndRef = React.useRef<HTMLDivElement>(null);

  const addLog = React.useCallback((type: LogEntry["type"], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        type,
        message,
      },
    ]);
  }, []);

  // Check backend status on mount
  const checkStatus = React.useCallback(async () => {
    setStatus("checking");
    const apiUrl = getApiUrl("/api/autocomplete");
    addLog("info", `Checking autocomplete backend status at: ${apiUrl}...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: "flowchart LR\n    ", suffix: "" }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const activeEngine = data.provider === "openrouter" ? "OpenRouter Cloud" : "Ollama Local/Remote";
        setStatus("ready");
        addLog(
          "success",
          `Autocomplete backend ready: 200 OK. Active Engine: ${activeEngine}.`
        );
      } else {
        setStatus("error");
        let errorMsg = "";
        let provider = "ollama";
        let isJson = false;
        try {
          const data = await res.json();
          errorMsg = data.error || JSON.stringify(data);
          provider = data.provider || "ollama";
          isJson = true;
        } catch {
          errorMsg = await res.text();
        }

        if (res.status === 404 && !isJson) {
          addLog(
            "error",
            `Backend health check failed: status 404 (Not Found) at ${apiUrl}. The Next.js API route is missing or Nginx subpath routing is incorrect.`
          );
        } else if (provider === "dashscope") {
          addLog(
            "error",
            `Dashscope Cloud Engine error (status ${res.status}): "${errorMsg}". Verify DASHSCOPE_API_KEY and model in .env.`
          );
        } else if (provider === "openrouter") {
          addLog(
            "error",
            `OpenRouter Cloud Engine error (status ${res.status}): "${errorMsg}". Please verify your OPENROUTER_API_KEY in the server's .env file, internet connectivity, or OpenRouter credits.`
          );
        } else {
          addLog(
            "error",
            `Ollama Local Engine error (status ${res.status}): "${errorMsg}". Please check if the Ollama daemon is active.`
          );
        }
      }
    } catch (err: any) {
      setStatus("error");
      if (err.name === "AbortError") {
        addLog(
          "error",
          "Backend health check timed out after 6 seconds. The active engine (local model or cloud provider) took too long to respond."
        );
      } else {
        addLog(
          "error",
          `Backend connection failed: "${err.message}". Next.js server on port 3033 is offline or unreachable from the browser.`
        );
      }
    }
  }, [addLog]);

  React.useEffect(() => {
    const handleLogEvent = (e: Event) => {
      const customEvent = e as CustomEvent<LogEntry>;
      if (customEvent.detail) {
        addLog(customEvent.detail.type, customEvent.detail.message);
        if (customEvent.detail.type === "error") {
          setStatus("error");
        } else if (customEvent.detail.type === "success") {
          setStatus("ready");
        }
      }
    };

    window.addEventListener("autocomplete-log", handleLogEvent);

    const timer = setTimeout(() => {
      checkStatus();
    }, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("autocomplete-log", handleLogEvent);
    };
  }, [addLog, checkStatus]);

  // Scroll to bottom on new log when open
  React.useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  const clearLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogs([]);
  };

  const getStatusColor = () => {
    switch (status) {
      case "checking":
        return "bg-amber-500 animate-pulse";
      case "ready":
        return "bg-emerald-500";
      case "error":
        return "bg-rose-500";
      default:
        return "bg-zinc-400";
    }
  };

  return (
    <div
      className={`fixed bottom-0 right-4 z-50 flex flex-col bg-zinc-950/90 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-zinc-300 rounded-t-lg shadow-2xl transition-all duration-250 ${isOpen ? "w-[500px] h-[340px]" : "w-64 h-9 cursor-pointer hover:bg-zinc-900/90"
        }`}
      onClick={() => !isOpen && setIsOpen(true)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 font-sans text-xs font-semibold select-none">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-zinc-200">🤖 Autocomplete Logs</span>
          {logs.length > 0 && (
            <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded-full text-[10px]">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={checkStatus}
            title="Retry Connection Check"
            className="p-1 hover:text-zinc-100 rounded hover:bg-zinc-800 transition-colors"
          >
            🔄
          </button>
          {isOpen && (
            <button
              onClick={clearLogs}
              title="Clear Logs"
              className="text-[10px] hover:text-zinc-100 px-1 py-0.5 rounded hover:bg-zinc-850"
            >
              Clear
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="text-zinc-400 hover:text-zinc-200 text-sm font-mono focus:outline-none"
          >
            {isOpen ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed space-y-1.5 bg-zinc-950/60 scrollbar-thin scrollbar-thumb-zinc-850 select-text">
          {logs.length === 0 ? (
            <p className="text-zinc-500 italic text-center pt-8">No logs captured yet.</p>
          ) : (
            logs.map((log, i) => {
              let color = "text-zinc-400";
              if (log.type === "success") color = "text-emerald-400 font-medium";
              if (log.type === "warn") color = "text-amber-400";
              if (log.type === "error") color = "text-rose-400 font-semibold";
              if (log.type === "abort") color = "text-zinc-500 italic";

              return (
                <div key={i} className="flex items-start space-x-1 border-b border-zinc-900/50 pb-0.5 last:border-b-0">
                  <span className="text-zinc-600 select-none">[{log.timestamp}]</span>
                  <span className={color}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
