import { useState, KeyboardEvent, useRef, useEffect, useMemo } from "react";
import { Search, Loader2, ChevronDown, Sparkles, Cpu, Globe, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricsLabelsPayload } from "@/types";

interface CommandBarProps {
  onAnalyze: (query: string, model: string, labels?: MetricsLabelsPayload) => void;
  isRunning: boolean;
  isCentered: boolean;
  initialQuery?: string;
}

function linesToList(s: string): string[] {
  return s
    .split(/\n/)
    .map((x) => x.trim())
    .filter(Boolean);
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
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [metricsUrls, setMetricsUrls] = useState("");
  const [metricsDocKeys, setMetricsDocKeys] = useState("");
  const [metricsFacts, setMetricsFacts] = useState("");
  const [metricsTools, setMetricsTools] = useState("");
  const [taskDoneChoice, setTaskDoneChoice] = useState<"omit" | "true" | "false">("omit");
  const menuRef = useRef<HTMLDivElement>(null);

  const labelsPayload = useMemo((): MetricsLabelsPayload | undefined => {
    const urls = linesToList(metricsUrls);
    const docs = linesToList(metricsDocKeys);
    const facts = linesToList(metricsFacts);
    const tools = linesToList(metricsTools);
    const task =
      taskDoneChoice === "omit" ? undefined : taskDoneChoice === "true";
    if (
      urls.length === 0 &&
      docs.length === 0 &&
      facts.length === 0 &&
      tools.length === 0 &&
      task === undefined
    ) {
      return undefined;
    }
    return {
      ...(urls.length ? { metrics_relevant_urls: urls } : {}),
      ...(docs.length ? { metrics_relevant_doc_keys: docs } : {}),
      ...(facts.length ? { metrics_reference_facts: facts } : {}),
      ...(tools.length ? { metrics_expected_tools: tools } : {}),
      ...(task !== undefined ? { metrics_task_completed: task } : {}),
    };
  }, [metricsUrls, metricsDocKeys, metricsFacts, metricsTools, taskDoneChoice]);

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
        onAnalyze(query, model, labelsPayload);
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

      <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/90 overflow-hidden">
        <button
          type="button"
          onClick={() => setMetricsOpen(!metricsOpen)}
          disabled={isRunning}
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2.5 text-left text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-600 hover:bg-zinc-100/80 transition-colors",
            isRunning && "opacity-50 cursor-not-allowed"
          )}
        >
          <ListChecks className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">Étiquettes métriques (ground truth, optionnel)</span>
          <ChevronDown
            className={cn("h-3.5 w-3.5 shrink-0 transition-transform", metricsOpen && "rotate-180")}
          />
        </button>
        {metricsOpen && (
          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-zinc-200/80 bg-white">
            <p className="text-[11px] text-zinc-500 leading-relaxed pt-3">
              Une entrée par ligne. Laisser vide = pas de P/R/F1 ni faithfulness côté métriques.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                URLs news pertinentes
                <textarea
                  value={metricsUrls}
                  onChange={(e) => setMetricsUrls(e.target.value)}
                  disabled={isRunning}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-mono text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  placeholder="https://…"
                />
              </label>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Clés RAG pertinentes
                <textarea
                  value={metricsDocKeys}
                  onChange={(e) => setMetricsDocKeys(e.target.value)}
                  disabled={isRunning}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-mono text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  placeholder="source:…"
                />
              </label>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 sm:col-span-2">
                Faits / phrases attendus dans le rapport (faithfulness)
                <textarea
                  value={metricsFacts}
                  onChange={(e) => setMetricsFacts(e.target.value)}
                  disabled={isRunning}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-mono text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </label>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 sm:col-span-2">
                Ordre attendu des outils (préfixe)
                <textarea
                  value={metricsTools}
                  onChange={(e) => setMetricsTools(e.target.value)}
                  disabled={isRunning}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-mono text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  placeholder={"search_news\nretrieve_rag"}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-zinc-600">
              <span className="font-mono uppercase tracking-wider text-zinc-500 shrink-0">Tâche complétée</span>
              <select
                value={taskDoneChoice}
                onChange={(e) => setTaskDoneChoice(e.target.value as "omit" | "true" | "false")}
                disabled={isRunning}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-mono"
              >
                <option value="omit">Non renseigné</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
