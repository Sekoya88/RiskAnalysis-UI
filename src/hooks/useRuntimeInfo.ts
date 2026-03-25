import { useState, useEffect, useCallback } from "react";
import type { RuntimeInfo } from "@/types";
import { API_BASE } from "@/lib/apiBase";

export function useRuntimeInfo(pollMs: number | null = 30_000) {
  const [info, setInfo] = useState<RuntimeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [reachable, setReachable] = useState(false);

  const fetchInfo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/runtime-info`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as RuntimeInfo;
      setInfo(data);
      setReachable(true);
    } catch {
      setReachable(false);
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInfo();
    if (pollMs == null || pollMs <= 0) return undefined;
    const id = setInterval(() => void fetchInfo(), pollMs);
    return () => clearInterval(id);
  }, [fetchInfo, pollMs]);

  return { info, loading, reachable, refetch: fetchInfo };
}
