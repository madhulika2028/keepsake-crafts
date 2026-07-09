import { Check } from "lucide-react";

export type StepperStep = { id: string; label: string };

export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: StepperStep[];
  current: number;
  onJump?: (index: number) => void;
}) {
  const pct = Math.round(((current + 1) / steps.length) * 100);
  const currentLabel = steps[current]?.label;
  return (
    <nav aria-label="Progress" className="w-full">
      {/* Mobile: compact step indicator + progress bar */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Step {current + 1} of {steps.length}
          </p>
          <p className="text-xs text-muted-foreground">{pct}%</p>
        </div>
        <p className="mt-1 text-sm font-semibold text-foreground">{currentLabel}</p>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop: full chip stepper */}
      <ol className="hidden w-full items-center gap-2 overflow-x-auto pb-1 sm:flex sm:gap-3">
        {steps.map((s, i) => {
          const isDone = i < current;
          const isActive = i === current;
          const reachable = i <= current;
          return (
            <li key={s.id} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!reachable || !onJump}
                onClick={() => reachable && onJump?.(i)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${s.label}`}
                className={`flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full border px-3 py-2 text-left text-xs font-medium transition sm:text-sm ${
                  isActive
                    ? "border-accent bg-accent text-accent-foreground shadow-lift"
                    : isDone
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-border bg-card text-muted-foreground"
                } ${reachable && onJump ? "cursor-pointer hover:border-foreground/30" : "cursor-default"}`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                    isActive
                      ? "bg-background/20 text-current"
                      : isDone
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <span className="hidden h-px w-4 shrink-0 bg-border sm:block" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
