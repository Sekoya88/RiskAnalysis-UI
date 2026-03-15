import { MessageSquare, Plus, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisRun } from "@/types";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  runs: AnalysisRun[];
  activeRunId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectRun: (id: string) => void;
  onNewRun: () => void;
}

export function HistorySidebar({
  runs,
  activeRunId,
  isOpen,
  onToggle,
  onSelectRun,
  onNewRun,
}: HistorySidebarProps) {
  if (!isOpen) {
    return (
      <div className="flex flex-col border-r border-zinc-200 bg-zinc-50/50 w-16 items-center py-4 transition-all duration-300 h-screen shrink-0">
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-zinc-500 hover:text-black">
          <PanelLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewRun} className="mt-4 text-zinc-500 hover:text-black">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 border-r border-zinc-200 bg-zinc-50/50 transition-all duration-300 shrink-0 h-screen">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-semibold tracking-tight text-zinc-800">History</span>
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-zinc-500 hover:text-black h-8 w-8">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-3 pb-2">
        <Button 
          variant="outline" 
          onClick={onNewRun} 
          className="w-full justify-start gap-2 shadow-sm bg-white border-zinc-200 hover:bg-zinc-100 hover:text-black text-sm"
        >
          <Plus className="h-4 w-4" />
          New Analysis
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="space-y-1 py-2">
          {runs.length === 0 ? (
            <div className="text-xs text-zinc-400 text-center py-6 font-mono">
              No previous runs
            </div>
          ) : (
            runs.map((run) => (
              <button
                key={run.id}
                onClick={() => onSelectRun(run.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                  activeRunId === run.id 
                    ? "bg-black text-white" 
                    : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                <div className="truncate text-sm font-medium">
                  {run.query}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
