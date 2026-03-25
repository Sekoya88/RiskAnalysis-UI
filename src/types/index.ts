export interface Article {
  title: string;
  url: string;
  source: string;
  date?: string;
  score?: number; // Backend ML score
}

export interface RagDoc {
  source: string;
  company: string;
  type: string;
  score: number; // Backend Cosine/ML score
  content: string;
}

export interface AnalysisSources {
  news?: Article[];
  rag?: RagDoc[];
}

/** Optional labels sent with POST /api/analyze → news/RAG P/R/F1, faithfulness, tool-order. */
export interface MetricsLabelsPayload {
  metrics_relevant_urls?: string[];
  metrics_relevant_doc_keys?: string[];
  metrics_reference_facts?: string[];
  metrics_expected_tools?: string[];
  metrics_task_completed?: boolean;
}

/** Compact metrics from backend `evaluation` module (POST /api/analyze → run_metrics). */
export interface RunMetrics {
  success: boolean;
  success_rate_component?: number;
  graph_step_count: number;
  tool_call_count: number;
  llm_round_count: number;
  latency_seconds: number;
  estimated_cost_usd: number | null;
  robustness_recovery_score: number | null;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cached_tokens?: number;
  graph_node_names?: string[];
  rl_human_feedback_note?: string;
  /** Present when request included ground-truth labels */
  retrieval_precision?: number | null;
  retrieval_recall?: number | null;
  retrieval_f1?: number | null;
  rag_retrieval_precision?: number | null;
  rag_retrieval_recall?: number | null;
  rag_retrieval_f1?: number | null;
  faithfulness_score?: number | null;
  hallucination_rate_proxy?: number | null;
  tool_use_accuracy?: number | null;
  task_completion_rate?: number | null;
}

/** GET /api/runtime-info — no secrets. */
export interface RuntimeInfo {
  api_version: string;
  database_profile: "postgres" | "sqlite";
  ppo_policy_configured: boolean;
  /** PPO_DISABLED=1 in backend .env */
  ppo_disabled?: boolean;
  /** data/ppo_source_policy.pt or PPO_SOURCE_POLICY_PATH exists */
  ppo_checkpoint_present?: boolean;
  /** torch importable (pip install -r requirements-rl.txt) */
  ppo_torch_installed?: boolean;
  ppo_score_delta_default: number;
  /** Present when API ≥ runtime-info Langfuse fields */
  langfuse_host?: string;
  langfuse_keys_configured?: boolean;
  langfuse_reachable?: boolean;
}

export interface AnalysisRun {
  id: string;
  /** LangGraph thread_id — use for POST /api/feedback as report_id. */
  threadId?: string;
  query: string;
  timestamp: number;
  logs: string[];
  status: "idle" | "running" | "completed" | "error";
  report: string | null;
  sources: AnalysisSources | null;
  elapsed: number;
  runMetrics?: RunMetrics | null;
  error?: string;
}
