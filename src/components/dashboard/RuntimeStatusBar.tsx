"use client";

import { useRuntimeInfo } from "@/hooks/useRuntimeInfo";
import { API_BASE } from "@/lib/apiBase";
import { cn } from "@/lib/utils";
import { Database, Cpu, WifiOff, RefreshCw, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RuntimeInfo } from "@/types";

function ppoSubtitle(info: RuntimeInfo): string {
  if (info.ppo_policy_configured) {
    return `PPO actif — delta ${info.ppo_score_delta_default} (fichier auto ou PPO_SOURCE_POLICY_PATH)`;
  }
  if (info.ppo_disabled) {
    return info.ppo_checkpoint_present
      ? "Désactivé : PPO_DISABLED=1 — le fichier .pt est présent mais non chargé."
      : "Désactivé : PPO_DISABLED=1 dans le .env du backend.";
  }
  if (info.ppo_torch_installed === false) return "Installe torch : pip install -r requirements-rl.txt";
  if (info.ppo_checkpoint_present === false) {
    return "Pas de checkpoint : lance just ppo-ensure (ou just ppo-train) dans RiskAnalysis.";
  }
  return "PPO inactif.";
}

function ppoShortLabel(info: RuntimeInfo): string {
  if (info.ppo_policy_configured) return "on";
  if (info.ppo_disabled) return "off · env";
  if (info.ppo_torch_installed === false) return "off · torch";
  if (info.ppo_checkpoint_present === false) return "off · ckpt";
  return "off";
}

export function RuntimeStatusBar() {
  const { info, loading, reachable, refetch } = useRuntimeInfo(45_000);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
      <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[min(100%,14rem)]" title={API_BASE}>
        API {API_BASE.replace(/^https?:\/\//, "")}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-zinc-400 hover:text-zinc-800"
        onClick={() => void refetch()}
        title="Rafraîchir l’état API"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
      </Button>
      {!reachable && !loading ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-900">
          <WifiOff className="h-3 w-3" /> API hors ligne
        </span>
      ) : null}
      {reachable && info ? (
        <>
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-700">
            <Database className="h-3 w-3 opacity-60" />
            {info.database_profile === "postgres" ? "Postgres" : "SQLite"}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium",
              info.ppo_policy_configured
                ? "border-violet-200 bg-violet-50 text-violet-900"
                : "border-zinc-200 bg-zinc-50 text-zinc-500"
            )}
            title={ppoSubtitle(info)}
          >
            <Cpu className="h-3 w-3 opacity-70" />
            PPO {ppoShortLabel(info)}
          </span>
          {info.langfuse_keys_configured ? (
            <a
              href={info.langfuse_host ?? "http://localhost:3001"}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium transition-colors",
                info.langfuse_reachable
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                  : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
              )}
              title={
                info.langfuse_reachable
                  ? "Langfuse UI joignable — ouvrir le tableau de bord"
                  : "UI Langfuse injoignable — lance: docker compose up langfuse -d"
              }
            >
              <LineChart className="h-3 w-3 opacity-70" />
              Langfuse {info.langfuse_reachable ? "ok" : "down"}
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-400"
              title="Définis LANGFUSE_PUBLIC_KEY et LANGFUSE_SECRET_KEY dans .env du backend"
            >
              <LineChart className="h-3 w-3" />
              Langfuse · no keys
            </span>
          )}
          <span className="text-[10px] font-mono text-zinc-400">v{info.api_version}</span>
        </>
      ) : null}
    </div>
  );
}
