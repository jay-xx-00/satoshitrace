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
import { aiChat, API_BASE } from "@/lib/api";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.ok && setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

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
        const res = await aiChat(query);
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
      return (
        <span className="inline-flex items-center gap-1 text-[8px] text-emerald-400 opacity-70">
          <Wifi size={7} /> {source.split(":")[1]}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[8px] text-muted-foreground opacity-60">
        <Cpu size={7} /> SATO NLG
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
              description: "Offline intelligence engine ready.",
            });
          }}
          className="group relative flex items-center gap-2.5 rounded-full border border-signal/40 bg-[#0B0E17]/90 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md hover:border-signal hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-95 transition-all"
        >
          <div className="relative grid h-7 w-7 place-items-center rounded-full bg-signal/15 border border-signal/40 text-signal">
            <Bot size={15} />
            <span
              className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${
                backendOnline ? "bg-emerald-400 animate-ping" : "bg-red-500/70"
              }`}
            />
          </div>
          <div className="text-left">
            <div className="text-[11.5px] font-bold text-foreground group-hover:text-signal flex items-center gap-1.5 transition-colors">
              <span>SATO AI COPILOT</span>
              <Sparkles size={11} className="text-signal" />
            </div>
            <div className="text-[9px] text-muted-foreground">
              {backendOnline ? "Offline AI Engine Ready" : "Start backend to activate"}
            </div>
          </div>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="flex flex-col w-[400px] sm:w-[460px] h-[580px] rounded-xl border border-white/[0.1] bg-[#0A0D16]/97 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden animate-rise">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-white/[0.08] bg-black/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg border border-signal/40 bg-signal/10 text-signal">
                <Bot size={16} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-foreground tracking-wider flex items-center gap-2">
                  <span>SATO AI // AGENT v4.2</span>
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[8px] text-emerald-400 font-semibold border border-emerald-500/30">
                    AIR-GAPPED
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${backendOnline ? "bg-emerald-400" : "bg-red-500"}`}
                  />
                  <span>
                    {backendOnline
                      ? aiSource === "ollama"
                        ? "Ollama LLM Active"
                        : "SATO NLG Engine"
                      : "Backend Offline"}
                  </span>
                  {backendOnline && (
                    <span className="text-muted-foreground/50">• 127.0.0.1:8000</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`rounded p-1.5 transition-colors ${
                  voiceEnabled ? "bg-signal/20 text-signal" : "text-muted-foreground hover:text-foreground"
                }`}
                title={voiceEnabled ? "Mute Voice" : "Enable TTS"}
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-2.5 border-b border-white/[0.06] bg-black/20 shrink-0">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.query}
                onClick={() => handleSend(chip.query)}
                disabled={isThinking}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] text-muted-foreground hover:border-signal/50 hover:text-signal hover:bg-signal/10 disabled:opacity-40 transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-[11px] leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "sato" ? "items-start" : "items-end"}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[8.5px] text-muted-foreground">
                    {m.sender === "sato" ? "SATO FORENSIC AGENT" : "EXAMINER"} • {m.timestamp}
                  </span>
                  {m.sender === "sato" && sourceLabel(m.source)}
                </div>
                <div
                  className={`rounded-lg p-3 max-w-[94%] whitespace-pre-wrap ${
                    m.sender === "sato"
                      ? "border border-white/[0.08] bg-[#0E121E] text-foreground/90 shadow-sm"
                      : "border border-signal/40 bg-signal/10 text-foreground"
                  }`}
                >
                  {m.source === "loading" ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 size={12} className="animate-spin text-signal" />
                      <span className="animate-pulse">Analyzing forensic database...</span>
                    </span>
                  ) : (
                    <>
                      {m.displayText}
                      {m.isStreaming && (
                        <span className="inline-block w-[2px] h-[12px] bg-signal ml-0.5 animate-pulse" />
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
            className="p-3 border-t border-white/[0.08] bg-black/40 flex gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
              placeholder="Ask about threats, tactics, CrPC notices, SHAP..."
              className="flex-1 rounded-md border border-white/10 bg-black/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-signal disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="rounded-md bg-signal px-3.5 py-2 text-signal-foreground font-bold hover:bg-signal/90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
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
