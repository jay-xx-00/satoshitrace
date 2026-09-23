import { useState, useEffect, useRef } from "react";
import { Search, Wallet, Network, FileText, ArrowRight, ShieldAlert, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { gNodes } from "@/lib/graph-data";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "WALLET" | "TXID" | "IP" | "CASE" | "MODULE";
  targetRoute: string;
  badge?: string;
  tier?: "RED" | "ORANGE" | "YELLOW" | "GREEN";
}

const COMMAND_REGISTRY: CommandItem[] = [
  {
    id: "bc1qc7slrfxkknqcq2jhaxxq7f3k2m9x4qz8v2rn0w",
    title: "bc1qc7slrfxkknqcq2jhaxxq7f3k2m9x4qz8v2rn0w",
    subtitle: "LockBit 3.0 Extortion Hub • 412.8 BTC Ingress",
    category: "WALLET",
    targetRoute: "/",
    tier: "RED",
    badge: "92% CONSENSUS",
  },
  {
    id: "bc1qh8x7ekkm5x3ncw2p9dl4vv0shq2m6tzz8yg7ke",
    title: "bc1qh8x7ekkm5x3ncw2p9dl4vv0shq2m6tzz8yg7ke",
    subtitle: "Mule Structuring Vault • Smurfing / Peeling",
    category: "WALLET",
    targetRoute: "/",
    tier: "ORANGE",
    badge: "81% CONSENSUS",
  },
  {
    id: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
    title: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
    subtitle: "Wasabi CoinJoin Exit Node • 150.0 BTC",
    category: "WALLET",
    targetRoute: "/",
    tier: "ORANGE",
    badge: "MIXER HOP",
  },
  {
    id: "185.220.101.44",
    title: "185.220.101.44:9001 (Frankfurt Tor Exit)",
    subtitle: "AS62005 Mullvad VPN Proxy Nexus",
    category: "IP",
    targetRoute: "/",
    tier: "RED",
    badge: "TOR RELAY",
  },
  {
    id: "case-cbi-0471",
    title: "CASE CBI-2026-0471",
    subtitle: "Operation BlackRiver — Cybercrime Taskforce",
    category: "CASE",
    targetRoute: "/investigation",
    tier: "RED",
    badge: "ACTIVE",
  },
  {
    id: "mod-dashboard",
    title: "Operations Dashboard",
    subtitle: "Real-time crime metrics & national cyber ops",
    category: "MODULE",
    targetRoute: "/dashboard",
  },
  {
    id: "mod-alerts",
    title: "Prioritized Threat Leads Queue",
    subtitle: "Consensus-ranked threat review matrix",
    category: "MODULE",
    targetRoute: "/alerts",
  },
  {
    id: "mod-timeline",
    title: "4D Fund Flow Replay",
    subtitle: "Temporal transaction slicing & peeling playback",
    category: "MODULE",
    targetRoute: "/timeline",
  },
  {
    id: "mod-reports",
    title: "Section 65B Dossier Center",
    subtitle: "Indian Evidence Act certified PDF bundles",
    category: "MODULE",
    targetRoute: "/reports",
  },
  {
    id: "mod-whitelist",
    title: "Exchange Whitelist Registry",
    subtitle: "500+ pre-tagged hubs for <3.2% FPR gate",
    category: "MODULE",
    targetRoute: "/whitelist",
  },
];

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter items
  const filtered = COMMAND_REGISTRY.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      navigate({ to: filtered[selectedIndex].targetRoute as any });
      onClose();
    }
  };

  if (!isOpen) return null;

  // Helper for highlighting matched characters with #39FF88
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="text-[#39FF88] underline font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border border-[#1C232E] bg-[#0D1117] shadow-2xl font-mono"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-[#1C232E] px-4 py-2 text-[10.5px] text-[#7D8590] bg-[#0A0E14]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#39FF88] animate-pulse" />
            <span className="font-bold text-[#E6EDF3]">SATOSHI TRACE COMMAND PALETTE</span>
          </div>
          <div className="flex items-center gap-3">
            <span>↑↓ TO NAVIGATE</span>
            <span>↵ TO SELECT</span>
            <span>ESC TO DISMISS</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative flex items-center border-b border-[#1C232E] px-4 py-3 bg-[#0D1117]">
          <Search size={15} className="mr-3 text-[#39FF88]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wallet (bc1q...), TXID, IP, case file, or module..."
            className="w-full bg-transparent text-xs text-[#E6EDF3] placeholder-[#7D8590] outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[#7D8590] hover:text-[#E6EDF3]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#1C232E]/40">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#7D8590]">
              No cryptographic identifiers or modules found matching "{query}".
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate({ to: item.targetRoute as any });
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-[#161B22] border-l-2 border-l-[#39FF88]" : "hover:bg-[#131820]"
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] px-1.5 py-0.5 border border-[#1C232E] bg-[#0A0E14] text-[#7D8590] font-bold">
                        {item.category}
                      </span>
                      <span className="truncate text-xs font-bold text-[#E6EDF3]">
                        {renderHighlighted(item.title, query)}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[10.5px] text-[#7D8590]">
                      {item.subtitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span
                        className="px-1.5 py-0.5 text-[9px] font-bold border"
                        style={{
                          borderColor:
                            item.tier === "RED"
                              ? "#FF3B3B"
                              : item.tier === "ORANGE"
                                ? "#FF9F1C"
                                : "#39FF88",
                          color:
                            item.tier === "RED"
                              ? "#FF3B3B"
                              : item.tier === "ORANGE"
                                ? "#FF9F1C"
                                : "#39FF88",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight
                      size={13}
                      className={isSelected ? "text-[#39FF88]" : "text-transparent"}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1C232E] bg-[#0A0E14] px-4 py-2 text-[9.5px] text-[#7D8590] flex items-center justify-between">
          <span>CLASSIFIED DEFENSE RECORD INDEX // 100% AIR-GAPPED</span>
          <span>QUERY MATCHES: {filtered.length}</span>
        </div>
      </div>
    </div>
  );
}
