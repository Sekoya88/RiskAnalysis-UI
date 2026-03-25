import { useState, useRef, useCallback } from "react";
import type { AnalysisRun, MetricsLabelsPayload } from "../types";
import { API_BASE, wsBaseUrl } from "@/lib/apiBase";

export function useRiskAnalysis() {
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const activeRun = runs.find((run) => run.id === activeRunId) || null;

  const handleAnalyze = useCallback(async (
    query: string,
    model: string = "qwen3.5",
    labels?: MetricsLabelsPayload,
  ) => {
    if (!query.trim()) return;

    const runId = Math.random().toString(36).substring(7) + Date.now().toString(36);
    const newRun: AnalysisRun = {
      id: runId,
      query,
      timestamp: Date.now(),
      logs: [],
      status: "running",
      report: null,
      sources: null,
      elapsed: 0,
    };

    setRuns((prev) => [newRun, ...prev]);
    setActiveRunId(runId);

    // Setup WebSocket for live logs
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(`${wsBaseUrl()}/api/ws/stream`);
    ws.onmessage = (event) => {
      setRuns((prev) =>
        prev.map((run) => {
          if (run.id !== runId) return run;
          
          let logMessage = event.data;
          try {
            const data = JSON.parse(event.data);
            if (data.message) {
              logMessage = data.message;
            }
          } catch {
            // keep original event.data
          }
          
          return {
            ...run,
            logs: [...run.logs, `[${new Date().toLocaleTimeString()}] ${logMessage}`],
          };
        })
      );
    };
    wsRef.current = ws;

    // Call REST API to trigger analysis
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          use_redis: true,
          model,
          ...(labels ?? {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      setRuns((prev) =>
        prev.map((run) => {
          if (run.id !== runId) return run;
          return {
            ...run,
            status: "completed",
            report: data.report,
            sources: data.sources,
            elapsed: data.elapsed_seconds,
            threadId: data.thread_id,
            runMetrics: data.run_metrics ?? null,
            logs: [...run.logs, `[${new Date().toLocaleTimeString()}] Analysis finished in ${data.elapsed_seconds}s`],
          };
        })
      );
    } catch (error) {
      setRuns((prev) =>
        prev.map((run) => {
          if (run.id !== runId) return run;
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          return {
            ...run,
            status: "error",
            error: errorMessage,
            logs: [...run.logs, `[ERROR] ${errorMessage}`],
          };
        })
      );
    } finally {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
  }, []);

  const selectRun = useCallback((id: string) => {
    setActiveRunId(id);
  }, []);

  const createNewRun = useCallback(() => {
    setActiveRunId(null);
  }, []);

  return {
    runs,
    activeRun,
    activeRunId,
    handleAnalyze,
    selectRun,
    createNewRun,
  };
}
