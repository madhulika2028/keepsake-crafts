import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  FRAME_SIZE_OPTIONS,
  GIFT_BOX_ITEMS,
  MEMORY_BOOK_COUNTS,
  type ProductOptions,
  type FrameSize,
  type TshirtSide,
  type GiftBoxItem,
} from "@/lib/customization-rules";

type Props = {
  productId: string;
  options: ProductOptions;
  onChange: (o: ProductOptions) => void;
};

export function OptionsPicker({ productId, options, onChange }: Props) {
  if (productId === "wood-frame") {
    return (
      <Group title="Choose frame size" hint="Determines the print area and final dimensions.">
        <div className="grid gap-3 sm:grid-cols-3">
          {FRAME_SIZE_OPTIONS.map((opt) => (
            <Choice
              key={opt.id}
              active={options.frameSize === opt.id}
              onClick={() => onChange({ ...options, frameSize: opt.id as FrameSize })}
              title={opt.label}
              subtitle={opt.dimensions}
              meta={opt.priceAdd ? `+ ₹${opt.priceAdd}` : "Base price"}
            />
          ))}
        </div>
      </Group>
    );
  }

  if (productId === "tshirt") {
    const sides: { id: TshirtSide; label: string; meta: string }[] = [
      { id: "front", label: "Front print", meta: "Most popular" },
      { id: "back", label: "Back print", meta: "Bold statement" },
      { id: "both", label: "Both sides", meta: "+ ₹150" },
    ];
    return (
      <Group title="Where should we print?" hint="You can upload one design after picking a side.">
        <div className="grid gap-3 sm:grid-cols-3">
          {sides.map((s) => (
            <Choice
              key={s.id}
              active={options.tshirtSide === s.id}
              onClick={() => onChange({ ...options, tshirtSide: s.id })}
              title={s.label}
              meta={s.meta}
            />
          ))}
        </div>
      </Group>
    );
  }

  if (productId === "memory-book") {
    return (
      <Group title="How many photos in your memory book?" hint="Minimum 30 photos. Pick a number you'll fill completely.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {MEMORY_BOOK_COUNTS.map((n) => (
            <Choice
              key={n}
              active={options.memoryBookCount === n}
              onClick={() => onChange({ ...options, memoryBookCount: n })}
              title={`${n}`}
              subtitle="photos"
            />
          ))}
        </div>
      </Group>
    );
  }

  if (productId === "gift-box") {
    const selected = new Set(options.giftBoxItems ?? []);
    const toggle = (id: GiftBoxItem) => {
      const next = new Set(selected);
      next.has(id) ? next.delete(id) : next.add(id);
      onChange({ ...options, giftBoxItems: Array.from(next) });
    };
    return (
      <Group title="Build your gift box" hint="Pick any combination — customization for each item appears next.">
        <div className="grid gap-3 sm:grid-cols-3">
          {GIFT_BOX_ITEMS.map((g) => {
            const isOn = selected.has(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={isOn}
                onClick={() => toggle(g.id)}
                className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  isOn ? "border-accent bg-accent/5 shadow-soft" : "border-border hover:border-foreground/30"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                    isOn ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card"
                  }`}
                  aria-hidden
                >
                  {isOn && <Check className="h-3 w-3" />}
                </span>
                <div>
                  <p className="text-sm font-semibold">{g.label}</p>
                  <p className="text-xs text-muted-foreground">{g.needsPhotos} photo{g.needsPhotos > 1 ? "s" : ""} required</p>
                </div>
              </button>
            );
          })}
        </div>
      </Group>
    );
  }

  return null;
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-semibold">{title}</h3>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  title,
  subtitle,
  meta,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  meta?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      aria-pressed={active}
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition ${
        active ? "border-accent bg-accent/5 shadow-soft" : "border-border hover:border-foreground/30"
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      {meta && <p className="mt-2 text-[11px] uppercase tracking-wider text-accent">{meta}</p>}
    </motion.button>
  );
}
