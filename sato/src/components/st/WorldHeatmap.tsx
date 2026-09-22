import { useEffect, useState } from "react";
import { hotspots } from "@/lib/mock-data";
import { fetchAlerts } from "@/lib/api";

const LEGEND = [
  { label: "CLEAN (GREEN)", color: "#39FF88" },
  { label: "MONITORED (YELLOW)", color: "#FFD60A" },
  { label: "SUSPECT (ORANGE)", color: "#FF9F1C" },
  { label: "CRITICAL (RED)", color: "#FF3B3B" },
];

const COUNTRY_COORDS: Record<string, { x: number; y: number; name: string }> = {
  "🇮🇳": { x: 72, y: 48, name: "India" },
  "🇷🇺": { x: 68, y: 26, name: "Russia" },
  "🇨🇳": { x: 78, y: 38, name: "China" },
  "🇩🇪": { x: 50, y: 28, name: "Germany" },
  "🇺🇸": { x: 18, y: 36, name: "United States" },
  "🇳🇱": { x: 48, y: 27, name: "Netherlands" },
  "🇬🇧": { x: 46, y: 26, name: "United Kingdom" },
  "🇫🇷": { x: 47, y: 30, name: "France" },
  "🇺🇦": { x: 56, y: 28, name: "Ukraine" },
  "🇹🇷": { x: 58, y: 34, name: "Turkey" },
  "🇧🇷": { x: 28, y: 62, name: "Brazil" },
  "🇸🇬": { x: 80, y: 52, name: "Singapore" },
  "🇯🇵": { x: 86, y: 36, name: "Japan" },
  "🇰🇷": { x: 84, y: 38, name: "South Korea" },
  "🇵🇰": { x: 69, y: 42, name: "Pakistan" },
};

function colorFor(intensity: number) {
  if (intensity > 0.8) return "#FF3B3B";
  if (intensity > 0.6) return "#FF9F1C";
  if (intensity > 0.4) return "#FFD60A";
  return "#39FF88";
}

interface LiveHotspot {
  name: string;
  x: number;
  y: number;
  intensity: number;
  count: number;
}

export function WorldHeatmap() {
  const [liveHotspots, setLiveHotspots] = useState<LiveHotspot[]>([]);

  useEffect(() => {
    fetchAlerts("default")
      .then((alerts) => {
        const countryMap: Record<string, { count: number; maxRisk: number; flag: string }> = {};
        alerts.forEach((a) => {
          const entry = countryMap[a.flag] ?? { count: 0, maxRisk: 0, flag: a.flag };
          entry.count++;
          entry.maxRisk = Math.max(entry.maxRisk, a.risk_score_pct / 100);
          countryMap[a.flag] = entry;
        });
        const spots: LiveHotspot[] = Object.entries(countryMap)
          .map(([flag, data]) => {
            const coords = COUNTRY_COORDS[flag];
            if (!coords) return null;
            return { name: coords.name, x: coords.x, y: coords.y, intensity: data.maxRisk, count: data.count };
          })
          .filter(Boolean) as LiveHotspot[];
        if (spots.length > 0) setLiveHotspots(spots);
      })
      .catch(() => {});
  }, []);

  const displayHotspots: LiveHotspot[] =
    liveHotspots.length > 0
      ? liveHotspots
      : hotspots.map((h) => ({ name: h.name, x: h.x, y: h.y, intensity: h.intensity, count: 1 }));

  return (
    <div className="flex h-full flex-col font-mono">
      <div className="relative min-h-[220px] flex-1 overflow-hidden rounded border border-[#1C232E] bg-[#0A0E14]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C232E22_1px,transparent_1px),linear-gradient(to_bottom,#1C232E22_1px,transparent_1px)] bg-[size:20px_20px]" />

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {/* Continents outline in deep charcoal */}
          <g fill="#161B22" stroke="#1C232E" strokeWidth="0.5">
            <path d="M8 26 L28 22 L34 34 L26 48 L14 44 Z" />
            <path d="M22 54 L32 50 L34 66 L27 82 L21 70 Z" />
            <path d="M44 28 L58 24 L62 32 L54 40 L45 38 Z" />
            <path d="M45 42 L58 40 L60 60 L52 76 L46 58 Z" />
            <path d="M62 26 L88 22 L92 40 L80 56 L66 46 L60 34 Z" />
            <path d="M64 50 L74 48 L72 60 L66 58 Z" />
            <path d="M82 70 L92 68 L94 80 L84 80 Z" />
          </g>

          {/* Radar scan ring effect */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1C232E" strokeWidth="0.3" strokeDasharray="2 4" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="#1C232E" strokeWidth="0.3" strokeDasharray="2 4" />

          {/* Blips & Expanding radar pulse */}
          {displayHotspots.map((h, idx) => {
            const blipColor = colorFor(h.intensity);
            return (
              <g key={`${h.name}-${idx}`}>
                {/* Expanding shockwave ring */}
                <circle
                  cx={h.x}
                  cy={h.y}
                  r={2.5 + h.intensity * 4}
                  fill="none"
                  stroke={blipColor}
                  strokeWidth="0.4"
                  opacity="0.35"
                  className="animate-ping"
                  style={{ animationDuration: "3s", animationDelay: `${idx * 400}ms` }}
                />
                {/* Central tactical blip */}
                <circle
                  cx={h.x}
                  cy={h.y}
                  r={0.9 + h.intensity * 0.8}
                  fill={blipColor}
                />
                {h.count > 1 && (
                  <text
                    x={h.x}
                    y={h.y - 2.5}
                    fontSize="2.2"
                    fill={blipColor}
                    textAnchor="middle"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {h.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Corner HUD labels */}
        <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] font-mono text-[#7D8590]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-pulse" />
          <span>GEOGRAPHIC ADVERSARY RADAR // INTERPOL-CBI FEED</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-[#7D8590] font-mono">
        <div className="flex items-center gap-3">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
              <span>{l.label}</span>
            </span>
          ))}
        </div>
        {liveHotspots.length > 0 && (
          <span className="text-[#39FF88] font-semibold tabular-nums">
            ACTIVE JURISDICTIONS: {liveHotspots.length}
          </span>
        )}
      </div>
    </div>
  );
}
