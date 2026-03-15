import ReactMarkdown from "react-markdown";
import { FileText, Clock, AlertTriangle, Building2, Calendar, TrendingUp, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
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

interface ReportViewProps {
  run: AnalysisRun | null;
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
      try {
        await fetch("http://localhost:8000/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            run_id: run.id,
            type: "report_feedback",
            value: type === "positive" ? 1 : -1,
          }),
        });
      } catch (e) {
        console.error("Failed to save feedback", e);
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

        {/* Feedback Section */}
        <div className="mt-16 pt-8 border-t border-zinc-200 flex flex-col items-center justify-center space-y-4">
          <p className="text-sm font-medium text-zinc-500">Help improve the model with RLHF feedback</p>
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
