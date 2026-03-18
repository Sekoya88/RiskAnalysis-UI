import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Search, Loader2, ChevronDown, Sparkles, Cpu, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandBarProps {
  onAnalyze: (query: string, model: string) => void;
  isRunning: boolean;
  isCentered: boolean;
  initialQuery?: string;
}

const MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", icon: Sparkles, type: "cloud" },
  { id: "qwen3.5", name: "Qwen 3.5 (Local)", icon: Cpu, type: "local" },
  { id: "lfm2", name: "LFM2 (Local)", icon: Cpu, type: "local" },
  { id: "llama3", name: "Llama 3 (Local)", icon: Cpu, type: "local" },
  { id: "mistral", name: "Mistral (Local)", icon: Cpu, type: "local" },
];

export function CommandBar({ onAnalyze, isRunning, isCentered, initialQuery = "" }: CommandBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [model, setModel] = useState("gemini-2.5-flash");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isRunning) {
        onAnalyze(query, model);
      }
    }
  };

  const selectedModel = MODELS.find((m) => m.id === model) || MODELS[0];
  const SelectedIcon = selectedModel.icon;

  return (
    <div
      className={cn(
        "w-full max-w-3xl transition-all duration-700 ease-in-out z-10",
        isCentered
          ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100"
          : "relative mt-8 mx-auto scale-95 origin-top"
      )}
    >
      {isCentered && (
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-3 font-sans">
            Risk Analysis
          </h1>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest max-w-md mx-auto">
            Agentic Geopolitical & Credit Intelligence
          </p>
        </div>
      )}

      <div
        className={cn(
          "relative group bg-white rounded-2xl shadow-sm ring-1 ring-zinc-200 transition-all duration-300",
          !isRunning && "hover:ring-zinc-300 hover:shadow-md focus-within:ring-zinc-800 focus-within:shadow-lg focus-within:hover:ring-zinc-800"
        )}
      >
        <div className="absolute top-4 left-4 text-zinc-400">
          {isRunning ? (
            <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
          ) : (
            <Search className="h-6 w-6 group-focus-within:text-zinc-900 transition-colors" />
          )}
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          placeholder="Ask about geopolitical risks, supply chain exposure, or credit health..."
          className="w-full bg-transparent border-0 resize-none py-5 pl-14 pr-4 min-h-[140px] max-h-[300px] text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:outline-none text-lg leading-relaxed rounded-2xl pb-16"
          rows={4}
          style={{ height: "auto" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 300)}px`;
          }}
        />
        <div className="absolute bottom-3 right-4 flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => !isRunning && setIsModelMenuOpen(!isModelMenuOpen)}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-mono bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 transition-all",
                !isRunning && "hover:bg-zinc-50 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 cursor-pointer",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
            >
              <SelectedIcon className="h-3 w-3" />
              <span>{selectedModel.name}</span>
              <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
            </button>
            
            {isModelMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                <div className="px-2 py-1.5 border-b border-zinc-100 bg-zinc-50">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">Models</span>
                </div>
                <div className="p-1">
                  {MODELS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setModel(m.id);
                          setIsModelMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 text-xs font-mono rounded-md transition-colors text-left",
                          model === m.id 
                            ? "bg-zinc-100 text-zinc-900 font-medium" 
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", model === m.id ? "opacity-100" : "opacity-60")} />
                        <span className="flex-1 truncate">{m.name}</span>
                        {m.type === "cloud" && (
                          <Globe className="h-3 w-3 opacity-30" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="hidden sm:inline-flex items-center gap-1 bg-zinc-100 border border-zinc-200 text-zinc-500 px-2 py-1 rounded text-[10px] font-mono font-medium uppercase tracking-widest">
            <span>⏎</span> Return to send
          </div>
        </div>
      </div>
    </div>
  );
}
