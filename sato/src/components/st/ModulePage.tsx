import type { LucideIcon } from "lucide-react";

export function ModulePage({
  icon: Icon,
  heading,
  copy,
  items,
}: {
  icon: LucideIcon;
  heading: string;
  copy: string;
  items: string[];
}) {
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="glass animate-rise flex items-start gap-4 p-5">
        <div className="animate-glow-slow grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-signal/40 bg-signal/10 text-signal">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-[16px] font-bold tracking-wide">{heading}</h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{copy}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div
            key={item}
            className="glass animate-rise p-4"
            style={{ animationDelay: `${80 + i * 50}ms` }}
          >
            <div className="mono-xs text-muted-foreground">Module {String(i + 1).padStart(2, "0")}</div>
            <div className="mt-2 text-[13px] text-foreground">{item}</div>
            <div className="shimmer mt-3 h-1.5 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
