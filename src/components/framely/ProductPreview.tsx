import { motion } from "framer-motion";
import type { Customization, ProductOptions } from "@/lib/customization-rules";
import { FRAME_SIZE_OPTIONS, GIFT_BOX_ITEMS } from "@/lib/customization-rules";
import { PRODUCTS } from "@/lib/framely-data";

/**
 * Per-product live preview that replaces sample photos with the user's
 * uploaded photos in real time. Pure CSS/SVG — no canvas required.
 */
export function ProductPreview({ c }: { c: Customization }) {
  const product = PRODUCTS.find((p) => p.id === c.productId)!;
  switch (c.productId) {
    case "photo-strip":
      return <PhotoStripPreview photos={c.photos} title={c.title} date={c.date} />;
    case "polaroid":
      return <PolaroidPreview photos={c.photos} title={c.title} />;
    case "wood-frame":
      return <FramePreview photos={c.photos} size={c.options.frameSize} title={c.title} />;
    case "photo-mug":
      return <MugPreview photo={c.photos[0]} title={c.title} />;
    case "tote":
      return <ToteBagPreview photo={c.photos[0]} title={c.title} />;
    case "tshirt":
      return <TshirtPreview photo={c.photos[0]} side={c.options.tshirtSide} />;
    case "memory-book":
      return <MemoryBookPreview photos={c.photos} title={c.title} pageCount={c.options.memoryBookCount} />;
    case "gift-box":
      return <GiftBoxPreview photos={c.photos} options={c.options} />;
    default:
      return (
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
      );
  }
}

function Stage({ children, ratio = "aspect-[4/5]" }: { children: React.ReactNode; ratio?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative ${ratio} w-full overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-beige to-card shadow-soft`}
    >
      {children}
    </motion.div>
  );
}

function Placeholder({ index }: { index: number }) {
  return (
    <div className="grid h-full w-full place-items-center bg-secondary/70 text-[10px] uppercase tracking-widest text-muted-foreground">
      Photo {index + 1}
    </div>
  );
}

// ── Photo Strip (4 photos) ────────────────────────────────────────────
function PhotoStripPreview({ photos, title, date }: { photos: string[]; title: string; date: string }) {
  const slots = Array.from({ length: 4 });
  return (
    <Stage ratio="aspect-[3/5]">
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_20%_10%,oklch(0.85_0.04_60),transparent_60%),radial-gradient(circle_at_80%_90%,oklch(0.7_0.05_40_/0.4),transparent_60%)]">
        <div className="flex h-[92%] w-[58%] flex-col gap-2 rounded-md bg-ivory p-2 shadow-lift">
          {slots.map((_, i) => (
            <div key={i} className="flex-1 overflow-hidden rounded-[2px] bg-secondary">
              {photos[i] ? (
                <motion.img
                  key={photos[i]}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  src={photos[i]}
                  alt={`Strip photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Placeholder index={i} />
              )}
            </div>
          ))}
          <div className="pt-1 text-center">
            <p className="font-semibold text-charcoal text-[11px]">{title || "your moment"}</p>
            <p className="text-[9px] uppercase tracking-widest text-charcoal/60">{date || "framely · 2026"}</p>
          </div>
        </div>
      </div>
    </Stage>
  );
}

