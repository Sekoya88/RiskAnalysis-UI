"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Activity, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function RiskAnalysisDashboard() {
  const [query, setQuery] = useState(
    "Perform a comprehensive credit and geopolitical risk assessment for Apple Inc. (AAPL), considering its supply chain exposure to China and Taiwan, the current US-China semiconductor tensions, and its financial health. Provide an integrated risk report with quantified risk scores."
  );
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [sources, setSources] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
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
    setElapsed(0);

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
      setElapsed(data.elapsed_seconds);
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
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <div className="border-b border-[#eaeaea] px-8 py-8 mb-8">
        <h1 className="text-[2rem] font-extrabold tracking-[-0.04em] text-black mb-2">
          AGENTIC RISK ASSESSMENT
        </h1>
        <p className="text-[#666666] text-[0.9rem] font-mono tracking-tight opacity-80">
          Multi-Agent LLM System for Credit & Geopolitical Risk
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Input & Logs */}
        <div className="lg:col-span-4 space-y-8">
          
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[#eaeaea] pb-2">
              Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-neutral-500">Analysis Query</label>
                <Textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[140px] resize-none text-sm leading-relaxed border-[#eaeaea] focus:border-black focus:ring-0 rounded-md transition-colors"
                  placeholder="Analyze geopolitical risk for..."
                />
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isRunning || !query.trim()}
                className="w-full bg-black text-white hover:bg-[#333333] hover:-translate-y-[2px] transition-all duration-200 active:translate-y-0 rounded-md font-mono text-[0.75rem] font-medium uppercase tracking-[0.05em] py-5 shadow-sm"
              >
                {isRunning ? "Running Analysis..." : "Run Analysis"}
              </Button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[#eaeaea] pb-2">
              Live Activity
            </h2>
            <div className="bg-[#000000] rounded-md p-4 h-[350px] overflow-y-auto font-mono text-[11px] leading-relaxed shadow-inner">
              {logs.length === 0 ? (
                <span className="text-neutral-500">Waiting for agent activity...</span>
              ) : (
                <div className="space-y-1.5 text-[#4ade80]">
                  {logs.map((log, i) => (
                    <div key={i} className="break-words opacity-90">{log}</div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Output Report */}
        <div className="lg:col-span-8">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[#eaeaea] pb-2 flex items-center justify-between">
              <span>Integrated Risk Report</span>
              {elapsed > 0 && <span className="text-xs text-neutral-400 font-mono lowercase">Completed in {elapsed}s</span>}
            </h2>
            
            <div className="bg-white border border-[#eaeaea] rounded-md min-h-[600px] p-8 lg:p-10 transition-all duration-300 hover:border-black hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-[3px]">
              
              {!report && !isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 mt-32 text-center">
                  <FileText className="h-8 w-8 mb-4 opacity-50" strokeWidth={1.5} />
                  <p className="font-mono text-sm uppercase tracking-widest">No report generated</p>
                </div>
              )}
              
              {isRunning && !report && (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 mt-32">
                  <Activity className="h-8 w-8 mb-4 opacity-50 animate-pulse" strokeWidth={1.5} />
                  <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Agents are working...</p>
                </div>
              )}

              {report && (
                <div className="prose prose-neutral max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:text-[1.4rem] prose-h2:uppercase prose-h2:border-b-2 prose-h2:border-black prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-[1.1rem] prose-p:leading-relaxed prose-a:text-black prose-a:font-semibold prose-a:underline prose-li:leading-relaxed">
                  <ReactMarkdown>{report}</ReactMarkdown>
                </div>
              )}
            </div>
          </section>

          {/* SOURCES SECTION */}
          {sources && (
            <section className="mt-8">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[#eaeaea] pb-2">
                Sources Used
              </h2>
              <div className="space-y-4">
                
                {sources.news && sources.news.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-neutral-500 uppercase mb-3 tracking-widest">NEWS ({sources.news.length})</h3>
                    <div className="grid gap-3">
                      {sources.news.slice(0, 10).map((article: any, i: number) => (
                        <div key={i} className="bg-white border border-[#eaeaea] rounded p-3 text-sm hover:border-black transition-colors">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-semibold block mb-1 hover:underline">
                            {article.title}
                          </a>
                          <div className="flex items-center gap-2 text-xs font-mono mt-2">
                            <span className="bg-[#f4f4f5] text-black border border-[#e4e4e7] px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">NEWS</span>
                            <span className="bg-[#f4f4f5] text-black border border-[#e4e4e7] px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">LIVE</span>
                            <span className="text-neutral-500">{article.source}</span>
                            {article.date && <span className="text-neutral-500">· {article.date.substring(0,10)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sources.rag && sources.rag.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-mono font-bold text-neutral-500 uppercase mb-3 tracking-widest">DOCS ({sources.rag.length})</h3>
                    <div className="grid gap-3">
                      {sources.rag.map((doc: any, i: number) => (
                        <div key={i} className="bg-white border border-[#eaeaea] rounded p-3 text-sm hover:border-black transition-colors">
                          <div className="font-semibold mb-1">{doc.source}</div>
                          <div className="flex items-center gap-2 text-xs font-mono mt-2 mb-3">
                            <span className="bg-[#f4f4f5] text-black border border-[#e4e4e7] px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">RAG</span>
                            <span className="bg-[#f4f4f5] text-black border border-[#e4e4e7] px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">STATIC</span>
                            <span className="text-neutral-500">{doc.company} · {doc.type} · Score: {doc.score.toFixed(2)}</span>
                          </div>
                          <div className="text-[11px] font-mono text-neutral-600 bg-[#fafafa] p-2 rounded border border-[#eaeaea] leading-relaxed">
                            {doc.content.substring(0, 300)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}