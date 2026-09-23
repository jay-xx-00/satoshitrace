import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  Cpu,
  Wifi,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { aiChat, API_BASE, fetchOllamaStatus, OllamaStatus } from "@/lib/api";

interface Message {
  id: string;
  sender: "sato" | "investigator";
  text: string;
  displayText: string;
  timestamp: string;
  source?: string;
  isStreaming?: boolean;
}

const QUICK_CHIPS = [
  { label: "🦙 Ask Ollama LLM", query: "Explain how Bitcoin transaction peeling chains operate and how investigators detect them." },
  { label: "🔍 Explain top suspect", query: "Explain the top suspect wallet and its risk factors" },
  { label: "⛓️ Peeling chain?", query: "What is a peeling chain attack?" },
  { label: "⚖️ 3.2% FPR defense", query: "Explain the false positive rate and how 3.2% FPR is achieved" },
  { label: "🏛️ Draft CrPC notice", query: "Draft a Section 91 CrPC statutory freeze notice" },
  { label: "📜 Draft BNS FIR", query: "Draft a FIR under BNS 2023 and IT Act for money laundering" },
  { label: "🧠 AI architecture", query: "Explain the three-model consensus AI architecture" },
  { label: "🤖 Connect Ollama", query: "How to connect Ollama LLM?" },
  { label: "🐟 What is smurfing?", query: "What is smurfing or structuring in crypto money laundering?" },
];

const INIT_MSG: Message = {
  id: "init",
  sender: "sato",
  text: "⚡ SATO AI Forensic Agent Online. Air-gapped intelligence engine synchronized with seized transaction database. I can explain threat indicators, SHAP feature attributions, draft CrPC notices, or answer any Bitcoin forensics question. What do you need?",
  displayText: "⚡ SATO AI Forensic Agent Online. Air-gapped intelligence engine synchronized with seized transaction database. I can explain threat indicators, SHAP feature attributions, draft CrPC notices, or answer any Bitcoin forensics question. What do you need?",
  timestamp: "Now",
  source: "sato_nlg_engine",
};

