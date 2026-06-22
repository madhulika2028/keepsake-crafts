import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/framely/SiteHeader";
import { SiteFooter } from "@/components/framely/SiteFooter";
import { useStoreSnapshot, toggleWishlist } from "@/lib/store";
import { PRODUCTS } from "@/lib/framely-data";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Framely" },
      { name: "description", content: "Save your favourite personalized gifts to design later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStoreSnapshot();
  const items = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="container-page py-10 md:py-14">
        <span className="eyebrow">Saved</span>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Your wishlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any product to add it here.</p>

        {items.length === 0 ? (
          <div className="card-soft mt-10 p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Browse the studio and heart what catches your eye.</p>
            <Link to="/customize" className="btn-cta mt-6">Browse products</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <motion.article key={p.id} whileHover={{ y: -6 }} className="card-soft overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    aria-label="Remove from wishlist"
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/95 text-accent shadow-soft"
                  >
                    <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <span className="text-sm font-semibold text-accent">{p.price}</span>
                  </div>
                  <Link
                    to="/customize"
                    search={{ product: p.id }}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium hover:text-accent"
                  >
                    Customize <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
