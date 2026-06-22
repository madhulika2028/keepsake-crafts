import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useStoreSnapshot } from "@/lib/store";

/** Sticky floating cart pill — appears once the cart has items. */
export function FloatingCheckout() {
  const { cart } = useStoreSnapshot();
  return (
    <AnimatePresence>
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="fixed bottom-5 right-5 z-40 hidden md:block"
        >
          <Link
            to="/cart"
            className="flex items-center gap-3 rounded-full bg-charcoal/95 px-5 py-3 text-ivory shadow-lift backdrop-blur transition hover:scale-105"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">
              {cart.length} item{cart.length === 1 ? "" : "s"} · Review cart
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