export function SatoshiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([INIT_MSG]);
  const [isThinking, setIsThinking] = useState(false);
  const [aiSource, setAiSource] = useState<"ollama" | "nlg" | "unknown">("unknown");
  const [backendOnline, setBackendOnline] = useState(false);
  const [ollamaInfo, setOllamaInfo] = useState<OllamaStatus>({ online: false, host: null, models: [], active_model: "sato_nlg_engine" });
  const [selectedModel, setSelectedModel] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.ok && setBackendOnline(true))
      .catch(() => setBackendOnline(false));

    const pollOllama = () => {
      fetchOllamaStatus().then((info) => {
        setOllamaInfo(info);
        if (info.online && info.models.length > 0 && !selectedModel) {
          setSelectedModel(info.active_model);
        }
      }).catch(() => {});
    };
    pollOllama();
    const interval = setInterval(pollOllama, 8000);
    return () => clearInterval(interval);
  }, [selectedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 280));
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const startTypewriter = useCallback(
    (msgId: string, fullText: string, onDone?: () => void) => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
      let idx = 0;
      const speed = fullText.length > 300 ? 10 : 16;
      typewriterRef.current = setInterval(() => {
        idx += speed;
        const slice = fullText.slice(0, idx);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, displayText: slice, isStreaming: idx < fullText.length } : m
          )
        );
        if (idx >= fullText.length) {
          clearInterval(typewriterRef.current!);
          typewriterRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, displayText: fullText, isStreaming: false } : m
            )
          );
          onDone?.();
        }
      }, 16);
    },
    []
  );

  const handleSend = useCallback(
    async (customQuery?: string) => {
      const query = customQuery || input.trim();
      if (!query || isThinking) return;
      if (!customQuery) setInput("");

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: "investigator",
        text: query,
        displayText: query,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);

      const botId = `s-${Date.now() + 1}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botId,
          sender: "sato",
          text: "",
          displayText: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isStreaming: true,
          source: "loading",
        },
      ]);

      try {
        const res = await aiChat(query, "default", selectedModel);
        const responseText = res.response;
        const src = res.source?.startsWith("ollama") ? "ollama" : "nlg";
        setAiSource(src);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? { ...m, text: responseText, displayText: "", source: res.source, isStreaming: true }
              : m
          )
        );
        setIsThinking(false);
        startTypewriter(botId, responseText, () => speakText(responseText));
      } catch {
        const fallback =
          "⚠️ SATO AI: Backend engine offline (127.0.0.1:8000).\n\nStart the server:\n  cd satoshitrace\n  python -m uvicorn backend.main:app --reload\n\nAll AI intelligence requires the local backend.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? { ...m, text: fallback, displayText: fallback, source: "offline", isStreaming: false }
              : m
          )
        );
        setIsThinking(false);
      }
    },
    [input, isThinking, startTypewriter, voiceEnabled]
  );

  const sourceLabel = (source?: string) => {
    if (!source || source === "loading") return null;
    if (source.startsWith("ollama:")) {
      const model = source.split(":")[1] || "LLM";
      return (
        <span className="inline-flex items-center gap-1 rounded bg-[#39FF88]/15 px-1.5 py-0.2 text-[8px] font-bold text-[#39FF88] border border-[#39FF88]/30">
          <Wifi size={8} className="text-[#39FF88]" /> Ollama: {model}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-[#1C232E] px-1.5 py-0.2 text-[8px] text-[#7D8590] border border-[#1C232E]">
        <Cpu size={8} /> SATO Heuristic Engine
      </span>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono">
      {/* Floating pill */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            toast.info("⚡ SATO AI Forensic Agent Active", {
              description: ollamaInfo.online
                ? `Connected to local ${selectedModel || ollamaInfo.active_model} neural model.`
                : "Offline intelligence engine ready.",
            });
          }}
          className="group relative flex items-center gap-2.5 rounded border border-[#1C232E] bg-[#0D1117]/95 px-3 py-2 shadow-xl backdrop-blur-md hover:border-[#39FF88]/50 active:scale-95 transition-all"
        >
          <div className="relative grid h-6 w-6 place-items-center rounded bg-[#0A0E14] border border-[#1C232E] text-[#39FF88]">
            <Bot size={13} />
            <span
              className={`absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${
                backendOnline ? "bg-[#39FF88] animate-ping" : "bg-[#FF3B3B]/70"
              }`}
            />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-[#E6EDF3] group-hover:text-[#39FF88] flex items-center gap-1.5 transition-colors">
              <span>SATO COPILOT</span>
              <Sparkles size={10} className="text-[#39FF88]" />
            </div>
            <div className="text-[9px] text-[#7D8590]">
              {backendOnline ? (
                ollamaInfo.online ? (
                  <span className="text-[#39FF88] font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-pulse" />
                    OLLAMA: {selectedModel || ollamaInfo.active_model}
                  </span>
                ) : (
                  "AIR-GAPPED AGENT"
                )
              ) : (
                "127.0.0.1 READY"
              )}
            </div>
          </div>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="flex flex-col w-[380px] sm:w-[440px] h-[540px] rounded border border-[#1C232E] bg-[#0D1117] shadow-2xl overflow-hidden animate-rise">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-[#1C232E] bg-[#0A0E14] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 place-items-center rounded border border-[#1C232E] bg-[#0D1117] text-[#39FF88]">
                <Bot size={14} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#E6EDF3] tracking-wider flex items-center gap-2">
                  <span>SATO AI // AGENT v4.2</span>
                  <span className="rounded bg-[#39FF88]/15 px-1.5 py-0.2 text-[8px] text-[#39FF88] font-semibold border border-[#39FF88]/30">
                    AIR-GAPPED
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-[#7D8590] mt-0.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${backendOnline ? (ollamaInfo.online ? "bg-[#39FF88] shadow-[0_0_6px_#39FF88]" : "bg-[#39FF88]") : "bg-[#FF3B3B]"}`}
                  />
                  {backendOnline ? (
                    ollamaInfo.online && ollamaInfo.models.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[#39FF88] font-bold">Ollama:</span>
                        <select
                          value={selectedModel || ollamaInfo.active_model}
                          onChange={(e) => {
                            setSelectedModel(e.target.value);
                            toast.success(`Active Model: ${e.target.value}`);
                          }}
                          className="rounded bg-[#161B22] border border-[#1C232E] px-1 py-0 text-[8.5px] text-[#39FF88] font-bold focus:outline-none focus:border-[#39FF88]"
                        >
                          {ollamaInfo.models.map((m) => (
                            <option key={m} value={m} className="bg-[#0D1117] text-[#E6EDF3]">
                              {m} (Local LLM)
                            </option>
                          ))}
                          <option value="sato_nlg_engine" className="bg-[#0D1117] text-[#7D8590]">
                            SATO Heuristic NLG
                          </option>
                        </select>
                      </div>
                    ) : (
                      <span>SATO Offline NLG Engine</span>
                    )
                  ) : (
                    <span>Backend Offline</span>
                  )}
                  {backendOnline && (
                    <span className="text-[#7D8590]/50">• 127.0.0.1:8000</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`rounded p-1 transition-colors ${
                  voiceEnabled ? "bg-[#39FF88]/20 text-[#39FF88]" : "text-[#7D8590] hover:text-[#E6EDF3]"
                }`}
                title={voiceEnabled ? "Mute Voice" : "Enable TTS"}
              >
                {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-[#7D8590] hover:bg-[#1C232E] hover:text-[#E6EDF3]"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Ollama Status Strip */}
          {ollamaInfo.online ? (
            <div className="px-3 py-1 bg-[#39FF88]/10 border-b border-[#39FF88]/20 text-[9px] text-[#39FF88] flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-pulse" />
                <span>Ollama Neural Engine Active: <strong>{selectedModel || ollamaInfo.active_model}</strong> (100% Offline)</span>
              </span>
              <button
                type="button"
                onClick={() => handleSend("Explain how Bitcoin transaction peeling chains operate in crypto forensics")}
                disabled={isThinking}
                className="text-[8.5px] text-[#39FF88] hover:underline font-bold"
              >
                Test Prompt →
              </button>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-[#FF9F1C]/10 border-b border-[#FF9F1C]/30 text-[9px] text-[#FF9F1C] flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1">
                <span>⚠️ Ollama offline. Run:</span>
                <code className="bg-[#0A0E14] px-1 py-0.2 rounded text-[#E6EDF3] border border-[#1C232E]">ollama serve</code>
              </span>
              <button
                type="button"
                onClick={() => {
                  fetchOllamaStatus().then((info) => {
                    setOllamaInfo(info);
                    if (info.online) toast.success(`Ollama connected: ${info.active_model}`);
                    else toast.info("Ollama not yet detected on port 11434.");
                  });
                }}
                className="underline hover:text-[#E6EDF3] font-bold"
              >
                Check Status
              </button>
            </div>
          )}

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-2 border-b border-[#1C232E] bg-[#0A0E14] shrink-0">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.query}
                onClick={() => handleSend(chip.query)}
                disabled={isThinking}
                className="shrink-0 rounded border border-[#1C232E] bg-[#0D1117] px-2 py-0.5 text-[9px] text-[#7D8590] hover:border-[#39FF88]/40 hover:text-[#39FF88] disabled:opacity-40 transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[11px] leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "sato" ? "items-start" : "items-end"}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[8.5px] text-[#7D8590]">
                    {m.sender === "sato" ? "SATO FORENSIC AGENT" : "EXAMINER"} • {m.timestamp}
                  </span>
                  {m.sender === "sato" && sourceLabel(m.source)}
                </div>
                <div
                  className={`rounded p-2.5 max-w-[94%] whitespace-pre-wrap ${
                    m.sender === "sato"
                      ? "border border-[#1C232E] bg-[#0A0E14] text-[#E6EDF3]"
                      : "border border-[#39FF88]/40 bg-[#39FF88]/10 text-[#E6EDF3]"
                  }`}
                >
                  {m.source === "loading" ? (
                    <span className="flex items-center gap-2 text-[#7D8590]">
                      <Loader2 size={12} className="animate-spin text-[#39FF88]" />
                      <span className="animate-pulse">Analyzing forensic database...</span>
                    </span>
                  ) : (
                    <>
                      {m.displayText}
                      {m.isStreaming && (
                        <span className="inline-block w-[2px] h-[12px] bg-[#39FF88] ml-0.5 animate-pulse" />
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 border-t border-[#1C232E] bg-[#0A0E14] flex gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
              placeholder="Ask about threats, tactics, CrPC notices, SHAP..."
              className="flex-1 rounded border border-[#1C232E] bg-[#0D1117] px-2.5 py-1.5 text-xs text-[#E6EDF3] placeholder:text-[#7D8590] outline-none focus:border-[#39FF88]/50 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="rounded bg-[#39FF88]/20 border border-[#39FF88]/40 px-3 py-1.5 text-[#39FF88] font-bold hover:bg-[#39FF88]/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              {isThinking ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
