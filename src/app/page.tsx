"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Activity, FileText, Database, Settings, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function RiskAnalysisDashboard() {
  const [query, setQuery] = useState(
    "Perform a comprehensive credit and geopolitical risk assessment for Apple Inc. (AAPL), considering its supply chain exposure to China and Taiwan, the current US-China semiconductor tensions, and its financial health. Provide an integrated risk report with quantified risk scores."
  );
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [sources, setSources] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setIsRunning(true);
    setLogs([]);
    setReport(null);
    setSources(null);

    // Setup WebSocket for live logs
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket("ws://localhost:8000/api/ws/stream");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${data.message}`]);
        } else {
            setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${event.data}`]);
        }
      } catch (e) {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${event.data}`]);
      }
    };
    wsRef.current = ws;

    // Call REST API to trigger analysis
    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          use_redis: true,
          model: "qwen3.5",
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setReport(data.report);
      setSources(data.sources);
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Analysis finished in ${data.elapsed_seconds}s`]);
    } catch (error: any) {
      setLogs((prev) => [...prev, `[ERROR] ${error.message}`]);
    } finally {
      setIsRunning(false);
      if (wsRef.current) {
        wsRef.current.close();
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 font-sans text-neutral-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Layers className="h-6 w-6 text-indigo-600" />
              Agentic Risk Assessment
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Multi-Agent LLM System for Credit & Geopolitical Risk
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white text-neutral-600 border-neutral-200">
              <Database className="h-3 w-3 mr-1" />
              PostgreSQL + pgvector
            </Badge>
            <Badge variant="outline" className="bg-white text-neutral-600 border-neutral-200">
              <Settings className="h-3 w-3 mr-1" />
              FastAPI
            </Badge>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: INPUT & CONTROLS */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-neutral-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Analysis Query</CardTitle>
                <CardDescription>Enter the entity and context to analyze.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[160px] resize-none text-sm leading-relaxed"
                  placeholder="Analyze geopolitical risk for..."
                />
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isRunning || !query.trim()}
                  className="w-full font-medium bg-indigo-600 hover:bg-indigo-700"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2 animate-pulse">
                      <Activity className="h-4 w-4" /> Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" /> Run Analysis
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* LIVE LOGS */}
            <Card className="border-neutral-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-neutral-900 border-b border-neutral-800">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-neutral-300">
                  <Activity className="h-4 w-4 text-green-400" /> Live Agent Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-neutral-900">
                <ScrollArea className="h-[280px] w-full text-green-400 p-4 font-mono text-xs">
                  {logs.length === 0 ? (
                    <span className="text-neutral-600">Waiting for agent activity...</span>
                  ) : (
                    <div className="space-y-1.5 opacity-90">
                      {logs.map((log, i) => (
                        <div key={i} className="break-words leading-relaxed">{log}</div>
                      ))}
                      <div ref={scrollRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-2">
            <Card className="h-full min-h-[600px] flex flex-col border-neutral-200 shadow-sm">
              <CardHeader className="border-b bg-white pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" /> Final Integrated Report
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 bg-white overflow-y-auto">
                {!report && !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-12 text-center border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
                    <FileText className="h-12 w-12 mb-4 text-neutral-300" />
                    <p className="font-medium text-neutral-600">No report generated yet.</p>
                    <p className="text-sm mt-1">Click "Run Analysis" to start the multi-agent pipeline.</p>
                  </div>
                )}
                
                {isRunning && !report && (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 p-12">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full blur opacity-25 bg-indigo-600 animate-pulse"></div>
                      <Activity className="relative h-10 w-10 mb-4 animate-spin text-indigo-600" />
                    </div>
                    <p className="font-medium text-neutral-700">Agents are researching & synthesizing...</p>
                    <p className="text-sm mt-2 text-neutral-500">Watch the live logs panel for progress.</p>
                  </div>
                )}

                {report && (
                  <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-h2:text-indigo-900 prose-h3:text-neutral-800 prose-a:text-indigo-600">
                    <ReactMarkdown>{report}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
