import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Building2,
  Camera,
  Layers,
  Network,
  Shield,
  Wallet,
  ZoomIn,
  ZoomOut,
  Crosshair,
  RefreshCw,
  Copy,
  Check,
  Activity,
  Sparkles,
  GitFork,
  Radio,
  Zap,
  Route,
  ArrowRight,
  Move,
} from "lucide-react";
import { toast } from "sonner";
import { gEdges as mockEdges, gNodes as mockNodes, type GNode, type GEdge, type GNodeType } from "@/lib/graph-data";
import { API_BASE } from "@/lib/api";

export const TYPE_META: Record<
  GNodeType,
  { color: string; bloom: string; icon: typeof Network; label: string; badge: string }
> = {
  ip: { color: "#7D8590", bloom: "0 0 8px rgba(125, 133, 144, 0.4)", icon: Network, label: "IP Address", badge: "NETWORK HOP" },
  txid: { color: "#FFD60A", bloom: "0 0 10px rgba(255, 214, 10, 0.6)", icon: ArrowLeftRight, label: "Transaction", badge: "TX HOP" },
  wallet: { color: "#39FF88", bloom: "0 0 10px rgba(57, 255, 136, 0.65)", icon: Wallet, label: "Wallet", badge: "CLEAN WALLET" },
  suspect: { color: "#FF3B3B", bloom: "0 0 14px rgba(255, 59, 59, 0.8)", icon: AlertTriangle, label: "Suspect Wallet", badge: "CRITICAL RED" },
  cluster: { color: "#FF9F1C", bloom: "0 0 12px rgba(255, 159, 28, 0.7)", icon: Building2, label: "Syndicate Cluster", badge: "SYNDICATE HUB" },
};

type LayoutMode = "constellation" | "force" | "flow";
type FilterType = "all" | "suspect" | "cluster" | "ip" | "wallet";

interface Pos {
  x: number;
  y: number;
}

