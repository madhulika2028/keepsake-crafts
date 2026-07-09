import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, OCCASIONS, whatsappOrderUrl } from "@/lib/framely-data";
import {
  newCustomization,
  hasOptionsStep,
  optionsValid,
  requiredPhotoCount,
  summarizeOptions,
  priceFor,
  type Customization,
} from "@/lib/customization-rules";
import { addToCart, pushRecent } from "@/lib/store";
import { SiteHeader } from "@/components/framely/SiteHeader";
import { SiteFooter } from "@/components/framely/SiteFooter";
import { OccasionCard } from "@/components/framely/OccasionCard";
import { Stepper } from "@/components/framely/Stepper";
import { ProductPreview } from "@/components/framely/ProductPreview";
import { OptionsPicker } from "@/components/framely/OptionsPicker";
import { MultiPhotoUpload } from "@/components/framely/MultiPhotoUpload";
import { SuccessModal } from "@/components/framely/SuccessModal";
import { ArrowLeft, ArrowRight, MessageCircle, Save, Sparkles, ShoppingBag, Heart } from "lucide-react";

const search = z.object({
  product: z.string().optional(),
  design: z.string().optional(),
  occasion: z.string().optional(),
});

export const Route = createFileRoute("/customize")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Customize Your Gift — Framely Studio" },
      { name: "description", content: "Live preview, strict photo rules and instant WhatsApp ordering for every Framely product." },
    ],
  }),
  component: Customize,
});

const STEPS = [
  { id: "occasion", label: "Occasion" },
  { id: "product", label: "Product" },
  { id: "options", label: "Options" },
  { id: "upload", label: "Upload" },
  { id: "preview", label: "Preview" },
  { id: "order", label: "Order" },
];

