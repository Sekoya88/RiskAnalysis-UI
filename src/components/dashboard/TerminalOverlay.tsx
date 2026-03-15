import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface TerminalOverlayProps {
  logs: string[];
  isVisible: boolean;
}

export function TerminalOverlay({ logs, isVisible }: TerminalOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl ring-1 ring-zinc-200 overflow-hidden flex flex-col h-[50vh] max-h-[500px] animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Sleek Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/80 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center ring-1 ring-zinc-200">
              <Terminal className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
                Agentic Analysis
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Running sub-agents & tools...
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-300" />
            <div className="w-2 h-2 rounded-full bg-zinc-300" />
            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
          </div>
        </div>

        {/* Logs Body */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-[12px] leading-relaxed bg-white" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="text-zinc-400 flex items-center gap-2">
              <span className="animate-pulse">Initializing agents...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, i) => {
                const isError = log.includes("[ERROR]");
                const isDone = log.includes("finished");
                const isStatus = log.includes("Starting analysis") || log.includes("Analysis complete");
                
                return (
                  <div
                    key={i}
                    className={`break-words flex flex-col gap-1 ${
                      isError
                        ? "text-red-600 font-medium"
                        : isDone || isStatus
                        ? "text-zinc-900 font-bold"
                        : "text-zinc-600"
                    } animate-in slide-in-from-bottom-2 fade-in duration-300`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`select-none mt-0.5 ${isDone || isStatus ? "text-blue-500" : "text-zinc-300"}`}>
                        {isDone || isStatus ? "✓" : "›"}
                      </span>
                      <span>{log}</span>
                    </div>
                  </div>
                );
              })}
              <div className="h-4" /> {/* Spacer */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