// ── Polaroid set (12 photos) ──────────────────────────────────────────
function PolaroidPreview({ photos, title }: { photos: string[]; title: string }) {
  const slots = Array.from({ length: 12 });
  return (
    <Stage>
      <div className="absolute inset-0 p-4">
        <div className="grid h-full grid-cols-3 gap-2.5">
          {slots.map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex flex-col rounded-sm bg-ivory p-1 pb-3 shadow-soft"
            >
              <div className="aspect-square w-full overflow-hidden bg-secondary">
                {photos[i] ? (
                  <img src={photos[i]} alt={`Polaroid ${i + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <Placeholder index={i} />
                )}
              </div>
              <p className="mt-1 text-center font-[cursive] text-[8px] text-charcoal/70 truncate px-1">
                {title || "memory"}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

// ── Wooden frame ──────────────────────────────────────────────────────
function FramePreview({ photos, size, title }: { photos: string[]; size: ProductOptions["frameSize"]; title: string }) {
  const sizeMap = { small: 0.62, medium: 0.76, large: 0.92 } as const;
  const scale = sizeMap[size ?? "medium"];
  return (
    <Stage>
      <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,oklch(0.95_0.02_80),oklch(0.88_0.03_60))]">
        <div
          className="relative rounded-md bg-[linear-gradient(135deg,#7b5135,#a9774f)] p-3 shadow-lift"
          style={{ width: `${scale * 80}%`, aspectRatio: "4/5" }}
        >
          <div className="absolute inset-2 rounded-sm bg-ivory p-2">
            <div className="h-full w-full overflow-hidden bg-secondary">
              {photos[0] ? (
                <motion.img key={photos[0]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={photos[0]} alt={title || "Framed photo"} className="h-full w-full object-cover" />
              ) : (
                <Placeholder index={0} />
              )}
            </div>
          </div>
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-card/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal shadow-soft">
          {size ? FRAME_SIZE_OPTIONS.find((f) => f.id === size)?.dimensions : "Pick a size"}
        </span>
      </div>
    </Stage>
  );
}

// ── Mug ───────────────────────────────────────────────────────────────
function MugPreview({ photo, title }: { photo?: string; title: string }) {
  return (
    <Stage>
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_60%,oklch(0.92_0.03_70),oklch(0.85_0.03_50))]">
        <div className="relative h-[58%] w-[64%] rounded-[18px] bg-ivory shadow-lift">
          {/* mug body shadow */}
          <div className="absolute inset-x-3 inset-y-3 overflow-hidden rounded-[12px] bg-secondary">
            {photo ? (
              <img src={photo} alt={title || "Mug print"} className="h-full w-full object-cover" />
            ) : (
              <Placeholder index={0} />
            )}
          </div>
          <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-widest text-charcoal/70">
            {title || "your photo here"}
          </p>
          {/* handle */}
          <span className="absolute -right-6 top-1/2 h-20 w-10 -translate-y-1/2 rounded-r-full border-[6px] border-ivory" aria-hidden="true" />
        </div>
      </div>
    </Stage>
  );
}

// ── Tote ──────────────────────────────────────────────────────────────
function ToteBagPreview({ photo, title }: { photo?: string; title: string }) {
  return (
    <Stage>
      <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,oklch(0.93_0.03_75),oklch(0.84_0.04_70))]">
        <div className="relative h-[80%] w-[64%] bg-[oklch(0.87_0.05_82)] shadow-lift">
          {/* straps */}
          <span className="absolute -top-12 left-3 h-16 w-3 rounded-full border-[3px] border-[oklch(0.55_0.06_60)]" aria-hidden />
          <span className="absolute -top-12 right-3 h-16 w-3 rounded-full border-[3px] border-[oklch(0.55_0.06_60)]" aria-hidden />
          <div className="absolute inset-x-6 top-12 bottom-12 overflow-hidden rounded-md bg-ivory">
            {photo ? (
              <img src={photo} alt={title || "Tote print"} className="h-full w-full object-cover" />
            ) : (
              <Placeholder index={0} />
            )}
          </div>
        </div>
      </div>
    </Stage>
  );
}

// ── T-shirt ───────────────────────────────────────────────────────────
function TshirtPreview({ photo, side }: { photo?: string; side: ProductOptions["tshirtSide"] }) {
  return (
    <Stage>
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_30%,oklch(0.93_0.02_75),oklch(0.84_0.03_60))]">
        <div className="relative h-[82%] w-[80%]">
          <svg viewBox="0 0 200 220" className="absolute inset-0 h-full w-full">
            <path
              d="M30 30 L70 10 Q100 30 130 10 L170 30 L185 70 L150 80 L150 210 L50 210 L50 80 L15 70 Z"
              fill="oklch(0.98 0.01 80)"
              stroke="oklch(0.85 0.02 70)"
              strokeWidth="1.5"
            />
          </svg>
          <div className="absolute left-1/2 top-[34%] h-[40%] w-[40%] -translate-x-1/2 overflow-hidden rounded-md border border-charcoal/10 bg-secondary">
            {photo ? (
              <img src={photo} alt="T-shirt print" className="h-full w-full object-cover" />
            ) : (
              <Placeholder index={0} />
            )}
          </div>
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-card/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal shadow-soft">
          {side ? `${side} print` : "Pick a side"}
        </span>
      </div>
    </Stage>
  );
}

// ── Memory Book ───────────────────────────────────────────────────────
function MemoryBookPreview({ photos, title, pageCount }: { photos: string[]; title: string; pageCount?: number }) {
  const previewSlots = Math.min(pageCount ?? 6, 6);
  const slots = Array.from({ length: previewSlots });
  return (
    <Stage>
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,oklch(0.94_0.02_70),oklch(0.84_0.03_55))]">
        <div className="relative h-[80%] w-[88%] rounded-md bg-[#3a2418] p-3 shadow-lift">
          <div className="h-full w-full rounded-sm bg-ivory p-3">
            <p className="text-center font-semibold text-charcoal text-sm">{title || "Our Memory Book"}</p>
            <p className="mt-0.5 text-center text-[9px] uppercase tracking-widest text-charcoal/60">
              {pageCount ?? "—"} photos · Framely
            </p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {slots.map((_, i) => (
                <div key={i} className="aspect-square overflow-hidden bg-secondary">
                  {photos[i] ? (
                    <img src={photos[i]} alt={`Page ${i + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[8px] uppercase text-muted-foreground">
                      pg {i + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {photos.length > previewSlots && (
              <p className="mt-2 text-center text-[9px] text-charcoal/60">+ {photos.length - previewSlots} more pages</p>
            )}
          </div>
        </div>
      </div>
    </Stage>
  );
}

// ── Gift Box ──────────────────────────────────────────────────────────
function GiftBoxPreview({ photos, options }: { photos: string[]; options: ProductOptions }) {
  const items = options.giftBoxItems ?? [];
  let cursor = 0;
  return (
    <Stage>
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_30%,oklch(0.92_0.04_45),oklch(0.82_0.05_30))]">
        <div className="relative h-[80%] w-[82%] rounded-2xl bg-[oklch(0.55_0.13_32)] p-3 shadow-lift">
          {/* ribbon */}
          <span className="absolute left-1/2 top-0 h-full w-3 -translate-x-1/2 bg-ivory/90" aria-hidden />
          <span className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 bg-ivory/90" aria-hidden />
          <div className="relative grid h-full grid-cols-2 gap-2 rounded-xl bg-ivory/70 p-2 backdrop-blur">
            {items.length === 0 ? (
              <div className="col-span-2 grid place-items-center text-xs text-charcoal/60">
                Select items to fill your gift box
              </div>
            ) : (
              items.map((it) => {
                const label = GIFT_BOX_ITEMS.find((g) => g.id === it)?.label ?? it;
                const photo = photos[cursor++];
                return (
                  <div key={it} className="overflow-hidden rounded-md bg-secondary">
                    <div className="aspect-[4/3] w-full">
                      {photo ? (
                        <img src={photo} alt={label} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">
                          {label}
                        </div>
                      )}
                    </div>
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal/80">
                      {label}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Stage>
  );
}
