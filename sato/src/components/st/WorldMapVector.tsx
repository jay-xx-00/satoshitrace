import { useId } from "react";

interface WorldMapVectorProps {
  /** If true, renders the animated 360-degree radar sweep beam */
  showRadarSweep?: boolean;
  /** If true, renders longitude/latitude coordinate lines and labels */
  showGraticules?: boolean;
  /** If true, highlights the cybercrime hot zones (India, Russia, Germany, UAE) */
  showJurisdictionZones?: boolean;
}

/**
 * High-Precision Dark Cyber Geospatial World Map Vector Component
 * 100% Vector SVG, Equirectangular Projection (0-100% normalized coordinate space).
 * Designed for air-gapped defense intelligence operations with zero external tile dependencies.
 */
export function WorldMapVector({
  showRadarSweep = true,
  showGraticules = true,
  showJurisdictionZones = true,
}: WorldMapVectorProps) {
  const maskId = useId();

  return (
    <g className="world-map-layer pointer-events-none select-none">
      <defs>
        {/* Landmass Obsidian Gradient */}
        <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111822" />
          <stop offset="100%" stopColor="#0B1017" />
        </linearGradient>

        {/* Tactical Landmass Border Glow */}
        <filter id="landGlow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#1E3A5F" floodOpacity="0.4" />
        </filter>

        {/* Radar Sweep Conic Gradient */}
        <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(57, 255, 136, 0.15)" />
          <stop offset="60%" stopColor="rgba(0, 240, 255, 0.04)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Ocean Background Vignette */}
        <radialGradient id="oceanVignette" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#080C12" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#05080D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#030508" stopOpacity="0.98" />
        </radialGradient>

        {/* Regional Hot Zone Radar Pulse Gradients */}
        <radialGradient id="zonePulseRed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF3B3B" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#FF3B3B" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#FF3B3B" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="zonePulseOrange" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9F1C" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#FF9F1C" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="zonePulseCyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.22" />
          <stop offset="70%" stopColor="#00F0FF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="zonePulseGreen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#39FF88" stopOpacity="0.22" />
          <stop offset="70%" stopColor="#39FF88" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#39FF88" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Deep Ocean Cyber Backdrop */}
      <rect x="0" y="0" width="100" height="100" fill="url(#oceanVignette)" />

      {/* 2. Tactical Graticules (Latitude & Longitude Grid Overlay) */}
      {showGraticules && (
        <g className="graticules-layer opacity-40">
          {/* Latitude Lines */}
          {/* 60° North */}
          <line x1="0" y1="14.7" x2="100" y2="14.7" stroke="#1C2D42" strokeWidth="0.12" strokeDasharray="1 2" />
          <text x="1.5" y="14.0" className="fill-[#4A627E] font-mono text-[1.4px]">60°N</text>
          <text x="98.5" y="14.0" textAnchor="end" className="fill-[#4A627E] font-mono text-[1.4px]">60°N</text>

          {/* 30° North (Tropic of Cancer) */}
          <line x1="0" y1="32.4" x2="100" y2="32.4" stroke="#1F344D" strokeWidth="0.15" strokeDasharray="2 3" />
          <text x="1.5" y="31.7" className="fill-[#4A627E] font-mono text-[1.4px]">30°N [TROPIC]</text>
          <text x="98.5" y="31.7" textAnchor="end" className="fill-[#4A627E] font-mono text-[1.4px]">30°N</text>

          {/* 0° Equator - Highlighted Dual-Line */}
          <line x1="0" y1="50.0" x2="100" y2="50.0" stroke="#00F0FF" strokeWidth="0.2" strokeOpacity="0.45" strokeDasharray="3 3" />
          <text x="1.5" y="49.2" className="fill-[#00F0FF] font-mono text-[1.5px] font-bold opacity-80">EQ 00°00&apos;</text>
          <text x="98.5" y="49.2" textAnchor="end" className="fill-[#00F0FF] font-mono text-[1.5px] font-bold opacity-80">EQUATOR</text>

          {/* 30° South (Tropic of Capricorn) */}
          <line x1="0" y1="67.6" x2="100" y2="67.6" stroke="#1F344D" strokeWidth="0.15" strokeDasharray="2 3" />
          <text x="1.5" y="66.9" className="fill-[#4A627E] font-mono text-[1.4px]">30°S [CAPRICORN]</text>
          <text x="98.5" y="66.9" textAnchor="end" className="fill-[#4A627E] font-mono text-[1.4px]">30°S</text>

          {/* 60° South */}
          <line x1="0" y1="85.3" x2="100" y2="85.3" stroke="#1C2D42" strokeWidth="0.12" strokeDasharray="1 2" />
          <text x="1.5" y="84.6" className="fill-[#4A627E] font-mono text-[1.4px]">60°S</text>

          {/* Longitude Meridians */}
          {/* 120° West (Pacific) */}
          <line x1="16.7" y1="0" x2="16.7" y2="100" stroke="#1C2D42" strokeWidth="0.12" strokeDasharray="1 3" />
          <text x="16.7" y="2.5" textAnchor="middle" className="fill-[#4A627E] font-mono text-[1.3px]">120°W</text>

          {/* 60° West (Americas) */}
          <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="#1C2D42" strokeWidth="0.12" strokeDasharray="1 3" />
          <text x="33.3" y="2.5" textAnchor="middle" className="fill-[#4A627E] font-mono text-[1.3px]">60°W</text>

          {/* 0° Prime Meridian (UTC / London) */}
          <line x1="50.0" y1="0" x2="50.0" y2="100" stroke="#00F0FF" strokeWidth="0.18" strokeOpacity="0.4" strokeDasharray="2 2" />
          <text x="50.0" y="2.5" textAnchor="middle" className="fill-[#00F0FF] font-mono text-[1.4px] font-bold opacity-80">UTC 00°</text>

          {/* 60° East (Ural / Gulf / India) */}
          <line x1="66.7" y1="0" x2="66.7" y2="100" stroke="#1C2D42" strokeWidth="0.12" strokeDasharray="1 3" />
          <text x="66.7" y="2.5" textAnchor="middle" className="fill-[#4A627E] font-mono text-[1.3px]">60°E</text>

          {/* 120° East (East Asia / Australia) */}
          <line x1="83.3" y1="0" x2="83.3" y2="100" stroke="#1C2D42" strokeWidth="0.12" strokeDasharray="1 3" />
          <text x="83.3" y="2.5" textAnchor="middle" className="fill-[#4A627E] font-mono text-[1.3px]">120°E</text>
        </g>
      )}

      {/* 3. High-Fidelity Continental Landmasses */}
      <g
        className="continents"
        fill="url(#landGrad)"
        stroke="#1E3249"
        strokeWidth="0.32"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#landGlow)"
      >
        {/* NORTH AMERICA (Alaska, Canada, USA, Mexico, Central America, Florida) */}
        <path
          d={`
            M 3.8 11.2
            L 2.2 14.5 L 1.2 16.8 L 3.5 17.6 L 6.2 16.5 L 9.5 18.2 L 12.0 19.5
            L 13.6 22.0 L 14.2 24.5 L 15.8 28.0 L 16.5 31.0 L 18.2 34.5 L 20.2 37.0
            L 22.5 38.8 L 24.2 41.5 L 26.5 42.5
            L 26.8 41.5 L 24.5 39.5 L 23.2 36.5 L 22.8 33.5 L 24.5 32.8 L 26.0 34.0
            L 27.2 34.8 L 27.8 36.2 L 27.0 36.8 L 26.4 34.2 L 25.5 32.5
            L 27.2 31.5 L 29.0 30.5 L 30.8 27.5 L 32.2 25.2 L 34.2 24.0 L 35.8 21.0
            L 34.5 19.5 L 32.0 18.2 L 29.5 18.8 L 28.0 16.5 L 28.8 14.2 L 26.5 12.8
            L 23.5 13.5 L 21.0 11.5 L 18.5 10.2 L 14.2 9.2 L 9.5 8.5 L 6.0 9.8
            Z
          `}
        />

        {/* GREENLAND */}
        <path
          d={`
            M 35.5 4.5
            L 40.5 4.0 L 43.5 6.2 L 44.2 9.5 L 42.5 12.8 L 38.5 14.2 L 35.8 11.5
            L 34.5 8.2 L 34.8 5.8
            Z
          `}
        />

        {/* SOUTH AMERICA (Colombia, Venezuela, Brazil, Andes, Argentina, Patagonia) */}
        <path
          d={`
            M 26.5 42.5
            L 28.5 41.8 L 31.0 42.2 L 33.5 43.5 L 36.0 45.0 L 38.5 48.0 L 39.8 51.5
            L 39.2 55.0 L 37.5 59.2 L 36.2 62.5 L 34.5 67.0 L 33.2 71.5 L 32.0 76.5
            L 31.2 81.2 L 30.2 82.5 L 29.5 80.5 L 29.2 75.0 L 28.2 68.0 L 27.5 61.5
            L 26.5 54.5 L 25.8 48.5 L 25.2 44.8
            Z
          `}
        />

        {/* BRITISH ISLES */}
        {/* Great Britain */}
        <path
          d={`
            M 48.2 16.0
            L 49.5 16.2 L 50.2 17.5 L 49.8 19.5 L 49.2 20.8 L 47.8 20.5 L 47.5 18.5
            Z
          `}
        />
        {/* Ireland */}
        <path
          d={`
            M 46.2 17.5
            L 47.2 17.8 L 47.0 19.2 L 45.8 19.0
            Z
          `}
        />

        {/* EURASIA (Scandinavia, Europe, Russia, Middle East, India, China, Siberia, Indochina) */}
        <path
          d={`
            M 55.5 8.2
            L 53.0 10.5 L 51.2 13.5 L 50.8 16.2 L 52.5 17.0 L 54.5 16.0 L 56.0 14.5
            L 54.2 13.0 L 52.8 15.0 L 51.8 17.5 L 52.2 18.5 L 50.5 19.5 L 48.5 21.0
            L 47.0 22.8 L 45.2 25.5 L 45.8 28.5 L 48.5 27.5 L 50.2 26.5 L 52.0 25.5
            L 53.2 26.2 L 54.5 28.2 L 53.8 28.8 L 52.5 27.0 L 54.0 25.5 L 55.8 26.8
            L 57.0 28.2 L 58.2 26.5 L 61.0 27.5 L 62.5 29.0 L 60.5 31.2 L 60.8 33.5
            L 62.0 36.5 L 63.5 40.5 L 65.5 39.0 L 67.2 37.0 L 65.8 34.5 L 64.2 32.5
            L 65.5 31.8 L 67.5 33.5 L 69.5 34.8
            /* Indian Subcontinent */
            L 69.8 36.5 L 70.8 38.5 L 71.8 41.5 L 72.8 45.2 L 73.8 42.5 L 75.0 39.0
            L 76.2 36.2 L 77.5 37.5 L 78.5 41.0 L 78.8 45.5 L 79.2 48.5 L 79.8 47.0
            L 79.0 43.5 L 80.2 41.0 L 81.2 38.0 L 80.5 35.5 L 82.0 34.0 L 83.8 32.2
            L 84.5 30.5 L 85.5 29.0 L 85.8 30.5 L 84.8 32.5 L 84.0 34.5 L 85.8 32.5
            /* Korean Peninsula & East Coast */
            L 86.8 28.2 L 88.5 26.5 L 90.5 24.0 L 92.5 21.0 L 94.5 17.5 L 95.8 14.5
            L 97.2 11.2 L 95.5 9.5 L 91.5 8.2 L 86.5 7.8 L 81.5 7.2 L 76.5 8.0
            L 71.5 8.5 L 66.5 9.0 L 61.5 8.5
            Z
          `}
        />

        {/* JAPAN ARCHIPELAGO */}
        <path
          d={`
            M 87.0 28.5
            L 88.5 26.0 L 90.2 23.5 L 89.5 24.5 L 88.2 27.2 L 86.5 29.5
            Z
          `}
        />

        {/* SRI LANKA */}
        <path
          d={`
            M 73.2 46.2
            L 74.0 46.5 L 73.8 47.8 L 73.0 47.2
            Z
          `}
        />

        {/* AFRICA (North Africa, Sahara, West Africa, Central, Horn, South Africa) */}
        <path
          d={`
            M 46.2 29.0
            L 48.5 28.5 L 51.5 28.0 L 53.5 27.5 L 56.5 29.5 L 59.2 30.0 L 60.5 33.2
            L 61.8 37.0 L 62.5 40.5 L 64.2 43.5 L 63.2 47.0 L 61.5 50.5 L 60.5 55.5
            L 59.2 61.0 L 57.5 66.5 L 55.2 69.5 L 53.8 68.0 L 53.5 62.5 L 52.8 56.0
            L 52.0 51.0 L 50.5 47.5 L 47.2 48.2 L 44.5 45.5 L 43.5 42.0 L 44.2 36.5
            L 45.2 32.5
            Z
          `}
        />

        {/* MADAGASCAR */}
        <path
          d={`
            M 62.8 58.5
            L 64.0 59.2 L 63.5 64.5 L 62.2 64.0 L 62.2 60.0
            Z
          `}
        />

        {/* AUSTRALIA */}
        <path
          d={`
            M 90.5 57.2
            L 92.5 60.5 L 93.0 64.5 L 92.0 69.0 L 89.8 72.0 L 86.5 70.5 L 83.5 68.5
            L 81.8 66.8 L 81.2 63.0 L 82.5 60.0 L 85.5 58.2 L 87.8 59.8 L 89.2 58.0
            Z
          `}
        />

        {/* NEW ZEALAND */}
        <path
          d={`
            M 97.5 70.8
            L 98.8 72.0 L 97.8 74.0 L 96.2 76.5 L 95.8 75.5 L 96.8 73.0
            Z
          `}
        />

        {/* INDONESIA & MALAYSIA ARCHIPELAGO */}
        <path
          d={`
            M 77.0 49.5 L 79.5 51.8 L 82.5 53.5 L 81.8 54.5 L 78.5 52.8 L 76.2 50.5 Z
            M 81.5 48.2 L 83.5 47.8 L 83.8 50.8 L 81.8 51.2 Z
            M 85.0 42.5 L 86.2 43.2 L 86.0 46.5 L 84.8 45.8 Z
          `}
        />

        {/* ANTARCTICA RIBBON */}
        <path
          d={`
            M 0 94.0
            L 10 93.5 L 20 94.5 L 30 93.8 L 33 89.5 L 36 93.0 L 50 92.5
            L 65 93.2 L 80 92.8 L 90 93.5 L 100 93.0 L 100 100 L 0 100
            Z
          `}
        />
      </g>

      {/* 4. Strategic Cyber Defense Jurisdiction Hot Zones */}
      {showJurisdictionZones && (
        <g className="jurisdiction-hotspots pointer-events-none">
          {/* INDIA (UPI Mules / CBI / CERT-In) -> x: 71.5, y: 37.5 */}
          <g>
            {/* Concentric Sonar Rings */}
            <circle cx="71.5" cy="37.5" r="7.5" fill="url(#zonePulseGreen)" />
            <circle
              cx="71.5"
              cy="37.5"
              r="6.0"
              fill="none"
              stroke="#39FF88"
              strokeWidth="0.22"
              strokeDasharray="1.2 1.8"
              strokeOpacity="0.6"
              className="animate-spin-slow origin-[71.5px_37.5px]"
            />
            <circle
              cx="71.5"
              cy="37.5"
              r="4.2"
              fill="none"
              stroke="#39FF88"
              strokeWidth="0.15"
              strokeOpacity="0.35"
            />
            {/* Telemetry Label Plate */}
            <rect
              x="66.5"
              y="44.2"
              width="10.0"
              height="2.8"
              rx="0.8"
              fill="#0D1117"
              stroke="#39FF88"
              strokeWidth="0.18"
              strokeOpacity="0.8"
            />
            <text
              x="71.5"
              y="46.1"
              textAnchor="middle"
              className="fill-[#39FF88] font-mono text-[1.5px] font-bold tracking-wider"
            >
              🇮🇳 INDIA // CBI ED
            </text>
          </g>

          {/* RUSSIA (LockBit Ransomware Nexus / Moscow) -> x: 60.5, y: 18.0 */}
          <g>
            <circle cx="60.5" cy="18.0" r="9.0" fill="url(#zonePulseRed)" />
            <circle
              cx="60.5"
              cy="18.0"
              r="7.5"
              fill="none"
              stroke="#FF3B3B"
              strokeWidth="0.25"
              strokeDasharray="1.5 2.0"
              strokeOpacity="0.7"
              className="animate-spin-slow origin-[60.5px_18px]"
            />
            <circle
              cx="60.5"
              cy="18.0"
              r="4.5"
              fill="none"
              stroke="#FF3B3B"
              strokeWidth="0.18"
              strokeOpacity="0.45"
            />
            <rect
              x="54.5"
              y="9.8"
              width="12.0"
              height="2.8"
              rx="0.8"
              fill="#0D1117"
              stroke="#FF3B3B"
              strokeWidth="0.18"
              strokeOpacity="0.8"
            />
            <text
              x="60.5"
              y="11.7"
              textAnchor="middle"
              className="fill-[#FF3B3B] font-mono text-[1.5px] font-bold tracking-wider"
            >
              🇷🇺 RUSSIA // LOCKBIT
            </text>
          </g>

          {/* GERMANY / NETHERLANDS (Frankfurt Tor Relays / BKA) -> x: 52.4, y: 21.0 */}
          <g>
            <circle cx="52.4" cy="21.0" r="7.0" fill="url(#zonePulseCyan)" />
            <circle
              cx="52.4"
              cy="21.0"
              r="5.5"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="0.2"
              strokeDasharray="1 1.5"
              strokeOpacity="0.6"
            />
            <rect
              x="47.2"
              y="14.8"
              width="10.5"
              height="2.8"
              rx="0.8"
              fill="#0D1117"
              stroke="#00F0FF"
              strokeWidth="0.18"
              strokeOpacity="0.8"
            />
            <text
              x="52.4"
              y="16.7"
              textAnchor="middle"
              className="fill-[#00F0FF] font-mono text-[1.5px] font-bold tracking-wider"
            >
              🇩🇪 GERMANY // TOR BKA
            </text>
          </g>

          {/* UAE / DUBAI (Wasabi CoinJoin Mixer / OTC Desk) -> x: 65.5, y: 35.0 */}
          <g>
            <circle cx="65.5" cy="35.0" r="6.8" fill="url(#zonePulseOrange)" />
            <circle
              cx="65.5"
              cy="35.0"
              r="5.0"
              fill="none"
              stroke="#FF9F1C"
              strokeWidth="0.2"
              strokeDasharray="1 2"
              strokeOpacity="0.6"
            />
            <rect
              x="60.8"
              y="40.5"
              width="9.5"
              height="2.8"
              rx="0.8"
              fill="#0D1117"
              stroke="#FF9F1C"
              strokeWidth="0.18"
              strokeOpacity="0.8"
            />
            <text
              x="65.5"
              y="42.4"
              textAnchor="middle"
              className="fill-[#FF9F1C] font-mono text-[1.5px] font-bold tracking-wider"
            >
              🇦🇪 UAE // DUBAI OTC
            </text>
          </g>
        </g>
      )}

      {/* 5. Tactical Rotating Sweeper Radar Beam */}
      {showRadarSweep && (
        <g className="radar-sweep-group pointer-events-none opacity-20 mix-blend-screen">
          <g
            style={{
              transformOrigin: "60% 32%",
              animation: "spin 18s linear infinite",
            }}
          >
            <path
              d="M 60 32 L 10 0 A 70 70 0 0 1 100 0 Z"
              fill="url(#radarSweep)"
            />
            <line
              x1="60"
              y1="32"
              x2="100"
              y2="0"
              stroke="#39FF88"
              strokeWidth="0.3"
              strokeOpacity="0.5"
            />
          </g>
        </g>
      )}
    </g>
  );
}
