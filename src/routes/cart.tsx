import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MessageCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/framely/SiteHeader";
import { SiteFooter } from "@/components/framely/SiteFooter";
import { useStoreSnapshot, removeFromCart, clearCart } from "@/lib/store";
import { summarizeOptions } from "@/lib/customization-rules";
import { whatsappOrderUrl } from "@/lib/framely-data";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Framely" },
      { name: "description", content: "Review your personalized gifts and place your order on WhatsApp." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart } = useStoreSnapshot();

  const total = cart.reduce((sum, item) => {
    const n = parseInt(item.price.replace(/[^\d]/g, ""), 10) || 0;
    return sum + n;
  }, 0);

  const orderMessage = () => {
    const lines: string[] = ["Hi Framely! I'd like to order the following:"];
    cart.forEach((item, i) => {
      lines.push(`\n${i + 1}. ${item.productName} — ${item.price}`);
      summarizeOptions(item.customization.productId, item.customization.options).forEach((s) => lines.push(`   • ${s}`));
      lines.push(`   • Photos: ${item.customization.photos.length}`);
      if (item.customization.title) lines.push(`   • Title: ${item.customization.title}`);
      if (item.customization.date) lines.push(`   • Date: ${item.customization.date}`);
      if (item.customization.quantity > 1) lines.push(`   • Qty: ${item.customization.quantity}`);
    });
    lines.push(`\nEstimated total: ₹${total.toLocaleString("en-IN")}`);
    lines.push("(I'll share the photos here on WhatsApp.)");
    return lines.join("\n");
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="container-page py-10 md:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue shopping
        </Link>
        <header className="mt-5">
          <span className="eyebrow">Cart</span>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Your personalized gifts</h1>
        </header>

        {cart.length === 0 ? (
          <div className="card-soft mt-10 p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Start by customizing a gift you love.</p>
            <Link to="/customize" className="btn-cta mt-6">Start customizing</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <ul className="space-y-4">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="card-soft flex gap-4 p-4"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] uppercase text-muted-foreground">Custom</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm font-semibold text-accent shrink-0">{item.price}</span>
                      </div>
                      <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                        {summarizeOptions(item.customization.productId, item.customization.options).map((s) => (
                          <li key={s}>• {s}</li>
                        ))}
                        <li>• Photos: {item.customization.photos.length}</li>
                        {item.customization.title && <li>• Title: {item.customization.title}</li>}
                        {item.customization.quantity > 1 && <li>• Quantity: {item.customization.quantity}</li>}
                      </ul>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive">Clear cart</button>
            </ul>

            <aside className="card-soft h-fit p-6">
              <h2 className="text-base font-semibold">Order total</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Items</dt><dd>{cart.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold">₹{total.toLocaleString("en-IN")}</dd></div>
                <div className="flex justify-between text-xs text-muted-foreground"><dt>Shipping</dt><dd>Confirmed on WhatsApp</dd></div>
              </dl>
              <a href={whatsappOrderUrl(orderMessage())} target="_blank" rel="noreferrer" className="btn-cta mt-6 w-full">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Order on WhatsApp
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">We'll send a proof for approval before printing.</p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
