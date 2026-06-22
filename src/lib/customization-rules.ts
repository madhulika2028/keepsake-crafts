// Per-product customization rules + helpers used by the studio flow.
import { PRODUCTS, type FramelyProduct } from "./framely-data";

export type ProductKind =
  | "photo-strip"
  | "polaroid"
  | "wood-frame"
  | "photo-mug"
  | "tote"
  | "tshirt"
  | "memory-book"
  | "gift-box";

export type FrameSize = "small" | "medium" | "large";
export type TshirtSide = "front" | "back" | "both";

export type GiftBoxItem =
  | "photo-strip"
  | "polaroid"
  | "wood-frame"
  | "photo-mug"
  | "tote"
  | "tshirt"
  | "memory-book"
  | "keychain"
  | "mini-frame";

export const FRAME_SIZE_OPTIONS: { id: FrameSize; label: string; dimensions: string; priceAdd: number }[] = [
  { id: "small", label: "Small", dimensions: '6" × 8"', priceAdd: 0 },
  { id: "medium", label: "Medium", dimensions: '8" × 10"', priceAdd: 200 },
  { id: "large", label: "Large", dimensions: '12" × 16"', priceAdd: 500 },
];

export const MEMORY_BOOK_COUNTS = [30, 40, 50, 60, 80, 100] as const;

export const GIFT_BOX_ITEMS: { id: GiftBoxItem; label: string; needsPhotos: number }[] = [
  { id: "photo-strip", label: "Photo Strip", needsPhotos: 4 },
  { id: "polaroid", label: "Polaroid Set", needsPhotos: 12 },
  { id: "wood-frame", label: "Wooden Frame", needsPhotos: 1 },
  { id: "photo-mug", label: "Coffee Mug", needsPhotos: 1 },
  { id: "tote", label: "Tote Bag", needsPhotos: 1 },
  { id: "tshirt", label: "T-Shirt", needsPhotos: 1 },
  { id: "memory-book", label: "Memory Book", needsPhotos: 30 },
  { id: "keychain", label: "Keychain", needsPhotos: 1 },
  { id: "mini-frame", label: "Mini Frame", needsPhotos: 1 },
];

export type ProductOptions = {
  frameSize?: FrameSize;
  tshirtSide?: TshirtSide;
  memoryBookCount?: number;
  giftBoxItems?: GiftBoxItem[];
  mugColor?: string;
  toteColor?: string;
  tshirtColor?: string;
};

export type Customization = {
  productId: string;
  occasionId: string;
  photos: string[]; // dataURLs
  title: string;
  subtitle: string;
  date: string;
  quantity: number;
  options: ProductOptions;
};

export function kindOf(productId: string): ProductKind {
  // productId already matches the kinds above
  return productId as ProductKind;
}

/** Returns required photo count for a product, or null if variable / not yet set. */
export function requiredPhotoCount(productId: string, options: ProductOptions): number | null {
  switch (productId) {
    case "photo-strip":
      return 4;
    case "polaroid":
      return 12;
    case "wood-frame":
      return options.frameSize ? 1 : null; // must pick size first
    case "photo-mug":
      return 1;
    case "tote":
      return 1;
    case "tshirt":
      return options.tshirtSide ? (options.tshirtSide === "both" ? 1 : 1) : null;
    case "memory-book":
      return options.memoryBookCount ?? null;
    case "gift-box": {
      const items = options.giftBoxItems ?? [];
      if (items.length === 0) return null;
      return items.reduce((acc, id) => {
        const def = GIFT_BOX_ITEMS.find((g) => g.id === id);
        return acc + (def?.needsPhotos ?? 0);
      }, 0);
    }
    default:
      return 1;
  }
}

/** True if product has an "options" step before upload. */
export function hasOptionsStep(productId: string): boolean {
  return ["wood-frame", "tshirt", "memory-book", "gift-box"].includes(productId);
}

export function optionsValid(productId: string, opts: ProductOptions): boolean {
  switch (productId) {
    case "wood-frame":
      return !!opts.frameSize;
    case "tshirt":
      return !!opts.tshirtSide;
    case "memory-book":
      return !!opts.memoryBookCount && opts.memoryBookCount >= 30;
    case "gift-box":
      return (opts.giftBoxItems ?? []).length > 0;
    default:
      return true;
  }
}

export function summarizeOptions(productId: string, opts: ProductOptions): string[] {
  const lines: string[] = [];
  if (productId === "wood-frame" && opts.frameSize) {
    const s = FRAME_SIZE_OPTIONS.find((f) => f.id === opts.frameSize);
    lines.push(`Size: ${s?.label} (${s?.dimensions})`);
  }
  if (productId === "tshirt" && opts.tshirtSide) {
    const map: Record<TshirtSide, string> = { front: "Front print", back: "Back print", both: "Both sides" };
    lines.push(`Print: ${map[opts.tshirtSide]}`);
  }
  if (productId === "memory-book" && opts.memoryBookCount) {
    lines.push(`Pages: ${opts.memoryBookCount} photos`);
  }
  if (productId === "gift-box" && opts.giftBoxItems?.length) {
    const labels = opts.giftBoxItems.map((id) => GIFT_BOX_ITEMS.find((g) => g.id === id)?.label).filter(Boolean);
    lines.push(`Includes: ${labels.join(", ")}`);
  }
  return lines;
}

export function priceFor(productId: string, opts: ProductOptions, qty: number): string {
  const product = PRODUCTS.find((p) => p.id === productId);
  const base = product ? parseInt(product.price.replace(/[^\d]/g, ""), 10) || 0 : 0;
  let total = base;
  if (productId === "wood-frame" && opts.frameSize) {
    total += FRAME_SIZE_OPTIONS.find((f) => f.id === opts.frameSize)?.priceAdd ?? 0;
  }
  if (productId === "tshirt" && opts.tshirtSide === "both") total += 150;
  if (productId === "memory-book" && opts.memoryBookCount) {
    total += Math.max(0, opts.memoryBookCount - 30) * 20;
  }
  if (productId === "gift-box" && opts.giftBoxItems?.length) {
    total += opts.giftBoxItems.length * 100;
  }
  total *= Math.max(1, qty);
  return `₹${total.toLocaleString("en-IN")}`;
}

export function newCustomization(p: FramelyProduct, occasionId = "birthday"): Customization {
  return {
    productId: p.id,
    occasionId,
    photos: [],
    title: "",
    subtitle: "",
    date: "",
    quantity: 1,
    options: {},
  };
}
