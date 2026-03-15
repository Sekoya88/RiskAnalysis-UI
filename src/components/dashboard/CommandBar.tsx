import { useState, KeyboardEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandBarProps {
  onAnalyze: (query: string, model: string) => void;
  isRunning: boolean;
  isCentered: boolean;
  initialQuery?: string;
}

export function CommandBar({ onAnalyze, isRunning, isCentered, initialQuery = "" }: CommandBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [model, setModel] = useState("qwen3.5");

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isRunning) {
        onAnalyze(query, model);
      }
    }
  };

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
          className="w-full bg-transparent border-0 resize-none py-4 pl-14 pr-16 min-h-[64px] max-h-[200px] text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:outline-none text-lg leading-relaxed rounded-2xl"
          rows={1}
          style={{ height: "auto" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
          }}
        />
        <div className="absolute bottom-3 right-4 flex items-center gap-3">
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isRunning}
            className="text-xs font-mono bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer"
          >
            <option value="qwen3.5">Qwen 3.5 (Local)</option>
            <option value="lfm2">LFM2 (Local)</option>
            <option value="llama3">Llama 3 (Local)</option>
            <option value="mistral">Mistral (Local)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>
          <div className="hidden sm:inline-flex items-center gap-1 bg-zinc-100 border border-zinc-200 text-zinc-500 px-2 py-1 rounded text-[10px] font-mono font-medium uppercase tracking-widest">
            <span>⏎</span> Return to send
          </div>
        </div>
      </div>
    </div>
  );
}