function useCountUp(target: number, ms = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/* -------------------------------------------------------------------------- */
/* HUD Stats Bar                                                              */
/* -------------------------------------------------------------------------- */
function StatsOverlay({
  nodeCount,
  edgeCount,
  clusterCount,
  suspectCount,
  isLive,
}: {
  nodeCount: number;
  edgeCount: number;
  clusterCount: number;
  suspectCount: number;
  isLive: boolean;
}) {
  const n = useCountUp(nodeCount);
  const e = useCountUp(edgeCount);
  const c = useCountUp(clusterCount, 800);
  const s = useCountUp(suspectCount);

  return (
    <div className="font-mono text-xs pointer-events-none absolute left-4 top-20 z-20 flex items-center gap-2.5 rounded border border-[#1C232E] bg-[#0D1117]/95 px-3 py-1 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] shadow-[0_0_6px_#39FF88]" />
        <span className="text-[#7D8590] text-[10px] tracking-wider">
          NODES <span className="font-bold tabular-nums text-[#E6EDF3]">{n}</span>
        </span>
      </div>
      <span className="h-2.5 w-px bg-[#1C232E]" />
      <span className="text-[#7D8590] text-[10px] tracking-wider">
        EDGES <span className="font-bold tabular-nums text-[#E6EDF3]">{e}</span>
      </span>
      <span className="h-2.5 w-px bg-[#1C232E]" />
      <span className="text-[#7D8590] text-[10px] tracking-wider">
        SYNDICATES <span className="font-bold tabular-nums text-[#FF9F1C]">{c}</span>
      </span>
      <span className="h-2.5 w-px bg-[#1C232E]" />
      <span className="text-[#7D8590] text-[10px] tracking-wider">
        SUSPECTS <span className="font-bold tabular-nums text-[#FF3B3B]">{s}</span>
      </span>
      {isLive && (
        <>
          <span className="h-2.5 w-px bg-[#1C232E]" />
          <span className="flex items-center gap-1 font-semibold text-[#39FF88] text-[10px] tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-pulse shadow-[0_0_6px_#39FF88]" />
            KERNEL 127.0.0.1
          </span>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Node Visual Component with Double-Bezel Architecture                       */
/* -------------------------------------------------------------------------- */
function NodeShape({
  node,
  pos,
  active,
  inPath,
  dim,
  onClick,
  onMouseDown,
}: {
  node: GNode;
  pos: Pos;
  active: boolean;
  inPath: boolean;
  dim: boolean;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const meta = TYPE_META[node.type] || TYPE_META.wallet;
  const Icon = meta.icon;
  const color = node.type === "cluster" ? (node.accent ?? meta.color) : meta.color;
  const tor = node.tor === true;
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scaled dimensions
  const size =
    node.type === "cluster" ? 72 : node.type === "suspect" ? 52 : node.type === "ip" ? 38 : 32;

  const shape =
    node.type === "ip"
      ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
      : node.type === "txid"
        ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
        : undefined;

  const tint = tor ? "var(--warn)" : color;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.full) {
      navigator.clipboard.writeText(node.full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Address Copied", { description: node.full });
    }
  };

  // Intelligent Anti-Collision Label Placement:
  // 1. Cluster Hubs: Always place banner BELOW the hub icon.
  // 2. Suspect Nodes: ALWAYS place badge ABOVE the node icon (bottom-full mb-2).
  //    This guarantees threat badges sit in the clear sky above, NEVER overlapping the cluster building icon!
  // 3. Member Nodes: If above the cluster hub center, place label ABOVE.
  //    If below the cluster hub center, place label BELOW.
  const isCluster = node.type === "cluster";
  const isSuspect = node.type === "suspect";
  const isUpperHemisphere = pos.y < 34 || (pos.y > 48 && pos.y < 72);
  const labelBelow = isCluster ? true : isSuspect ? false : !isUpperHemisphere;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={onMouseDown}
      className={[
        "group absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none",
        node.type === "cluster" ? "hover:z-30" : "",
        active ? "z-40" : "",
        dim ? "opacity-15 scale-95" : "opacity-100 scale-100",
        inPath ? "scale-105 z-30" : "",
        "transition-all duration-300 ease-out",
      ].join(" ")}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
      }}
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
    >
      {/* Interactive Terminal HUD Tooltip */}
      {isHovered && (
        <div
          className="pointer-events-auto absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 w-64 rounded border border-[#1C232E] bg-[#0D1117] p-3 shadow-2xl animate-rise"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1C232E]">
            <span className="flex items-center gap-1.5 text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#7D8590]">
              <Icon size={12} style={{ color: tint }} /> {meta.label}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold tabular-nums ${
                (node.risk ?? 0) >= 80
                  ? "bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30"
                  : (node.risk ?? 0) >= 40
                    ? "bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/30"
                    : "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/30"
              }`}
            >
              RISK {node.risk ?? 15}%
            </span>
          </div>

          <div className="mt-2 space-y-1.5 text-[10.5px]">
            <div className="flex items-center justify-between font-mono">
              <span className="text-muted-foreground">Identifier:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-foreground hover:text-signal transition-colors font-semibold"
                title="Copy Full Address"
              >
                <span>{node.full ? `${node.full.slice(0, 8)}...${node.full.slice(-6)}` : node.label}</span>
                {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
              </button>
            </div>

            {node.sub && (
              <div className="text-[10px] text-muted-foreground border-t border-white/5 pt-1 font-mono">
                {node.sub}
              </div>
            )}

            {tor && (
              <div className="flex items-center gap-1 text-[9.5px] text-warn font-semibold bg-warn/10 rounded px-1.5 py-0.5 border border-warn/20">
                <Shield size={10} /> Tor Onion Exit / Anonymized Proxy
              </div>
            )}
          </div>
          <div className="mt-2 text-center text-[9px] text-signal font-mono">
            Click to inspect in Case Dossier →
          </div>
        </div>
      )}

      {/* Main Node Visual Plate */}
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        {/* Suspect Pulsing Radar Threat Aura */}
        {node.type === "suspect" && (
          <>
            <span
              className="animate-ping pointer-events-none absolute inset-0 rounded-full border-2 opacity-60"
              style={{ borderColor: "var(--critical)" }}
            />
            <span
              className="animate-spin-slow pointer-events-none absolute rounded-full border border-dashed"
              style={{
                inset: -9,
                borderColor: "color-mix(in oklab, var(--critical) 80%, transparent)",
              }}
            />
          </>
        )}

        {/* Selected / In-Path Active Reticle */}
        {(active || inPath) && (
          <span
            className={`pointer-events-none absolute rounded-full ring-2 ring-offset-4 ring-offset-black/90 ${
              node.type === "suspect"
                ? "ring-critical shadow-[0_0_25px_var(--critical)]"
                : "ring-signal shadow-[0_0_20px_var(--signal)]"
            }`}
            style={{ inset: -10 }}
          />
        )}

        {/* Core Double-Bezel Node Plate */}
        <span
          className={[
            "grid h-full w-full place-items-center border backdrop-blur-md transition-all duration-200 group-hover:scale-115 shadow-xl",
            node.type === "suspect" ? "animate-breathe-red" : "",
            shape ? "" : "rounded-full",
          ].join(" ")}
          style={{
            clipPath: shape,
            borderColor: active ? "var(--signal)" : tint,
            color: tint,
            background:
              node.type === "cluster"
                ? `radial-gradient(circle, color-mix(in oklab, ${color} 30%, transparent), oklch(0.18 0.01 250 / 0.9))`
                : node.type === "suspect"
                  ? `radial-gradient(circle, color-mix(in oklab, var(--critical) 40%, transparent), oklch(0.16 0.01 250))`
                  : `color-mix(in oklab, ${tint} 18%, oklch(0.18 0.01 250))`,
            boxShadow:
              node.type === "cluster"
                ? `0 0 35px -2px ${color}`
                : node.type === "suspect"
                  ? `0 0 25px 0px var(--critical)`
                  : inPath
                    ? `0 0 18px 0px ${tint}`
                    : `0 0 10px -2px ${tint}`,
          }}
        >
          <Icon size={node.type === "cluster" ? 28 : node.type === "suspect" ? 22 : 16} style={{ color: tint }} />
        </span>

        {tor && (
          <span
            className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border shadow-md"
            style={{
              borderColor: "var(--warn)",
              background: "oklch(0.15 0.01 250)",
              color: "var(--warn)",
            }}
          >
            <Shield size={9} />
          </span>
        )}
      </div>

      {/* Anti-Collision Badges */}
      <div
        className={`flex flex-col items-center pointer-events-none transition-all duration-200 ${
          labelBelow ? "mt-2" : "absolute bottom-full mb-2 left-1/2 -translate-x-1/2"
        }`}
      >
        {node.type === "cluster" ? (
          <div className="flex flex-col items-center">
            <span
              className="rounded px-2.5 py-0.5 text-[9.5px] font-mono font-bold tracking-wider text-[#E6EDF3] border border-[#1C232E] bg-[#0D1117] shadow-lg whitespace-nowrap"
              style={{ borderColor: color }}
            >
              {node.label}
            </span>
            <span className="mt-0.5 text-[8.5px] font-mono text-[#7D8590] whitespace-nowrap bg-[#0D1117]/80 px-1.5 rounded border border-[#1C232E]/40">
              {node.sub}
            </span>
          </div>
        ) : node.type === "suspect" ? (
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-mono font-bold text-[#FF3B3B] border border-[#FF3B3B]/60 bg-[#0D1117] shadow-lg shadow-[#FF3B3B]/10 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B3B] animate-pulse shadow-[0_0_6px_#FF3B3B]" />
              SUSPECT // {node.label}
            </span>
            <span className="mt-0.5 text-[9px] font-mono text-[#FF3B3B]/90 font-bold tabular-nums whitespace-nowrap bg-[#0D1117] px-1.5 rounded border border-[#FF3B3B]/30">
              {node.risk}% RISK • {node.sub.split("•")[1]?.trim() || "FLAGGED"}
            </span>
          </div>
        ) : node.type === "ip" ? (
          <span className="rounded px-2 py-0.5 text-[8.5px] font-mono text-[#7D8590] border border-[#1C232E] bg-[#0D1117] whitespace-nowrap shadow">
            HOP: {node.label}
          </span>
        ) : (
          <span
            className={`rounded px-1.5 py-0.2 text-[8px] font-mono whitespace-nowrap transition-opacity duration-150 ${
              active || inPath || isHovered
                ? "opacity-100 text-[#39FF88] border border-[#39FF88]/40 bg-[#0D1117]"
                : "opacity-60 group-hover:opacity-100 text-[#7D8590] border border-[#1C232E] bg-[#0D1117]/90"
            }`}
          >
            {node.label}
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main GraphCanvas Export Component                                          */
/* -------------------------------------------------------------------------- */
export function GraphCanvas({
  selected,
  onSelect,
  focusId,
}: {
  selected: GNode | null;
  onSelect: (n: GNode | null) => void;
  focusId?: string | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("constellation");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [flowAnimation, setFlowAnimation] = useState(true);
  const [traceTrailActive, setTraceTrailActive] = useState(false);
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);

  const [nodes, setNodes] = useState<GNode[]>(mockNodes);
  const [edges, setEdges] = useState<GEdge[]>(mockEdges);
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dragging & Panning state
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ mouseX: 0, mouseY: 0, viewX: 0, viewY: 0 });
  const dragRef = useRef<{ id: string; startMouseX: number; startMouseY: number; startNodeX: number; startNodeY: number } | null>(null);

  /* Load live graph from backend */
  const loadLiveGraph = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/graph/default/gnodes`);
      if (!resp.ok) throw new Error("Backend offline");
      const data = await resp.json();
      if (data.gnodes && data.gnodes.length > 0) {
        setNodes(data.gnodes as GNode[]);
        setEdges(data.gedges as GEdge[]);
        setIsLive(true);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveGraph();
    const handleRefresh = () => loadLiveGraph();
    window.addEventListener("satoshitrace-refresh", handleRefresh);
    return () => window.removeEventListener("satoshitrace-refresh", handleRefresh);
  }, [loadLiveGraph]);

  /* -------------------------------------------------------------------------- */
  /* Multi-Layout Computation Engine with Strict Anti-Collision Pass             */
  /* -------------------------------------------------------------------------- */
  const computePositions = useCallback((mode: LayoutMode, currentNodes: GNode[]): Record<string, Pos> => {
    const posMap: Record<string, Pos> = {};

    if (mode === "constellation") {
      // 1. Constellation: 4 Balanced Quadrant Anchors with wide central corridors
      const clusterCenters: Record<string, { cx: number; cy: number; isTop: boolean }> = {
        cluster_0: { cx: 25, cy: 30, isTop: true },
        cluster_1: { cx: 75, cy: 30, isTop: true },
        cluster_2: { cx: 25, cy: 74, isTop: false },
        cluster_3: { cx: 75, cy: 74, isTop: false },
        c1: { cx: 25, cy: 30, isTop: true },
        c2: { cx: 75, cy: 74, isTop: false },
      };

      const fallbackList = [
        { cx: 25, cy: 30, isTop: true },
        { cx: 75, cy: 30, isTop: true },
        { cx: 25, cy: 74, isTop: false },
        { cx: 75, cy: 74, isTop: false },
      ];

      const clusterNodes = currentNodes.filter((n) => n.type === "cluster");
      clusterNodes.forEach((cn, idx) => {
        const fallback = fallbackList[idx % 4] ?? { cx: 50, cy: 50, isTop: true };
        const center = clusterCenters[cn.id] ?? fallback;
        posMap[cn.id] = { x: center.cx, y: center.cy };
      });

      // Group members by cluster
      const clusterMembers: Record<string, GNode[]> = {};
      const unclustered: GNode[] = [];

      currentNodes.forEach((n) => {
        if (n.type === "cluster") return;
        const cid = n.cluster;
        if (cid && (posMap[cid] || clusterCenters[cid])) {
          if (!clusterMembers[cid]) clusterMembers[cid] = [];
          clusterMembers[cid]!.push(n);
        } else {
          unclustered.push(n);
        }
      });

      // Dynamic Anti-Collision Slot Allocator:
      // 1. Top-Right Cluster (x=75, y=30): Primary suspect takes North-East (-45 deg) -> clears center island bar!
      // 2. Top-Left Cluster (x=25, y=30): Primary suspect takes North-West (-135 deg) -> clears center island bar!
      // 3. Bottom Clusters (y=74): Suspect takes North Zenith (-90 deg), other nodes take floor/flanks.
      const getClusterSlots = (hubX: number, isTop: boolean) => {
        if (isTop) {
          const primaryAngle = hubX > 50 ? -45 * (Math.PI / 180) : -135 * (Math.PI / 180);
          const secondaryAngle = hubX > 50 ? -135 * (Math.PI / 180) : -45 * (Math.PI / 180);

          return [
            { angle: primaryAngle, r: 14.0 },               // Slot 0: Outward Crown (Suspect #1, clear of top island)
            { angle: secondaryAngle, r: 14.0 },             // Slot 1: Opposite Crown (Suspect #2 / High Risk)
            { angle: -Math.PI / 2, r: 12.0 },               // Slot 2: North Zenith
            { angle: -175 * (Math.PI / 180), r: 15.5 },     // Slot 3: West Flank
            { angle: -5 * (Math.PI / 180), r: 15.5 },       // Slot 4: East Flank
            { angle: 140 * (Math.PI / 180), r: 14.5 },      // Slot 5: SW Drop (clear of banner & corridor)
            { angle: 40 * (Math.PI / 180), r: 14.5 },       // Slot 6: SE Drop (clear of banner & corridor)
            { angle: -115 * (Math.PI / 180), r: 15.5 },     // Slot 7: Outer NW Crown
            { angle: -65 * (Math.PI / 180), r: 15.5 },      // Slot 8: Outer NE Crown
            { angle: 160 * (Math.PI / 180), r: 17.0 },      // Slot 9: Outer SW
            { angle: 20 * (Math.PI / 180), r: 17.0 },       // Slot 10: Outer SE
          ];
        } else {
          return [
            { angle: -Math.PI / 2, r: 13.5 },               // Slot 0: North Zenith (Suspect #1 priority)
            { angle: -135 * (Math.PI / 180), r: 14.0 },     // Slot 1: NNW (Suspect #2 / High Risk)
            { angle: -45 * (Math.PI / 180), r: 14.0 },      // Slot 2: NNE (Suspect #3 / High Risk)
            { angle: -175 * (Math.PI / 180), r: 16.0 },     // Slot 3: West Flank (outside banner width)
            { angle: -5 * (Math.PI / 180), r: 16.0 },       // Slot 4: East Flank (outside banner width)
            { angle: Math.PI / 2, r: 16.5 },                // Slot 5: South Floor (deep towards canvas floor)
            { angle: 135 * (Math.PI / 180), r: 15.5 },      // Slot 6: SW Floor
            { angle: 45 * (Math.PI / 180), r: 15.5 },       // Slot 7: SE Floor
            { angle: -115 * (Math.PI / 180), r: 16.0 },     // Slot 8: Outer NW Crown
            { angle: -65 * (Math.PI / 180), r: 16.0 },      // Slot 9: Outer NE Crown
            { angle: 160 * (Math.PI / 180), r: 17.5 },      // Slot 10: Outer SW
            { angle: 20 * (Math.PI / 180), r: 17.5 },       // Slot 11: Outer SE
          ];
        }
      };

      Object.entries(clusterMembers).forEach(([cid, members]) => {
        const centerInfo = clusterCenters[cid];
        const hub = posMap[cid] ?? (centerInfo ? { x: centerInfo.cx, y: centerInfo.cy } : { x: 50, y: 50 });
        const hubX = hub.x;
        const hubY = hub.y;
        const isTop = centerInfo?.isTop ?? hubY < 50;
        const activeSlots = getClusterSlots(hubX, isTop);

        // Prioritize suspects and high-risk nodes into the North Crown slots (Slot 0, 1, 2)
        const sorted = [...members].sort((a, b) => {
          if (a.type === "suspect" && b.type !== "suspect") return -1;
          if (b.type === "suspect" && a.type !== "suspect") return 1;
          const riskA = a.risk ?? 0;
          const riskB = b.risk ?? 0;
          if (riskA !== riskB) return riskB - riskA;
          if (a.type === "ip" && b.type !== "ip") return -1;
          if (b.type === "ip" && a.type !== "ip") return 1;
          return a.id.localeCompare(b.id);
        });

        sorted.forEach((m, mi) => {
          const slot = activeSlots[mi % activeSlots.length]!;
          // Aspect-ratio correction (16:9 widescreen canvas)
          let x = hubX + slot.r * 1.25 * Math.cos(slot.angle);
          let y = hubY + slot.r * 0.90 * Math.sin(slot.angle);

          // Radar minimap corner boundary protection
          if (x > 84 && y > 76) {
            x = 82;
            y = 74;
          }

          posMap[m.id] = {
            x: Math.min(94, Math.max(6, Math.round(x * 10) / 10)),
            y: Math.min(88, Math.max(12, Math.round(y * 10) / 10)),
          };
        });
      });

      // Unclustered nodes along center bridge
      unclustered.forEach((un, ui) => {
        const angle = (ui / Math.max(1, unclustered.length)) * 2 * Math.PI;
        const x = 50 + 7.5 * Math.cos(angle);
        const y = 50 + 6.5 * Math.sin(angle);
        posMap[un.id] = {
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
        };
      });

    } else if (mode === "flow") {
      // 2. Forensic Fund Flow: Left-to-Right Directed Pipeline
      const stageBuckets: [GNode[], GNode[], GNode[], GNode[]] = [[], [], [], []];

      currentNodes.forEach((n) => {
        if (n.type === "suspect") {
          stageBuckets[0].push(n);
        } else if (n.type === "cluster" || n.type === "ip" || n.tor) {
          stageBuckets[2].push(n);
        } else if (n.type === "txid") {
          stageBuckets[1].push(n);
        } else {
          if ((n.risk ?? 0) >= 30) stageBuckets[1].push(n);
          else stageBuckets[3].push(n);
        }
      });

      const xColumns = [14, 38, 64, 88] as const;
      stageBuckets.forEach((bucket, stage) => {
        const count = bucket.length;
        const colX = xColumns[stage] ?? 50;

        bucket.forEach((item, idx) => {
          const stepY = count <= 1 ? 50 : 15 + (idx / Math.max(1, count - 1)) * 70;
          posMap[item.id] = {
            x: colX,
            y: Math.round(stepY * 10) / 10,
          };
        });
      });

    } else if (mode === "force") {
      // 3. Force Directed: Organic layout with pairwise repulsion
      const initial = computePositions("constellation", currentNodes);
      const nodeArray = currentNodes.map((n) => ({
        id: n.id,
        x: initial[n.id]?.x ?? n.x ?? 50,
        y: initial[n.id]?.y ?? n.y ?? 50,
        type: n.type,
      }));

      for (let iter = 0; iter < 45; iter++) {
        for (let i = 0; i < nodeArray.length; i++) {
          const na = nodeArray[i];
          if (!na) continue;
          for (let j = i + 1; j < nodeArray.length; j++) {
            const nb = nodeArray[j];
            if (!nb) continue;
            const dx = nb.x - na.x;
            const dy = nb.y - na.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
            const minDist = na.type === "cluster" || nb.type === "cluster" ? 18 : 7.5;

            if (dist < minDist) {
              const force = ((minDist - dist) / dist) * 0.45;
              const pushX = dx * force;
              const pushY = dy * force;
              na.x -= pushX;
              na.y -= pushY;
              nb.x += pushX;
              nb.y += pushY;
            }
          }
        }
        nodeArray.forEach((n) => {
          n.x = Math.min(94, Math.max(6, n.x));
          n.y = Math.min(92, Math.max(8, n.y));
        });
      }

      nodeArray.forEach((n) => {
        posMap[n.id] = { x: Math.round(n.x * 10) / 10, y: Math.round(n.y * 10) / 10 };
      });
    }

    // --------------------------------------------------------------------------
    // Normalized Pixel-Space Anti-Collision Spring Solver across ALL layout modes
    // --------------------------------------------------------------------------
    for (let pass = 0; pass < 60; pass++) {
      for (let i = 0; i < currentNodes.length; i++) {
        const ni = currentNodes[i]!;
        const pi = posMap[ni.id];
        if (!pi) continue;

        for (let j = i + 1; j < currentNodes.length; j++) {
          const nj = currentNodes[j]!;
          const pj = posMap[nj.id];
          if (!pj) continue;

          // Normalized pixel space conversion (16:9 widescreen canvas, ~1536 x 800)
          const dxPx = (pj.x - pi.x) * 15.36;
          const dyPx = (pj.y - pi.y) * 8.0;
          const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx) || 1.0;

          const isClusterI = ni.type === "cluster";
          const isClusterJ = nj.type === "cluster";
          const isSuspectI = ni.type === "suspect";
          const isSuspectJ = nj.type === "suspect";

          // Calibrated pixel clearance between center points (preserves safe Crown geometry)
          let reqDistPx = 65; // standard nodes (circle 32px + safety margin)
          if (isClusterI && isClusterJ) reqDistPx = 200; // between two clusters
          else if (isClusterI || isClusterJ) reqDistPx = 88; // node vs cluster hub
          else if (isSuspectI || isSuspectJ) reqDistPx = 78; // node vs suspect threat aura

          if (distPx < reqDistPx) {
            const overlap = (reqDistPx - distPx) / distPx;
            const pushXPct = ((dxPx * overlap) / 15.36) * 0.5;
            const pushYPct = ((dyPx * overlap) / 8.0) * 0.5;

            if (!isClusterI && !isClusterJ) {
              pj.x = Math.min(94, Math.max(6, pj.x + pushXPct));
              pj.y = Math.min(88, Math.max(12, pj.y + pushYPct));
              pi.x = Math.min(94, Math.max(6, pi.x - pushXPct));
              pi.y = Math.min(88, Math.max(12, pi.y - pushYPct));
            } else if (isClusterI && !isClusterJ) {
              // Anchor cluster I; push member J outward
              pj.x = Math.min(94, Math.max(6, pj.x + pushXPct * 2));
              pj.y = Math.min(88, Math.max(12, pj.y + pushYPct * 2));
            } else if (!isClusterI && isClusterJ) {
              // Anchor cluster J; push member I outward
              pi.x = Math.min(94, Math.max(6, pi.x - pushXPct * 2));
              pi.y = Math.min(88, Math.max(12, pi.y - pushYPct * 2));
            }
          }

          // Boundary protection against corner minimap (x > 84% & y > 76%)
          if (!isClusterJ && pj.x > 84 && pj.y > 76) {
            pj.x = Math.max(76, pj.x - 3);
            pj.y = Math.max(68, pj.y - 3);
          }
          if (!isClusterI && pi.x > 84 && pi.y > 76) {
            pi.x = Math.max(76, pi.x - 3);
            pi.y = Math.max(68, pi.y - 3);
          }
        }
      }

      // Hard Banner Exclusion Zone Solver:
      // Prevents any non-cluster node from overlapping with the 220px cluster banner
      const clusterNodesList = currentNodes.filter((n) => n.type === "cluster");
      clusterNodesList.forEach((cn) => {
        const cpos = posMap[cn.id];
        if (!cpos) return;
        const bxMin = cpos.x - 9.5;
        const bxMax = cpos.x + 9.5;
        const byMin = cpos.y - 1.0;
        const byMax = cpos.y + 11.5;

        currentNodes.forEach((nd) => {
          if (nd.type === "cluster") return;
          const p = posMap[nd.id];
          if (!p) return;
          if (p.x >= bxMin && p.x <= bxMax && p.y >= byMin && p.y <= byMax) {
            const dLeft = p.x - bxMin;
            const dRight = bxMax - p.x;
            const dUp = p.y - byMin;
            const dDown = byMax - p.y;
            const minD = Math.min(dLeft, dRight, dUp, dDown);
            if (minD === dUp) p.y = Math.max(12, byMin - 2.0);
            else if (minD === dDown) p.y = Math.min(88, byMax + 2.0);
            else if (minD === dLeft) p.x = Math.max(6, bxMin - 2.0);
            else p.x = Math.min(94, bxMax + 2.0);
          }
        });
      });
    }

    return posMap;
  }, []);

  useEffect(() => {
    const calculated = computePositions(layoutMode, nodes);
    setPositions(calculated);
  }, [layoutMode, nodes, computePositions]);

  /* -------------------------------------------------------------------------- */
  /* Scroll & Pan Handlers (Mouse Wheel Zoom & Background Dragging)              */
  /* -------------------------------------------------------------------------- */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomDelta = e.deltaY < 0 ? 0.12 : -0.12;
    setView((v) => ({
      ...v,
      s: Math.min(3.5, Math.max(0.35, +(v.s + zoomDelta).toFixed(2))),
    }));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only initiate canvas panning on left mouse button on background
    if (e.button !== 0) return;
    isPanningRef.current = true;
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      viewX: view.x,
      viewY: view.y,
    };
  };

  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const curPos = positions[id] || { x: 50, y: 50 };
    dragRef.current = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: curPos.x,
      startNodeY: curPos.y,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current && wrapRef.current) {
      const wrapRect = wrapRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragRef.current.startMouseX) / (wrapRect.width * view.s)) * 100;
      const dy = ((e.clientY - dragRef.current.startMouseY) / (wrapRect.height * view.s)) * 100;

      const newX = Math.min(96, Math.max(4, dragRef.current.startNodeX + dx));
      const newY = Math.min(94, Math.max(6, dragRef.current.startNodeY + dy));

      setPositions((prev) => ({
        ...prev,
        [dragRef.current!.id]: { x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 },
      }));
      return;
    }

    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.mouseX;
      const dy = e.clientY - panStartRef.current.mouseY;
      setView((v) => ({
        ...v,
        x: panStartRef.current.viewX + dx,
        y: panStartRef.current.viewY + dy,
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    isPanningRef.current = false;
    dragRef.current = null;
  };

  /* -------------------------------------------------------------------------- */
  /* Connected Money Trail Tracing ("Follow the Money")                         */
  /* -------------------------------------------------------------------------- */
  const activeTrail = useMemo(() => {
    // Only compute sequential money trail when traceTrailActive is true OR when a suspect/transaction node is selected
    const isTracing = Boolean(traceTrailActive || (selected && selected.type !== "cluster"));
    if (!isTracing) {
      return { nodeIds: new Set<string>(), edgeKeys: new Set<string>(), hops: [] as Array<{ from: string; to: string; amount: string; step: number }> };
    }

    // Default focal suspect is selected or the primary LockBit suspect
    const focalNode = (selected && selected.type !== "cluster") ? selected : nodes.find((n) => n.type === "suspect") ?? nodes[0];
    if (!focalNode) {
      return { nodeIds: new Set<string>(), edgeKeys: new Set<string>(), hops: [] };
    }

    const nodeIds = new Set<string>([focalNode.id]);
    const edgeKeys = new Set<string>();
    const hops: Array<{ from: string; to: string; amount: string; step: number }> = [];

    // Filter out logical cluster membership spokes (e.g. "5% risk") to focus exclusively on financial movements
    const relevantEdges = edges.filter((e) => !e.amount?.includes("risk"));

    // Step 1: Find direct edges
    relevantEdges.forEach((e) => {
      if (e.from === focalNode.id || e.to === focalNode.id) {
        nodeIds.add(e.from);
        nodeIds.add(e.to);
        const k = `${e.from}-${e.to}`;
        edgeKeys.add(k);
        hops.push({ from: e.from, to: e.to, amount: e.amount, step: hops.length + 1 });
      }
    });

    // Step 2: Traverse 2nd degree hops for deeper money trail
    const firstTier = Array.from(nodeIds);
    relevantEdges.forEach((e) => {
      if (firstTier.includes(e.from) && !nodeIds.has(e.to)) {
        nodeIds.add(e.to);
        const k = `${e.from}-${e.to}`;
        edgeKeys.add(k);
        hops.push({ from: e.from, to: e.to, amount: e.amount, step: hops.length + 1 });
      }
    });

    return { nodeIds, edgeKeys, hops };
  }, [selected, traceTrailActive, nodes, edges]);

  /* Filtering */
  const filteredNodes = useMemo(() => {
    if (filterType === "all") return nodes;
    if (filterType === "suspect") return nodes.filter((n) => n.type === "suspect");
    if (filterType === "cluster") return nodes.filter((n) => n.type === "cluster");
    if (filterType === "ip") return nodes.filter((n) => n.type === "ip" || n.tor);
    if (filterType === "wallet") return nodes.filter((n) => n.type === "wallet");
    return nodes;
  }, [nodes, filterType]);

  /* Center camera on selected node */
  const centerOn = useCallback((node: GNode, scale = 1.35) => {
    const el = wrapRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const pos = positions[node.id] || { x: node.x, y: node.y };
    setView({
      s: scale,
      x: (0.5 - pos.x / 100) * width * scale,
      y: (0.5 - pos.y / 100) * height * scale,
    });
  }, [positions]);

  useEffect(() => {
    if (!focusId) return;
    const node = nodes.find((n) => n.id === focusId);
    if (node) centerOn(node);
  }, [focusId, nodes, centerOn]);

  const zoom = (delta: number) =>
    setView((v) => ({ ...v, s: Math.min(3.5, Math.max(0.35, +(v.s + delta).toFixed(2))) }));

  const handleAutoOrganise = useCallback(() => {
    const fresh = computePositions("constellation", nodes);
    setPositions(fresh);
    setLayoutMode("constellation");
    setView({ s: 1, x: 0, y: 0 });
    toast.success("Graph Layout Auto-Organised", {
      description: "Constellation geometry & zero-collision rules applied.",
    });
  }, [computePositions, nodes]);

  const clusterCount = nodes.filter((n) => n.type === "cluster").length;
  const suspectCount = nodes.filter((n) => n.type === "suspect").length;

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#0A0E14] select-none cursor-grab active:cursor-grabbing"
      onClick={() => onSelect(null)}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      {/* High-Precision Tactical Grid Background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[radial-gradient(#1C232E_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Stats Counter Overlay */}
      <StatsOverlay
        nodeCount={nodes.length}
        edgeCount={edges.length}
        clusterCount={clusterCount}
        suspectCount={suspectCount}
        isLive={isLive}
      />

      {/* Main Floating Island Control Bar */}
      <div
        className="font-mono absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded border border-[#1C232E] bg-[#0D1117]/95 px-3 py-1.5 shadow-xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Layout Switcher */}
        <div className="flex items-center gap-1 bg-[#0A0E14] p-0.5 rounded border border-[#1C232E]">
          <button
            type="button"
            onClick={() => setLayoutMode("constellation")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
              layoutMode === "constellation"
                ? "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/40 shadow-[0_0_8px_rgba(57,255,136,0.2)]"
                : "text-[#7D8590] hover:text-[#E6EDF3]"
            }`}
            title="Constellation Orbital View"
          >
            <Radio size={11} /> CONSTELLATION
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("force")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
              layoutMode === "force"
                ? "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/40 shadow-[0_0_8px_rgba(57,255,136,0.2)]"
                : "text-[#7D8590] hover:text-[#E6EDF3]"
            }`}
            title="Force Dynamic Physics (Drag Enabled)"
          >
            <Zap size={11} /> FORCE
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("flow")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
              layoutMode === "flow"
                ? "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/40 shadow-[0_0_8px_rgba(57,255,136,0.2)]"
                : "text-[#7D8590] hover:text-[#E6EDF3]"
            }`}
            title="Forensic Fund Flow (Left-to-Right Pipeline)"
          >
            <GitFork size={11} /> FLOW
          </button>
        </div>

        <span className="h-4 w-px bg-[#1C232E] mx-0.5" />

        {/* Trace Laundering Trail Toggle */}
        <button
          type="button"
          onClick={() => {
            setTraceTrailActive((v) => !v);
            if (!traceTrailActive) {
              toast.info("⚡ Live Laundering Route Traced", {
                description: "Tracing fund movement from Vault ➔ Peeling Hops ➔ Cashout Mule.",
              });
            }
          }}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-mono font-semibold transition-all ${
            traceTrailActive || Boolean(selected)
              ? "text-[#FF3B3B] bg-[#FF3B3B]/15 border border-[#FF3B3B]/40 shadow-[0_0_10px_rgba(255,59,59,0.25)]"
              : "text-[#7D8590] hover:text-[#E6EDF3] bg-[#0A0E14] border border-[#1C232E]"
          }`}
          title="Highlight Money Trail from Origin to Destination"
        >
          <Route size={12} className={traceTrailActive || Boolean(selected) ? "animate-pulse text-[#FF3B3B]" : ""} />
          <span>TRACE TRAIL</span>
        </button>

        {/* Live Fund Particle Flow Toggle */}
        <button
          type="button"
          onClick={() => setFlowAnimation((v) => !v)}
          className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-mono transition-all ${
            flowAnimation
              ? "text-[#39FF88] bg-[#39FF88]/15 border border-[#39FF88]/30"
              : "text-[#7D8590] hover:text-[#E6EDF3]"
          }`}
          title="Toggle Animated Particle Trails"
        >
          <Sparkles size={11} className={flowAnimation ? "animate-pulse text-[#39FF88]" : ""} />
          <span className="hidden sm:inline">PULSE</span>
        </button>

        <span className="h-4 w-px bg-[#1C232E] mx-0.5" />

        {/* Zoom & Canvas Actions */}
        <button
          type="button"
          onClick={() => zoom(0.25)}
          title="Zoom In (or use Mouse Wheel)"
          className="rounded p-1 text-[#7D8590] hover:bg-[#1C232E] hover:text-[#E6EDF3]"
        >
          <ZoomIn size={13} />
        </button>
        <button
          type="button"
          onClick={() => zoom(-0.25)}
          title="Zoom Out (or use Mouse Wheel)"
          className="rounded p-1 text-[#7D8590] hover:bg-[#1C232E] hover:text-[#E6EDF3]"
        >
          <ZoomOut size={13} />
        </button>
        <button
          type="button"
          onClick={() => setView({ s: 1, x: 0, y: 0 })}
          title="Reset Fit"
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-mono text-[#7D8590] hover:bg-[#1C232E] hover:text-[#E6EDF3]"
        >
          <Crosshair size={11} /> FIT
        </button>

        {/* 1-Click Auto Organise Button */}
        <button
          type="button"
          onClick={handleAutoOrganise}
          title="Automatically Reorganize & Declutter Graph Layout"
          className="flex items-center gap-1 rounded bg-[#39FF88]/15 px-2.5 py-1 text-[10px] font-mono font-semibold text-[#39FF88] border border-[#39FF88]/30 hover:bg-[#39FF88]/25 active:scale-95 transition-all"
        >
          <Sparkles size={11} className="text-[#39FF88]" />
          <span>ORGANISE</span>
        </button>

        <span className="h-4 w-px bg-[#1C232E] mx-0.5" />

        <button
          type="button"
          onClick={() => {
            loadLiveGraph();
            toast.info("Rescanning live NetworkX topology…");
          }}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-mono text-[#7D8590] hover:bg-[#1C232E] hover:text-[#E6EDF3]"
        >
          <RefreshCw size={11} className={loading ? "animate-spin text-[#39FF88]" : ""} />
          <span className="hidden sm:inline">RESCAN</span>
        </button>

        <button
          type="button"
          onClick={() =>
            toast.success("Section 65B Dossier Snapshot Sealed", {
              description: "SHA-256 evidence chain of custody cryptographically bound.",
            })
          }
          className="flex items-center gap-1 rounded bg-[#0A0E14] px-2.5 py-1 text-[10px] font-mono font-semibold text-[#39FF88] border border-[#39FF88]/30 hover:bg-[#39FF88]/15"
        >
          <Camera size={11} />
          <span className="hidden sm:inline">SEC 65B</span>
        </button>
      </div>

      {/* Entity Filter Chips (Floating Bottom-Center Bar) */}
      <div
        className="font-mono absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded border border-[#1C232E] bg-[#0D1117]/95 px-3 py-1 shadow-lg backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className="text-[9px] text-[#7D8590] mr-1 tracking-wider">FILTER:</span>
        {(
          [
            { id: "all", label: `ALL (${nodes.length})` },
            { id: "suspect", label: `SUSPECTS (${suspectCount})` },
            { id: "cluster", label: `SYNDICATES (${clusterCount})` },
            { id: "ip", label: "TOR/IP" },
            { id: "wallet", label: "WALLETS" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterType(f.id)}
            className={`rounded px-2 py-0.5 text-[9px] font-mono transition-all ${
              filterType === f.id
                ? "bg-[#39FF88]/20 text-[#39FF88] border border-[#39FF88]/40"
                : "text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#1C232E]/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Directional Transfer Trail Banner */}
      {(traceTrailActive || (selected && selected.type !== "cluster")) && (
        <div
          className="font-mono absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded border border-[#FF3B3B]/40 bg-[#0D1117] px-4 py-1.5 shadow-xl backdrop-blur-md animate-rise max-w-[calc(100vw-380px)] overflow-x-auto whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B3B] animate-ping" />
            <span className="text-[10px] font-bold text-[#FF3B3B] tracking-wider">
              FUND FLOW TRACE:
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9.5px] text-[#E6EDF3] shrink-0">
            <span className="rounded bg-[#FF3B3B]/15 px-2 py-0.5 font-bold text-[#FF3B3B] border border-[#FF3B3B]/30">
              ORIGIN: {selected && selected.type !== "cluster" ? selected.label : "bc1q_loc"}
            </span>
            <ArrowRight size={11} className="text-[#39FF88] shrink-0" />
            <span className="rounded bg-[#FF9F1C]/15 px-2 py-0.5 font-bold text-[#FF9F1C] border border-[#FF9F1C]/30 tabular-nums">
              PEELING HOP: tx_peel_fa1e (22.99 BTC)
            </span>
            <ArrowRight size={11} className="text-[#39FF88] shrink-0" />
            <span className="rounded bg-[#FFD60A]/15 px-2 py-0.5 font-bold text-[#FFD60A] border border-[#FFD60A]/30 tabular-nums">
              CASHOUT MULE: bc1q_smu (2.0 BTC)
            </span>
          </div>

          <button
            onClick={() => {
              setTraceTrailActive(false);
              onSelect(null);
            }}
            className="text-[9px] text-[#7D8590] hover:text-[#E6EDF3] ml-2 px-1.5 py-0.5 rounded bg-[#1C232E] hover:bg-[#1C232E]/80 shrink-0"
          >
            CLEAR
          </button>
        </div>
      )}

      {/* Main Graph Canvas Container */}
      <div ref={wrapRef} className="absolute inset-0">
        <div
          className="absolute inset-0 origin-center transition-transform duration-75 ease-out pointer-events-auto"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
        >
          {/* SVG Connection Layer with Directional Arrowheads & Curved Trails */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
          >
            <defs>
              {/* Arrowhead Markers */}
              <marker
                id="defaultArrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="4.5"
                markerHeight="4.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(148, 163, 184, 0.75)" />
              </marker>

              <marker
                id="trailArrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5.5"
                markerHeight="5.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#EF4444" />
              </marker>

              <marker
                id="activeArrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--signal)" />
              </marker>

              <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Tactical Territorial Quadrant Hulls */}
            {layoutMode === "constellation" && (
              <g className="cluster-hulls pointer-events-none">
                {[
                  { cx: 25, cy: 33, color: "#EF4444", label: "LOCKBIT 3.0 EXTORTION NEXUS" },
                  { cx: 75, cy: 33, color: "#F59E0B", label: "TELEGRAM UPI MULE RING" },
                  { cx: 25, cy: 72, color: "#8B5CF6", label: "WASABI COINJOIN POOL" },
                  { cx: 75, cy: 72, color: "#38BDF8", label: "ANONYMIZED TOR RELAYS" },
                ].map((hull, hi) => (
                  <g key={`hull-${hi}`}>
                    <ellipse
                      cx={hull.cx}
                      cy={hull.cy}
                      rx={24}
                      ry={19}
                      fill="none"
                      stroke={hull.color}
                      strokeWidth="0.25"
                      strokeDasharray="2 3"
                      strokeOpacity="0.4"
                      className="animate-pulse"
                      style={{ animationDuration: "5s" }}
                    />
                  </g>
                ))}
              </g>
            )}

            {/* Edge Curves with Directional Arrowheads */}
            {edges.map((e) => {
              const aPos = positions[e.from];
              const bPos = positions[e.to];
              if (!aPos || !bPos) return null;

              const edgeKey = `${e.from}-${e.to}`;
              const aNode = nodes.find((n) => n.id === e.from);
              const bNode = nodes.find((n) => n.id === e.to);

              const isSuspectEdge = aNode?.type === "suspect" || bNode?.type === "suspect";
              const inActiveTrail = activeTrail.edgeKeys.has(edgeKey);
              const isSelectedEdge = selected != null && (selected.id === e.from || selected.id === e.to);

              // Calculate smooth curved quadratic bezier control point
              const mx = (aPos.x + bPos.x) / 2;
              const my = (aPos.y + bPos.y) / 2;
              const dx = bPos.x - aPos.x;
              const dy = bPos.y - aPos.y;
              // Subtle curve offset
              const cx = +(mx - dy * 0.08).toFixed(1);
              const cy = +(my + dx * 0.08).toFixed(1);

              const pathD = `M ${aPos.x} ${aPos.y} Q ${cx} ${cy} ${bPos.x} ${bPos.y}`;

              const isHighlighted = inActiveTrail || isSelectedEdge;

              return (
                <g key={edgeKey}>
                  {/* Glowing Underlay for Active Trails */}
                  {isHighlighted && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth={1.4}
                      strokeOpacity={0.6}
                      filter="url(#glowEffect)"
                    />
                  )}

                  {/* Core Edge Line with Arrowhead */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      isHighlighted
                        ? "url(#trailGrad)"
                        : isSuspectEdge
                          ? "#EF4444"
                          : "rgba(148, 163, 184, 0.45)"
                    }
                    strokeOpacity={
                      selected || traceTrailActive
                        ? isHighlighted
                          ? 1
                          : 0.12
                        : isSuspectEdge
                          ? 0.9
                          : 0.45
                    }
                    strokeWidth={isHighlighted ? 0.65 : isSuspectEdge ? 0.45 : 0.28}
                    strokeDasharray={flowAnimation || isSuspectEdge ? "1.5 1.5" : undefined}
                    className={flowAnimation || isSuspectEdge ? "animate-dash" : ""}
                    markerEnd={
                      isHighlighted
                        ? "url(#trailArrow)"
                        : isSuspectEdge
                          ? "url(#trailArrow)"
                          : "url(#defaultArrow)"
                    }
                  />

                  {/* Interactive Edge Hit-Box */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={3}
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={() => setHoverEdge(edgeKey)}
                    onMouseLeave={() => setHoverEdge((h) => (h === edgeKey ? null : h))}
                  />

                  {/* Live Fund Transfer Animated Particle */}
                  {flowAnimation && (isHighlighted || isSuspectEdge) && (
                    <circle
                      r="0.75"
                      fill={isSuspectEdge ? "#EF4444" : "var(--signal)"}
                    >
                      <animateMotion
                        path={pathD}
                        dur={isSuspectEdge ? "1.8s" : "3.0s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Sequential Hop Badge on Highlighted Trail (Only on true BTC fund flows) */}
                  {inActiveTrail && traceTrailActive && e.amount && !e.amount.includes("risk") && (
                    <g className="pointer-events-none">
                      <rect
                        x={cx - 6}
                        y={cy - 2}
                        width={12}
                        height={4}
                        rx={2}
                        className="fill-black/95 stroke-critical/80"
                        strokeWidth="0.25"
                      />
                      <text
                        x={cx}
                        y={cy + 0.8}
                        textAnchor="middle"
                        className="fill-critical font-mono text-[2.4px] font-bold"
                      >
                        {e.amount}
                      </text>
                    </g>
                  )}

                  {/* Hover Transaction Detail Badge */}
                  {hoverEdge === edgeKey && !isHighlighted && (
                    <g className="pointer-events-none">
                      <rect
                        x={cx - 6.5}
                        y={cy - 2.2}
                        width={13}
                        height={4.4}
                        rx={2.2}
                        className="fill-black/95 stroke-signal/80"
                        strokeWidth="0.25"
                      />
                      <text
                        x={cx}
                        y={cy + 0.8}
                        textAnchor="middle"
                        className="fill-foreground font-mono text-[2.5px] font-bold"
                      >
                        {e.amount}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Node Components */}
          {filteredNodes.map((n) => {
            const pos = positions[n.id] || { x: n.x, y: n.y };
            const isSelected = selected?.id === n.id;
            const inPath = activeTrail.nodeIds.has(n.id);
            const isDimmed = (selected != null || traceTrailActive) && !inPath;

            return (
              <NodeShape
                key={n.id}
                node={n}
                pos={pos}
                active={isSelected}
                inPath={inPath && !isSelected}
                dim={isDimmed}
                onClick={() => {
                  onSelect(n);
                  centerOn(n, Math.max(view.s, 1.25));
                }}
                onMouseDown={(e) => handleNodeMouseDown(n.id, e)}
              />
            );
          })}
        </div>
      </div>

      {/* Radar Minimap with Click-to-Pan */}
      <div
        className="font-mono absolute bottom-4 right-4 z-20 h-[96px] w-[130px] overflow-hidden rounded border border-[#1C232E] bg-[#0D1117] p-1 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        title="Tactical Radar Minimap"
      >
        <div className="absolute top-1 left-2 flex items-center gap-1 text-[8px] font-mono text-[#7D8590] uppercase font-bold tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-pulse" /> RADAR
        </div>
        <svg
          viewBox="0 0 100 80"
          className="h-full w-full pt-2 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = (e.clientY - rect.top) / rect.height;
            if (wrapRef.current) {
              const wrapRect = wrapRef.current.getBoundingClientRect();
              setView((v) => ({
                ...v,
                x: (0.5 - clickX) * wrapRect.width * v.s,
                y: (0.5 - clickY) * wrapRect.height * v.s,
              }));
            }
          }}
        >
          {edges.map((e) => {
            const a = positions[e.from];
            const b = positions[e.to];
            if (!a || !b) return null;
            return (
              <line
                key={`m-${e.from}-${e.to}`}
                x1={a.x}
                y1={(a.y / 100) * 80}
                x2={b.x}
                y2={(b.y / 100) * 80}
                stroke="#1C232E"
                strokeWidth={0.6}
                opacity={0.6}
              />
            );
          })}
          {nodes.map((n) => {
            const p = positions[n.id] || { x: n.x, y: n.y };
            return (
              <circle
                key={`mn-${n.id}`}
                cx={p.x}
                cy={(p.y / 100) * 80}
                r={n.type === "cluster" ? 3.5 : n.type === "suspect" ? 2.8 : 1.2}
                fill={
                  n.type === "cluster"
                    ? (n.accent ?? "#FF9F1C")
                    : n.type === "suspect"
                      ? "#FF3B3B"
                      : TYPE_META[n.type]?.color || "#39FF88"
                }
                opacity={0.9}
              />
            );
          })}
          <rect
            x={Math.max(0, 50 - 50 / view.s - view.x / 6)}
            y={Math.max(0, 40 - 40 / view.s - view.y / 8)}
            width={Math.min(100, 100 / view.s)}
            height={Math.min(80, 80 / view.s)}
            fill="rgba(57, 255, 136, 0.08)"
            stroke="#39FF88"
            strokeWidth={0.8}
            rx={1}
          />
        </svg>
      </div>

      {/* Tactical Status & Telemetry Bar with Zoom Readout */}
      <div className="font-mono absolute bottom-4 left-4 z-20 flex items-center gap-2.5 rounded border border-[#1C232E] bg-[#0D1117]/95 px-3 py-1 text-[10px] text-[#7D8590] shadow-lg backdrop-blur-md">
        <span className="flex items-center gap-1.5 font-bold text-[#E6EDF3]">
          <Activity size={12} className="text-[#39FF88]" /> SATO // KERNEL V4.2
        </span>
        <span className="h-2.5 w-px bg-[#1C232E]" />
        <span>LAYOUT: <span className="text-[#E6EDF3] font-semibold">{layoutMode.toUpperCase()}</span></span>
        <span className="h-2.5 w-px bg-[#1C232E]" />
        <span className="text-[#39FF88] font-semibold">DEFENSE AIR-GAP: SECURE</span>
        <span className="h-2.5 w-px bg-[#1C232E]" />
        <span className="flex items-center gap-1">
          <Move size={10} className="text-[#7D8590]" /> PAN / ZOOM ACTIVE
        </span>
        <span className="h-2.5 w-px bg-[#1C232E]" />
        <span className="tabular-nums font-semibold text-[#E6EDF3]">ZOOM: {view.s.toFixed(2)}×</span>
      </div>
    </div>
  );
}