function Customize() {
  const navigate = useNavigate();
  const { product: productParam, design: designParam, occasion: occasionParam } = Route.useSearch();

  const initial = useMemo<Customization>(() => {
    const p = PRODUCTS.find((x) => x.id === productParam) ?? PRODUCTS[0];
    return newCustomization(p, occasionParam ?? "birthday");
  }, [productParam, occasionParam]);

  const [c, setC] = useState<Customization>(initial);
  // Determine the initial step from URL: product param skips to options (if any) or upload.
  const initialStep = productParam
    ? (hasOptionsStep(productParam) ? 2 : 3)
    : occasionParam ? 1 : 0;
  const [step, setStep] = useState(initialStep);

  const [name, setName] = useState("");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loadingDesign, setLoadingDesign] = useState(!!designParam);
  const [success, setSuccess] = useState<null | "cart" | "save">(null);

  const product = PRODUCTS.find((p) => p.id === c.productId) ?? PRODUCTS[0];
  const occasion = OCCASIONS.find((o) => o.id === c.occasionId);
  const showOptions = hasOptionsStep(c.productId);
  const required = requiredPhotoCount(c.productId, c.options);
  const photosComplete = required != null && c.photos.length === required;
  const priceStr = priceFor(c.productId, c.options, c.quantity);

  // Restore draft / auth — only when no URL params are pre-selecting a product.
  useEffect(() => {
    if (designParam || productParam) return;
    try {
      const raw = sessionStorage.getItem("framely:draft");
      if (raw) {
        const draft = JSON.parse(raw) as Customization;
        setC((prev) => ({ ...prev, ...draft }));
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem("framely:draft", JSON.stringify(c)); } catch { /* ignore */ }
  }, [c]);
  useEffect(() => { pushRecent(c.productId); }, [c.productId]);


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null),
    );
    const { data } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ? { id: s.user.id, email: s.user.email ?? undefined } : null),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!designParam) return;
    (async () => {
      const { data, error } = await supabase.from("saved_designs").select("*").eq("id", designParam).maybeSingle();
      if (data && !error) {
        const cust = data.customization as Customization;
        setC({ ...newCustomization(PRODUCTS.find((p) => p.id === data.product_id) ?? PRODUCTS[0]), ...cust });
        setName(data.name);
        setStep(3);
      }
      setLoadingDesign(false);
    })();
  }, [designParam]);

  // Skip options step if not applicable
  const goNext = () => {
    setStep((s) => {
      let next = Math.min(STEPS.length - 1, s + 1);
      if (next === 2 && !showOptions) next = 3;
      return next;
    });
  };
  const goPrev = () => {
    setStep((s) => {
      let prev = Math.max(0, s - 1);
      if (prev === 2 && !showOptions) prev = 1;
      return prev;
    });
  };

  const canAdvanceFromOptions = optionsValid(c.productId, c.options);
  const orderMessage = () => {
    const lines = [
      `Hi Framely! I'd like to order a ${product.name}.`,
      occasion && `Occasion: ${occasion.label}`,
      ...summarizeOptions(c.productId, c.options),
      c.title && `Title / Names: ${c.title}`,
      c.subtitle && `Message: ${c.subtitle}`,
      c.date && `Date: ${c.date}`,
      `Quantity: ${c.quantity}`,
      `Estimated price: ${priceStr}`,
      c.photos.length ? `(I'll share ${c.photos.length} photo${c.photos.length === 1 ? "" : "s"} on WhatsApp.)` : "",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleAddToCart = () => {
    if (!photosComplete) {
      toast.error(`Add ${required ?? "the required"} photos first.`);
      return;
    }
    addToCart({
      productId: product.id,
      productName: product.name,
      price: priceStr,
      thumbnail: c.photos[0] ?? null,
      customization: c,
    });
    setSuccess("cart");
  };

  const saveDesign = async () => {
    if (!user) {
      toast.message("Sign in to save your design", { description: "We'll bring you right back." });
      navigate({ to: "/auth", search: { redirect: "/customize" } });
      return;
    }
    const finalName = name.trim() || `${product.name} · ${new Date().toLocaleDateString()}`;
    const payload = {
      user_id: user.id,
      name: finalName,
      product_id: product.id,
      product_name: product.name,
      customization: c,
      preview_image: c.photos[0] ?? null,
    };
    const { error } = designParam
      ? await supabase.from("saved_designs").update(payload).eq("id", designParam)
      : await supabase.from("saved_designs").insert(payload);
    if (error) toast.error(error.message);
    else setSuccess("save");
  };

  if (loadingDesign) {
    return (
      <div className="min-h-dvh">
        <SiteHeader />
        <div className="container-page py-32 text-center text-muted-foreground">Loading your design…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="container-page py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </Link>

        <header className="mt-5">
          <span className="eyebrow">Studio</span>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Customize your gift</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Move through each step at your own pace — your progress is saved automatically.
          </p>
        </header>

        <div className="mt-6">
          <Stepper steps={STEPS} current={step} onJump={(i) => setStep(i)} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 0 — Occasion */}
            {step === 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold">Choose the occasion</h2>
                <p className="mt-1 text-sm text-muted-foreground">Helps us suggest layouts and messaging that fit.</p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                  {OCCASIONS.map((o) => (
                    <OccasionCard
                      key={o.id}
                      occasion={o}
                      selected={c.occasionId === o.id}
                      onSelect={(id) => setC((s) => ({ ...s, occasionId: id }))}
                    />
                  ))}
                </div>
                <StepNav onNext={goNext} nextLabel="Continue to products" />
              </section>
            )}

            {/* STEP 1 — Product */}
            {step === 1 && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold">Pick your product</h2>
                <p className="mt-1 text-sm text-muted-foreground">Selecting a different product resets photos and options.</p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {PRODUCTS.map((p) => (
                    <motion.button
                      key={p.id}
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setC(() => newCustomization(p, c.occasionId))}
                      aria-pressed={c.productId === p.id}
                      className={`overflow-hidden rounded-2xl border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                        c.productId === p.id ? "border-accent shadow-lift" : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" loading="lazy" />
                      <div className="p-3">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.price}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <StepNav onBack={goPrev} onNext={goNext} nextLabel="Continue" />
              </section>
            )}

            {/* STEP 2 — Options */}
            {step === 2 && showOptions && (
              <section className="mt-8 grid gap-8 md:grid-cols-2">
                <PreviewPanel c={c} />
                <div>
                  <OptionsPicker
                    productId={c.productId}
                    options={c.options}
                    onChange={(options) => setC((s) => ({ ...s, options, photos: [] }))}
                  />
                  <StepNav
                    onBack={goPrev}
                    onNext={goNext}
                    nextDisabled={!canAdvanceFromOptions}
                    nextLabel={canAdvanceFromOptions ? "Continue to upload" : "Pick an option to continue"}
                  />
                </div>
              </section>
            )}

            {/* STEP 3 — Upload + Live preview */}
            {step === 3 && (
              <section className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <MultiPhotoUpload
                    photos={c.photos}
                    required={required}
                    max={required ?? undefined}
                    onChange={(photos) => setC((s) => ({ ...s, photos }))}
                    label="Upload your photos"
                  />

                  <Section title="Personal touch (optional)">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Names or title">
                        <input value={c.title} onChange={(e) => setC((s) => ({ ...s, title: e.target.value }))} placeholder="e.g. Riya & Arjun" className="input" maxLength={40} />
                      </Field>
                      <Field label="Date">
                        <input value={c.date} onChange={(e) => setC((s) => ({ ...s, date: e.target.value }))} placeholder="14 Feb 2026" className="input" maxLength={30} />
                      </Field>
                      <Field label="Quote or message" full>
                        <textarea value={c.subtitle} onChange={(e) => setC((s) => ({ ...s, subtitle: e.target.value }))} rows={2} placeholder="Something meaningful…" maxLength={120} className="input resize-none" />
                      </Field>
                      <Field label="Quantity">
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={c.quantity}
                          onChange={(e) => setC((s) => ({ ...s, quantity: Math.max(1, Math.min(500, Number(e.target.value) || 1)) }))}
                          className="input w-32"
                        />
                      </Field>
                    </div>
                  </Section>

                  <StepNav
                    onBack={goPrev}
                    onNext={goNext}
                    nextDisabled={!photosComplete}
                    nextLabel={photosComplete ? "Review preview" : `Add ${required ?? ""} photos to continue`}
                  />
                </div>

                <div className="sticky top-24 self-start">
                  <div className="card-soft overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" /> Live preview
                      </div>
                      <span className="text-xs text-muted-foreground">{product.name}</span>
                    </div>
                    <div className="p-4 md:p-6">
                      <ProductPreview c={c} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 4 — Preview & summary */}
            {step === 4 && (
              <section className="mt-8 grid gap-8 md:grid-cols-2">
                <PreviewPanel c={c} />
                <div className="space-y-4">
                  <div className="card-soft p-6">
                    <h2 className="text-base font-semibold">Order summary</h2>
                    <dl className="mt-4 space-y-2 text-sm">
                      <Row k="Product" v={product.name} />
                      {occasion && <Row k="Occasion" v={occasion.label} />}
                      {summarizeOptions(c.productId, c.options).map((line) => (
                        <Row key={line} k="Detail" v={line} />
                      ))}
                      <Row k="Photos" v={`${c.photos.length}${required ? ` / ${required}` : ""}`} />
                      {c.title && <Row k="Title" v={c.title} />}
                      {c.date && <Row k="Date" v={c.date} />}
                      {c.subtitle && <Row k="Message" v={c.subtitle} />}
                      <Row k="Quantity" v={String(c.quantity)} />
                      <Row k="Estimated price" v={priceStr} />
                    </dl>
                  </div>

                  <Section title="Save your design">
                    <Field label="Design name (optional)">
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anniversary frame for Riya" className="input" maxLength={60} />
                    </Field>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={saveDesign} className="btn-ghost">
                        <Save className="h-4 w-4" aria-hidden="true" /> {designParam ? "Update saved" : "Save design"}
                      </button>
                      <button onClick={handleAddToCart} className="btn-cta">
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Add to cart
                      </button>
                    </div>
                  </Section>

                  <StepNav onBack={goPrev} onNext={goNext} nextLabel="Continue to order" />
                </div>
              </section>
            )}

            {/* STEP 5 — Order */}
            {step === 5 && (
              <section className="mt-8 mx-auto max-w-2xl">
                <div className="card-soft p-8 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
                    <MessageCircle className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold">Place your order on WhatsApp</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We'll confirm details, share a final proof, and start printing once you approve.
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <a href={whatsappOrderUrl(orderMessage())} target="_blank" rel="noreferrer" className="btn-cta">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> Order on WhatsApp
                    </a>
                    <button onClick={handleAddToCart} className="btn-ghost">
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Add to cart instead
                    </button>
                  </div>
                  <p className="mt-6 text-xs text-muted-foreground">
                    Total estimated: <span className="font-medium text-foreground">{priceStr}</span>
                  </p>
                  <ul className="mt-6 grid gap-2 text-left text-xs text-muted-foreground sm:grid-cols-3">
                    <li className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" /> Free reprint on defects</li>
                    <li className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" /> Ships in 3–5 days</li>
                    <li className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" /> Your photos stay private</li>
                  </ul>
                </div>
                <div className="mt-4 text-center">
                  <button onClick={goPrev} className="text-sm text-muted-foreground hover:text-foreground">← Back to preview</button>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />

      <SuccessModal
        open={success === "cart"}
        onClose={() => setSuccess(null)}
        title="Added to your cart!"
        description="Your customization is saved. You can keep shopping or check out on WhatsApp."
      >
        <Link to="/cart" className="btn-cta">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" /> View cart
        </Link>
        <button onClick={() => setSuccess(null)} className="btn-ghost">Keep customizing</button>
      </SuccessModal>

      <SuccessModal
        open={success === "save"}
        onClose={() => setSuccess(null)}
        title="Design saved"
        description="Find it anytime under My Designs."
      >
        <Link to="/designs" className="btn-cta"><Heart className="h-4 w-4" aria-hidden="true" /> View saved designs</Link>
        <button onClick={() => setSuccess(null)} className="btn-ghost">Close</button>
      </SuccessModal>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-border);
          background: var(--color-card);
          padding: 0.7rem 0.9rem;
          font-size: 0.92rem;
          color: var(--color-foreground);
          transition: border-color 0.2s, box-shadow 0.2s;
          min-height: 2.75rem;
        }
        .input:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 4px oklch(0.6 0.135 38 / 0.12); }
      `}</style>
    </div>
  );
}

function PreviewPanel({ c }: { c: Customization }) {
  const product = PRODUCTS.find((p) => p.id === c.productId)!;
  return (
    <div className="card-soft overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" /> Live preview
        </div>
        <span className="text-xs text-muted-foreground">{product.name}</span>
      </div>
      <div className="p-4 md:p-6">
        <ProductPreview c={c} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-soft p-5 md:p-6">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}

function StepNav({ onBack, onNext, nextLabel = "Next", nextDisabled }: { onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      {onBack ? (
        <button onClick={onBack} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</button>
      ) : (
        <span />
      )}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className="btn-cta disabled:cursor-not-allowed disabled:opacity-50">
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
