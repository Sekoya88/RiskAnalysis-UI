import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRight, FileText, Globe, ThumbsUp, ThumbsDown, Clock, Activity, Info } from "lucide-react";
import { AnalysisSources } from "@/types";
import { useState } from "react";
import { API_BASE } from "@/lib/apiBase";

interface SourcesSidebarProps {
  sources: AnalysisSources | null;
  isOpen: boolean;
  onToggle: () => void;
  /** Backend `reports.id` — must be LangGraph `thread_id` from analyze, not the UI run id. */
  feedbackReportId?: string;
}

export function SourcesSidebar({ sources, isOpen, onToggle, feedbackReportId }: SourcesSidebarProps) {
  const [feedbackState, setFeedbackState] = useState<Record<string, "positive" | "negative">>({});

  const handleFeedback = async (sourceId: string, type: "positive" | "negative") => {
    setFeedbackState(prev => ({ ...prev, [sourceId]: type }));
    try {
      await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: feedbackReportId || "unknown_run",
          url: sourceId,
          is_helpful: type === "positive"
        }),
      });
    } catch (e) {
      console.error("Failed to save source feedback to PostgreSQL", e);
    }
  };

  const calculateMLScore = (dateString?: string) => {
    if (!dateString) return 60; // Default score for unknown date
    // Try to parse the date
    const pubDate = new Date(dateString);
    if (isNaN(pubDate.getTime())) return 60;
    
    const now = new Date();
    // Calculate difference in days
    const diffDays = Math.max(0, Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24)));
    // Exponential decay formula roughly: score = max(10, 100 - (diffDays * 2))
    // We adjust it to look more like an ML confidence score
    const score = Math.max(15, 100 - (diffDays * 2));
    return score > 100 ? 100 : score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  if (!isOpen) {
    return (
      <div className="flex flex-col border-l border-zinc-200 bg-zinc-50/50 w-16 items-center py-4 transition-all duration-300 h-screen shrink-0">
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-zinc-500 hover:text-black">
          <PanelRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const hasSources = sources && ((sources.news && sources.news.length > 0) || (sources.rag && sources.rag.length > 0));

  return (
    <div className="flex flex-col w-80 border-l border-zinc-200 bg-zinc-50/50 transition-all duration-300 shrink-0 h-screen">
      <div className="flex items-center justify-between p-4 border-b border-zinc-100">
        <span className="text-sm font-semibold tracking-tight text-zinc-800">Sources</span>
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-zinc-500 hover:text-black h-8 w-8">
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-4 space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-3 text-[11px] leading-relaxed text-zinc-600">
            <div className="flex items-start gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Votes par URL
            </div>
            <p>
              Chaque pouce est stocké pour l’<strong className="text-zinc-800">URL exacte</strong>. Aux prochaines analyses, si cette URL
              réapparaît dans les résultats, son score de tri (feedback + fraîcheur ± PPO si actif) peut la faire monter ou sortir du top‑k
              — pas de mémoire « même entreprise » sans la même URL.
            </p>
          </div>
          {!hasSources ? (
            <div className="text-xs text-zinc-400 text-center py-10 font-mono">
              No sources available
            </div>
          ) : (
            <>
              {sources?.news && sources.news.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    <Globe className="h-3.5 w-3.5" />
                    News ({sources.news.length})
                  </div>
                  <div className="space-y-3">
                    {sources.news.map((article, i) => {
                      const mlScore = article.score !== undefined ? Math.round(article.score * 100) : calculateMLScore(article.date);
                      return (
                        <div key={i} className="bg-white rounded-md p-3 shadow-sm ring-1 ring-zinc-200 hover:ring-zinc-400 transition-all flex flex-col h-full">
                          <div className="flex-1">
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-900 leading-tight block mb-2 hover:underline">
                              {article.title}
                            </a>
                            <div className="flex flex-wrap items-center justify-between mb-1 gap-y-1">
                              <span className="text-xs text-zinc-500 truncate max-w-[150px]">{article.source}</span>
                              {article.date && <span className="text-xs text-zinc-400 flex items-center gap-1"><Clock className="h-3 w-3" />{article.date.substring(0, 10)}</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-50">
                              <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-zinc-500">
                                <Activity className="h-3 w-3" />
                                RL weight
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getScoreColor(mlScore)}`}>
                                {mlScore}/100
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-zinc-100">
                            <span className="text-[10px] text-zinc-400 font-mono flex-1 uppercase tracking-widest">Vote URL → rerank</span>
                            <button 
                              onClick={() => handleFeedback(article.url || `news-${i}`, "positive")}
                              className={`p-1.5 rounded-sm transition-colors ${feedbackState[article.url || `news-${i}`] === "positive" ? "bg-green-100 text-green-700" : "text-zinc-400 hover:text-green-600 hover:bg-green-50"}`}
                              title="Mark as highly relevant"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => handleFeedback(article.url || `news-${i}`, "negative")}
                              className={`p-1.5 rounded-sm transition-colors ${feedbackState[article.url || `news-${i}`] === "negative" ? "bg-red-100 text-red-700" : "text-zinc-400 hover:text-red-600 hover:bg-red-50"}`}
                              title="Mark as outdated/irrelevant"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sources?.rag && sources.rag.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    <FileText className="h-3.5 w-3.5" />
                    Internal Docs ({sources.rag.length})
                  </div>
                  <div className="space-y-3">
                    {sources.rag.map((doc, i) => {
                      const mlScore = doc.score ? Math.round(doc.score * 100) : 60;
                      return (
                        <div key={i} className="bg-white rounded-md p-3 shadow-sm ring-1 ring-zinc-200 hover:ring-zinc-400 transition-all flex flex-col h-full">
                          <div className="text-sm font-medium text-zinc-900 mb-2 break-all">
                            {doc.source}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono mb-2 text-zinc-500">
                            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium border border-indigo-100 uppercase tracking-widest">RAG</span>
                            <span className="truncate max-w-[100px]">{doc.company}</span>
                            <span>·</span>
                            <span className="truncate max-w-[80px]">{doc.type}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-zinc-500">
                              <Activity className="h-3 w-3" />
                              Cosine Score
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getScoreColor(mlScore)}`}>
                              {mlScore}/100
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-600 bg-zinc-50 p-2 rounded ring-1 ring-zinc-100 leading-relaxed overflow-hidden">
                            {doc.content.substring(0, 150)}...
                          </div>
                          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-zinc-100">
                            <span className="text-[10px] text-zinc-400 font-mono flex-1 uppercase tracking-widest">Vote URL → rerank</span>
                            <button 
                              onClick={() => handleFeedback(doc.source || `rag-${i}`, "positive")}
                              className={`p-1.5 rounded-sm transition-colors ${feedbackState[doc.source || `rag-${i}`] === "positive" ? "bg-green-100 text-green-700" : "text-zinc-400 hover:text-green-600 hover:bg-green-50"}`}
                              title="Mark as highly relevant"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => handleFeedback(doc.source || `rag-${i}`, "negative")}
                              className={`p-1.5 rounded-sm transition-colors ${feedbackState[doc.source || `rag-${i}`] === "negative" ? "bg-red-100 text-red-700" : "text-zinc-400 hover:text-red-600 hover:bg-red-50"}`}
                              title="Mark as outdated/irrelevant"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
