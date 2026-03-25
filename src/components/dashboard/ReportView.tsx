import ReactMarkdown from "react-markdown";
import { FileText, Clock, AlertTriangle, Building2, Calendar, TrendingUp, ThumbsUp, ThumbsDown, CheckCircle2, Cpu, Wrench } from "lucide-react";
import { AnalysisRun } from "@/types";
import { parseReportText } from "@/lib/reportParser";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/apiBase";

interface ReportViewProps {
  run: AnalysisRun | null;
}

function fmtRatio01(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(0)}%`;
}

function hasLabelMetrics(m: NonNullable<AnalysisRun["runMetrics"]>): boolean {
  return (
    m.retrieval_precision != null ||
    m.retrieval_recall != null ||
    m.retrieval_f1 != null ||
    m.rag_retrieval_precision != null ||
    m.rag_retrieval_recall != null ||
    m.rag_retrieval_f1 != null ||
    m.faithfulness_score != null ||
    m.hallucination_rate_proxy != null ||
    m.tool_use_accuracy != null ||
    m.task_completion_rate != null
  );
}

export function ReportView({ run }: ReportViewProps) {
  const [feedbackState, setFeedbackState] = useState<"idle" | "positive" | "negative">("idle");

  if (!run) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-400 mt-32 text-center animate-in fade-in duration-500">
        <FileText className="h-10 w-10 mb-6 opacity-20" strokeWidth={1} />
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">No active analysis</p>
      </div>
    );
  }

  if (run.status === "running") {
    return (
      <div className="h-full flex flex-col items-center justify-center mt-32 text-center animate-in fade-in duration-500">
        <div className="w-12 h-12 rounded-full border-2 border-zinc-200 border-t-black animate-spin mb-6" />
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 animate-pulse">
          Agents are analyzing...
        </p>
      </div>
    );
  }

  if (run.status === "error") {
    return (
      <div className="mt-8 p-6 bg-red-50 text-red-900 rounded-xl border border-red-100 flex items-start gap-4">
        <AlertTriangle className="h-6 w-6 shrink-0 text-red-500" />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-2">Analysis Failed</h3>
          <p className="font-mono text-sm opacity-80">{run.error || "An unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  if (run.status === "completed" && run.report) {
    const parsed = parseReportText(run.report);
    
    // Prepare data for Radar Chart
    const chartData = parsed.riskDecomposition.map(cat => ({
      subject: cat.name,
      A: cat.score,
      fullMark: 100,
    }));

    const getScoreColor = (score: number) => {
      if (score >= 70) return "text-red-500 bg-red-50 border-red-200";
      if (score >= 40) return "text-orange-500 bg-orange-50 border-orange-200";
      return "text-green-500 bg-green-50 border-green-200";
    };

    const handleFeedback = async (type: "positive" | "negative") => {
      setFeedbackState(type);
      const reportId = run.threadId ?? run.id;
      try {
        const res = await fetch(`${API_BASE}/api/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            report_id: reportId,
            url: "__report_overall__",
            is_helpful: type === "positive",
          }),
        });
        if (!res.ok) {
          console.error("Feedback API error", await res.text());
          setFeedbackState("idle");
        }
      } catch (e) {
        console.error("Failed to save feedback", e);
        setFeedbackState("idle");
      }
    };

    return (
      <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700 ease-out pb-20 max-w-4xl mx-auto">
        
        {/* Header Metadata */}
        <div className="flex flex-col gap-6 mb-8 pb-8 border-b border-zinc-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2 leading-tight">
                {parsed.entity !== "Unknown Entity" ? parsed.entity : "Risk Assessment Report"}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 font-mono mt-3">
                <span className="flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 rounded-md text-zinc-700 font-semibold border border-zinc-200">
                  <Building2 className="h-3.5 w-3.5" />
                  {parsed.equityType} Equity
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {parsed.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {run.elapsed}s
                </span>
              </div>
            </div>
            
            {/* Core Metrics */}
            <div className="flex items-center gap-4 text-right">
               {parsed.overallScore !== null && (
                 <div className="flex flex-col items-end">
                   <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Overall Risk</span>
                   <span className={`text-3xl font-extrabold tracking-tighter px-3 py-1 rounded-lg border ${getScoreColor(parsed.overallScore)}`}>
                     {parsed.overallScore}<span className="text-lg text-current opacity-50">/100</span>
                   </span>
                 </div>
               )}
               {parsed.creditRating !== "N/A" && (
                 <div className="flex flex-col items-end">
                   <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Credit Rating</span>
                   <span className="text-3xl font-extrabold tracking-tighter px-3 py-1 rounded-lg border border-zinc-200 bg-white text-zinc-900 shadow-sm">
                     {parsed.creditRating.split("/")[0].trim()}
                     <span className="text-sm font-medium text-zinc-500 ml-2 align-middle uppercase tracking-widest">{parsed.creditRating.split("/")[1]?.trim()}</span>
                   </span>
                 </div>
               )}
            </div>
          </div>

          {run.runMetrics && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                Run metrics (evaluation)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="font-mono text-xs">
                  <span className="text-zinc-500 block mb-0.5">Graph steps</span>
                  <span className="font-semibold text-zinc-900">{run.runMetrics.graph_step_count ?? 0}</span>
                </div>
                <div className="font-mono text-xs">
                  <span className="text-zinc-500 block mb-0.5 flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> Tool calls
                  </span>
                  <span className="font-semibold text-zinc-900">{run.runMetrics.tool_call_count ?? 0}</span>
                </div>
                <div className="font-mono text-xs">
                  <span className="text-zinc-500 block mb-0.5 flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> LLM rounds
                  </span>
                  <span className="font-semibold text-zinc-900">{run.runMetrics.llm_round_count ?? 0}</span>
                </div>
                <div className="font-mono text-xs">
                  <span className="text-zinc-500 block mb-0.5">Wall latency</span>
                  <span className="font-semibold text-zinc-900">
                    {(run.runMetrics.latency_seconds ?? 0).toFixed(2)}s
                  </span>
                </div>
                <div className="font-mono text-xs">
                  <span className="text-zinc-500 block mb-0.5">Tokens in / out</span>
                  <span className="font-semibold text-zinc-900">
                    {(run.runMetrics.total_input_tokens ?? 0).toLocaleString()} /{" "}
                    {(run.runMetrics.total_output_tokens ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="font-mono text-xs">
                  <span className="text-zinc-500 block mb-0.5">Est. cost (USD)</span>
                  <span className="font-semibold text-zinc-900">
                    {run.runMetrics.estimated_cost_usd != null
                      ? run.runMetrics.estimated_cost_usd < 0.0001
                        ? "<0.0001"
                        : run.runMetrics.estimated_cost_usd.toFixed(4)
                      : "—"}
                  </span>
                </div>
                <div className="font-mono text-xs">
                  <span className="text-zinc-500 block mb-0.5">Robustness</span>
                  <span className="font-semibold text-zinc-900">
                    {run.runMetrics.robustness_recovery_score != null
                      ? `${(run.runMetrics.robustness_recovery_score * 100).toFixed(0)}%`
                      : "—"}
                  </span>
                </div>
              </div>

              {run.runMetrics.rl_human_feedback_note && (
                <p className="text-[11px] text-zinc-600 leading-relaxed border-t border-zinc-200/80 pt-3 font-medium">
                  {run.runMetrics.rl_human_feedback_note}
                </p>
              )}

              <p className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-200/80 pt-3">
                P/R/F1, faithfulness, etc. ne s’affichent pas sans ground truth : renseignez le panneau
                « Étiquettes métriques » sous la requête pour les calculer ; sinon ces champs restent vides.
                On peut enrichir plus tard (dataset + endpoint dédié ou champs optionnels dans la réponse).
              </p>

              {hasLabelMetrics(run.runMetrics) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm pt-2 border-t border-zinc-200/80">
                  <div className="font-mono text-xs">
                    <span className="text-zinc-500 block mb-0.5">News P / R / F1</span>
                    <span className="font-semibold text-zinc-900">
                      {fmtRatio01(run.runMetrics.retrieval_precision)} /{" "}
                      {fmtRatio01(run.runMetrics.retrieval_recall)} /{" "}
                      {fmtRatio01(run.runMetrics.retrieval_f1)}
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-zinc-500 block mb-0.5">RAG P / R / F1</span>
                    <span className="font-semibold text-zinc-900">
                      {fmtRatio01(run.runMetrics.rag_retrieval_precision)} /{" "}
                      {fmtRatio01(run.runMetrics.rag_retrieval_recall)} /{" "}
                      {fmtRatio01(run.runMetrics.rag_retrieval_f1)}
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-zinc-500 block mb-0.5">Faithfulness</span>
                    <span className="font-semibold text-zinc-900">
                      {fmtRatio01(run.runMetrics.faithfulness_score)}
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-zinc-500 block mb-0.5">Halluc. proxy</span>
                    <span className="font-semibold text-zinc-900">
                      {fmtRatio01(run.runMetrics.hallucination_rate_proxy)}
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-zinc-500 block mb-0.5">Tool-order</span>
                    <span className="font-semibold text-zinc-900">
                      {fmtRatio01(run.runMetrics.tool_use_accuracy)}
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-zinc-500 block mb-0.5">Task done</span>
                    <span className="font-semibold text-zinc-900">
                      {fmtRatio01(run.runMetrics.task_completion_rate)}
                    </span>
                  </div>
                </div>
              )}

              {run.runMetrics.graph_node_names && run.runMetrics.graph_node_names.length > 0 && (
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed break-words">
                  Nodes: {run.runMetrics.graph_node_names.join(" → ")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Risk Decomposition Graph & Summary */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-zinc-50/50 rounded-2xl p-6 border border-zinc-100">
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e4e4e7" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Risk"
                    dataKey="A"
                    stroke="#09090b"
                    fill="#18181b"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" /> Risk Decomposition
              </h3>
              {parsed.riskDecomposition.map((risk, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-zinc-800">{risk.name}</span>
                    <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded border ${getScoreColor(risk.score)}`}>
                      {risk.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-zinc-900 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${risk.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Markdown Body */}
        <div className="prose prose-zinc prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-zinc-200 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-zinc-700 prose-a:text-black prose-a:font-semibold prose-a:underline prose-li:text-zinc-700 prose-strong:text-zinc-900">
          <ReactMarkdown>{parsed.rawMarkdown}</ReactMarkdown>
        </div>

        {/* Feedback: URL votes (+ optional PPO checkpoint on API host); never LLM fine-tuning */}
        <div className="mt-16 pt-8 border-t border-zinc-200 flex flex-col items-center justify-center space-y-4">
          <div className="text-center max-w-lg space-y-1">
            <p className="text-sm font-medium text-zinc-700">Feedback sur le rapport</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Les votes sur les sources (sidebar) alimentent Postgres et le <strong className="font-medium text-zinc-700">tri top‑k</strong> (fraîcheur + historique). Le backend peut en plus charger une politique <strong className="font-medium text-zinc-700">PPO</strong> optionnelle sur les scores — jamais de fine‑tuning du LLM.
            </p>
          </div>
          {feedbackState === "idle" ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => handleFeedback("positive")} className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors">
                <ThumbsUp className="h-4 w-4" /> Accurate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleFeedback("negative")} className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                <ThumbsDown className="h-4 w-4" /> Inaccurate
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
              <CheckCircle2 className="h-4 w-4" /> Feedback saved to PostgreSQL
            </div>
          )}
        </div>

      </div>
    );
  }

  return null;
}
