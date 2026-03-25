"use client";

import { useState } from "react";
import { HistorySidebar } from "@/components/dashboard/HistorySidebar";
import { SourcesSidebar } from "@/components/dashboard/SourcesSidebar";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { TerminalOverlay } from "@/components/dashboard/TerminalOverlay";
import { ReportView } from "@/components/dashboard/ReportView";
import { useRiskAnalysis } from "@/hooks/useRiskAnalysis";
import { RuntimeStatusBar } from "@/components/dashboard/RuntimeStatusBar";

export default function RiskAnalysisDashboard() {
  const { runs, activeRun, activeRunId, handleAnalyze, selectRun, createNewRun } = useRiskAnalysis();
  
  // Sidebar toggles
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  const isIdle = !activeRun || activeRun.status === "idle";
  const isRunning = activeRun?.status === "running";
  const isCentered = isIdle && !isRunning;

  return (
    <div className="flex h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white overflow-hidden">
      {/* Left Sidebar: History */}
      <HistorySidebar
        runs={runs}
        activeRunId={activeRunId}
        isOpen={isLeftOpen}
        onToggle={() => setIsLeftOpen(!isLeftOpen)}
        onSelectRun={selectRun}
        onNewRun={createNewRun}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-white">
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-24 pt-8 pb-32">
          <RuntimeStatusBar />

          {/* Command Bar Area */}
          <CommandBar
            key={activeRunId || 'new'}
            onAnalyze={handleAnalyze}
            isRunning={isRunning}
            isCentered={isCentered}
            initialQuery={isIdle ? "Perform a comprehensive credit and geopolitical risk assessment for Apple Inc. (AAPL), considering its supply chain exposure to China and Taiwan, the current US-China semiconductor tensions, and its financial health. Provide an integrated risk report with quantified risk scores." : activeRun?.query}
          />

          {/* Vercel-style Terminal Overlay (only visible while running) */}
          <TerminalOverlay
            logs={activeRun?.logs || []}
            isVisible={isRunning}
          />

          {/* Markdown Report View (visible when completed or error) */}
          {!isCentered && !isRunning && (
            <ReportView run={activeRun} />
          )}

        </div>
      </main>

      {/* Right Sidebar: Sources */}
      <SourcesSidebar
        sources={activeRun?.sources || null}
        isOpen={isRightOpen}
        onToggle={() => setIsRightOpen(!isRightOpen)}
        feedbackReportId={activeRun?.threadId ?? activeRun?.id}
      />
    </div>
  );
}
