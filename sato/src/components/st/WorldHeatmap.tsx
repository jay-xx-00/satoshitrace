import { useEffect, useState } from "react";
import { hotspots } from "@/lib/mock-data";
import { fetchAlerts } from "@/lib/api";

const LEGEND = [
  { label: "Low", color: "var(--data)" },
  { label: "Medium", color: "var(--warn)" },
  { label: "High", color: "var(--signal)" },
  { label: "Critical", color: "var(--critical)" },
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
  if (intensity > 0.85) return "var(--critical)";
  if (intensity > 0.65) return "var(--signal)";
  if (intensity > 0.45) return "var(--warn)";
  return "var(--data)";
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

  const displayHotspots: LiveHotspot[] = liveHotspots.length > 0
    ? liveHotspots
    : hotspots.map((h) => ({ name: h.name, x: h.x, y: h.y, intensity: h.intensity, count: 1 }));

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-background/60 hud-grid">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <g fill="oklch(0.3 0.012 250)" opacity="0.9">
            <path d="M8 26 L28 22 L34 34 L26 48 L14 44 Z" />
            <path d="M22 54 L32 50 L34 66 L27 82 L21 70 Z" />
            <path d="M44 28 L58 24 L62 32 L54 40 L45 38 Z" />
            <path d="M45 42 L58 40 L60 60 L52 76 L46 58 Z" />
            <path d="M62 26 L88 22 L92 40 L80 56 L66 46 L60 34 Z" />
            <path d="M64 50 L74 48 L72 60 L66 58 Z" />
            <path d="M82 70 L92 68 L94 80 L84 80 Z" />
          </g>
          {displayHotspots.map((h, idx) => (
            <g key={`${h.name}-${idx}`}>
              <circle cx={h.x} cy={h.y} r={1.2 + h.intensity * 3.2} fill={colorFor(h.intensity)} opacity="0.18" />
              <circle
                cx={h.x} cy={h.y} r={0.7 + h.intensity * 1.1}
                fill={colorFor(h.intensity)}
                className="animate-pulse-dot"
                style={{ animationDelay: `${idx * 200}ms` }}
              />
              {h.count > 1 && (
                <text x={h.x} y={h.y - 2} fontSize="1.8" fill={colorFor(h.intensity)} textAnchor="middle" opacity="0.9" fontFamily="monospace">
                  {h.count}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="mono-xs mt-2 flex items-center gap-4 text-muted-foreground">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
        {liveHotspots.length > 0 && (
          <span className="ml-auto text-emerald-400">● Live ({liveHotspots.length} countries)</span>
        )}
      </div>
    </div>
  );
}

