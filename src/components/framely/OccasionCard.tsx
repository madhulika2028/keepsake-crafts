import { Check } from "lucide-react";
import type { FramelyOccasion } from "@/lib/framely-data";

export function OccasionCard({
  occasion,
  selected,
  onSelect,
}: {
  occasion: FramelyOccasion;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const Comp: "button" | "div" = onSelect ? "button" : "div";
  return (
    <Comp
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(occasion.id) : undefined}
      aria-pressed={onSelect ? !!selected : undefined}
      aria-label={`${occasion.label} — ${occasion.subtitle}`}
      className={`group relative flex h-full w-full flex-col items-start gap-3 overflow-hidden rounded-2xl border bg-card p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        selected ? "border-accent shadow-lift ring-2 ring-accent/40" : "border-border"
      }`}
    >
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-br ${occasion.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-90`}
        aria-hidden="true"
      />
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-background/80 text-2xl shadow-soft backdrop-blur">
        <span aria-hidden="true">{occasion.icon}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold leading-tight text-foreground sm:text-base">{occasion.label}</h3>
        <p className="mt-1 text-xs text-muted-foreground sm:text-[13px]">{occasion.subtitle}</p>
      </div>
      {selected && (
        <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-foreground shadow-lift">
          <Check className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </Comp>
  );
}
