import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2, AlertTriangle } from "lucide-react";
import type { FramelyProduct } from "@/lib/framely-data";
import type { MockupState } from "./LiveMockupCanvas";

const Canvas = lazy(() => import("./LiveMockupCanvas"));

export type { MockupState } from "./LiveMockupCanvas";

const DEFAULT_STATE: MockupState = {
  side: "front",
  colorId: undefined,
  transform: { x: 0, y: 0, scale: 1, rotation: 0 },
  text: undefined,
};

export function makeDefaultMockup(product: FramelyProduct): MockupState {
  return { ...DEFAULT_STATE, colorId: product.colors?.[0]?.id };
}

export function LiveMockup({
  product,
  photoDataUrl,
  state,
  onChange,
  text,
}: {
  product: FramelyProduct;
  photoDataUrl: string | null;
  state: MockupState;
  onChange: (s: MockupState) => void;
  text?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [safe, setSafe] = useState(true);
  const history = useRef<MockupState[]>([state]);
  const future = useRef<MockupState[]>([]);

  useEffect(() => setMounted(true), []);

  const push = useCallback(
    (s: MockupState) => {
      history.current = [...history.current.slice(-29), s];
      future.current = [];
      onChange(s);
    },
    [onChange],
  );

  const zoom = (delta: number) => {
    const newScale = Math.max(0.1, Math.min(5, state.transform.scale * (1 + delta)));
    push({ ...state, transform: { ...state.transform, scale: newScale } });
  };
  const reset = () => push(makeDefaultMockup(product));
  const undo = () => {
    if (history.current.length < 2) return;
    const prev = history.current[history.current.length - 2];
    future.current.push(history.current.pop()!);
    onChange(prev);
  };
  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    history.current.push(next);
    onChange(next);
  };

  const stateWithText: MockupState = { ...state, text };

  const printDims = (() => {
    if (!photoDataUrl) return null;
    const wIn = ((product.physicalSize.w * product.printArea.w) / 100).toFixed(1);
    const hIn = ((product.physicalSize.h * product.printArea.h) / 100).toFixed(1);
    return `${wIn} × ${hIn} ${product.physicalSize.unit}`;
  })();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Side / color tabs */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="View" className="inline-flex rounded-full border border-border bg-secondary/40 p-1 text-xs font-medium">
          {(["front", "back"] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={state.side === s}
              onClick={() => onChange({ ...state, side: s })}
              className={`min-h-9 rounded-full px-3 py-1.5 capitalize transition ${state.side === s ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
        {product.colors && (
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Product color">
            {product.colors.map((c) => (
              <button
                key={c.id}
                role="radio"
                aria-checked={state.colorId === c.id}
                aria-label={c.label}
                onClick={() => onChange({ ...state, colorId: c.id })}
                className={`h-7 w-7 rounded-full border-2 transition ${state.colorId === c.id ? "border-accent ring-2 ring-accent/30" : "border-border"}`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Canvas — fixed aspect to prevent CLS */}
      <div className="relative w-full max-w-[560px]">
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary">
          {mounted ? (
            <Suspense fallback={<CanvasSkeleton />}>
              <Canvas
                product={product}
                photoDataUrl={photoDataUrl}
                state={stateWithText}
                onChange={push}
                onSafeChange={setSafe}
              />
            </Suspense>
          ) : (
            <CanvasSkeleton />
          )}
        </div>
        {!safe && photoDataUrl && (
          <div
            role="alert"
            className="absolute left-3 right-3 top-3 flex items-center gap-2 rounded-full bg-destructive/95 px-3 py-2 text-xs font-medium text-destructive-foreground shadow-lift"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Design extends outside the print-safe area — drag or shrink to fit.
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-soft">
          <ControlBtn label="Zoom out" onClick={() => zoom(-0.1)}>
            <ZoomOut className="h-4 w-4" />
          </ControlBtn>
          <ControlBtn label="Zoom in" onClick={() => zoom(0.1)}>
            <ZoomIn className="h-4 w-4" />
          </ControlBtn>
          <ControlBtn label="Undo" onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </ControlBtn>
          <ControlBtn label="Redo" onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </ControlBtn>
          <ControlBtn label="Reset" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </ControlBtn>
        </div>
        {printDims && (
          <p className="text-xs text-muted-foreground">
            Estimated print: <span className="font-medium text-foreground">{printDims}</span>
          </p>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Tap your design to resize or rotate. Keep it inside the dashed area for sharpest printing.
      </p>
    </div>
  );
}

function ControlBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid min-h-11 min-w-11 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </button>
  );
}

function CanvasSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-secondary to-muted">
      <div className="text-xs text-muted-foreground">Loading studio…</div>
    </div>
  );
}
