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

export interface AnalysisRun {
  id: string;
  query: string;
  timestamp: number;
  logs: string[];
  status: "idle" | "running" | "completed" | "error";
  report: string | null;
  sources: AnalysisSources | null;
  elapsed: number;
  error?: string;
}
