// Lightweight client-side store for cart / wishlist / recently viewed.
// Persists to localStorage and broadcasts updates via a custom event so
// listeners (header badge, cart page) stay in sync without a state lib.
import { useEffect, useState } from "react";
import type { Customization } from "./customization-rules";

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  price: string;
  thumbnail: string | null;
  customization: Customization;
  addedAt: number;
};

const CART_KEY = "framely:cart";
const WISH_KEY = "framely:wishlist";
const RECENT_KEY = "framely:recent";
const EVT = "framely:store-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {
    /* quota or denied storage — ignore */
  }
}

// ── Cart ──────────────────────────────────────────────────────────────
export function getCart(): CartItem[] {
  return read<CartItem[]>(CART_KEY, []);
}
export function addToCart(item: Omit<CartItem, "id" | "addedAt">) {
  const cart = getCart();
  cart.push({ ...item, id: crypto.randomUUID(), addedAt: Date.now() });
  write(CART_KEY, cart);
}
export function removeFromCart(id: string) {
  write(CART_KEY, getCart().filter((i) => i.id !== id));
}
export function clearCart() {
  write(CART_KEY, []);
}

// ── Wishlist ──────────────────────────────────────────────────────────
export function getWishlist(): string[] {
  return read<string[]>(WISH_KEY, []);
}
export function toggleWishlist(productId: string): boolean {
  const list = getWishlist();
  const next = list.includes(productId) ? list.filter((id) => id !== productId) : [...list, productId];
  write(WISH_KEY, next);
  return next.includes(productId);
}
export function isWishlisted(productId: string) {
  return getWishlist().includes(productId);
}

// ── Recently viewed ───────────────────────────────────────────────────
export function getRecent(): string[] {
  return read<string[]>(RECENT_KEY, []);
}
export function pushRecent(productId: string) {
  const list = [productId, ...getRecent().filter((id) => id !== productId)].slice(0, 6);
  write(RECENT_KEY, list);
}

// ── React hook ────────────────────────────────────────────────────────
export function useStoreSnapshot() {
  const [snap, setSnap] = useState({ cart: [] as CartItem[], wishlist: [] as string[], recent: [] as string[] });
  useEffect(() => {
    const sync = () => setSnap({ cart: getCart(), wishlist: getWishlist(), recent: getRecent() });
    sync();
    const onEvt = () => sync();
    window.addEventListener(EVT, onEvt);
    window.addEventListener("storage", onEvt);
    return () => {
      window.removeEventListener(EVT, onEvt);
      window.removeEventListener("storage", onEvt);
    };
  }, []);
  return snap;
}
