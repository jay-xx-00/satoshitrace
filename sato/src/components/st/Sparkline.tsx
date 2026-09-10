export function Sparkline({ data, color = "var(--signal)" }: { data: number[]; color?: string }) {
  const w = 120;
  const h = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <polyline
        points={`0,${h} ${pts.join(" ")} ${w},${h}`}
        fill={color}
        opacity="0.12"
        stroke="none"
      />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
