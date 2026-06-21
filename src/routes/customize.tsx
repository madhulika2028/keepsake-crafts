import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, OCCASIONS, whatsappOrderUrl, type FramelyProduct } from "@/lib/framely-data";
import { SiteHeader } from "@/components/framely/SiteHeader";
import { SiteFooter } from "@/components/framely/SiteFooter";
import { OccasionCard } from "@/components/framely/OccasionCard";
import { Stepper } from "@/components/framely/Stepper";
import { LiveMockup, makeDefaultMockup, type MockupState } from "@/components/framely/LiveMockup";
import { ArrowLeft, ArrowRight, Upload, MessageCircle, Save, Sparkles } from "lucide-react";

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
      { name: "description", content: "Upload your photo, pick a product, add your details and preview your personalized gift live before ordering on WhatsApp." },
    ],
  }),
  component: Customize,
});

type Customization = {
  productId: string;
  occasionId: string;
  photoDataUrl: string | null;
  title: string;
  subtitle: string;
  date: string;
  quantity: number;
  mockup: MockupState;
};

const STEPS = [
  { id: "occasion", label: "Occasion" },
  { id: "product", label: "Product" },
  { id: "customize", label: "Customize" },
  { id: "preview", label: "Preview" },
  { id: "checkout", label: "Order" },
];

function buildDefault(productId: string, occasionId?: string): Customization {
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
  return {
    productId: product.id,
    occasionId: occasionId ?? "birthday",
    photoDataUrl: null,
    title: "",
    subtitle: "",
    date: "",
    quantity: 1,
    mockup: makeDefaultMockup(product),
  };
}

function Customize() {
  const navigate = useNavigate();
  const { product: productParam, design: designParam, occasion: occasionParam } = Route.useSearch();
  const initial = useMemo<Customization>(
    () => buildDefault(productParam ?? "wood-frame", occasionParam),
    [productParam, occasionParam],
  );
  const [c, setC] = useState<Customization>(initial);
  const [step, setStep] = useState(occasionParam || productParam ? 2 : 0);
  const [name, setName] = useState("");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loadingDesign, setLoadingDesign] = useState(!!designParam);

  // Persist across reloads
  useEffect(() => {
    if (designParam) return;
    try {
      const raw = sessionStorage.getItem("framely:draft");
      if (raw) {
        const draft = JSON.parse(raw) as Customization;
        setC((prev) => ({ ...prev, ...draft }));
      }
    } catch {/* ignore */}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem("framely:draft", JSON.stringify(c)); } catch {/* ignore */}
  }, [c]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null));
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
        const product = PRODUCTS.find((p) => p.id === data.product_id) ?? PRODUCTS[0];
        setC({ ...buildDefault(product.id), ...cust, productId: data.product_id });
        setName(data.name);
        setStep(2);
      }
      setLoadingDesign(false);
    })();
  }, [designParam]);

  const product = PRODUCTS.find((p) => p.id === c.productId) ?? PRODUCTS[0];
  const occasion = OCCASIONS.find((o) => o.id === c.occasionId);

  const onPhoto = (file: File) => {
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Photo is too large. Please pick one under 6MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      // reset transform so canvas re-centers
      setC((s) => ({ ...s, photoDataUrl: dataUrl, mockup: makeDefaultMockup(product) }));
      toast.success("Photo uploaded — drag it on the preview to position.");
    };
    reader.readAsDataURL(file);
  };

  const orderMessage = () => {
    const lines = [
      `Hi Framely! I'd like to order a ${product.name}.`,
      occasion && `Occasion: ${occasion.label}`,
      c.title && `Title / Names: ${c.title}`,
      c.subtitle && `Message: ${c.subtitle}`,
      c.date && `Date: ${c.date}`,
      c.mockup.colorId && `Color: ${c.mockup.colorId}`,
      `Quantity: ${c.quantity}`,
      `Price (est.): ${product.price}`,
      c.photoDataUrl ? "(I'll share the photo on WhatsApp.)" : "",
    ].filter(Boolean);
    return lines.join("\n");
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
      preview_image: c.photoDataUrl,
    };
    const { error } = designParam
      ? await supabase.from("saved_designs").update(payload).eq("id", designParam)
      : await supabase.from("saved_designs").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Design saved");
      navigate({ to: "/designs" });
    }
  };

  if (loadingDesign) {
    return (
      <div className="min-h-dvh">
        <SiteHeader />
        <div className="container-page py-32 text-center text-muted-foreground">Loading your design…</div>
      </div>
    );
  }

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

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
            <StepNav onNext={next} nextLabel="Continue to products" />
          </section>
        )}

        {/* STEP 1 — Product */}
        {step === 1 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Pick your product</h2>
            <p className="mt-1 text-sm text-muted-foreground">You can change this anytime — your design carries over.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setC((s) => ({ ...s, productId: p.id, mockup: makeDefaultMockup(p) }))}
                  aria-pressed={c.productId === p.id}
                  className={`overflow-hidden rounded-2xl border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                    c.productId === p.id ? "border-accent shadow-lift" : "border-border hover:border-foreground/30"
                  }`}
                >
                  <img src={p.image} alt={p.name} width={400} height={400} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.price}</p>
                  </div>
                </button>
              ))}
            </div>
            <StepNav onBack={prev} onNext={next} nextLabel="Start customizing" />
          </section>
        )}

        {/* STEP 2 — Customize (split layout) */}
        {step === 2 && (
          <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <div className="card-soft sticky top-24 overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" /> Live preview
                  </div>
                  <span className="text-xs text-muted-foreground">{product.name}</span>
                </div>
                <div className="p-4 md:p-6">
                  <LiveMockup
                    product={product}
                    photoDataUrl={c.photoDataUrl}
                    state={c.mockup}
                    onChange={(m) => setC((s) => ({ ...s, mockup: m }))}
                    text={c.title}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Section title="Upload your photo">
                <PhotoUpload value={c.photoDataUrl} onChange={onPhoto} onClear={() => setC((s) => ({ ...s, photoDataUrl: null }))} />
              </Section>

              <Section title="Personal touch">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Names or title">
                    <input
                      value={c.title}
                      onChange={(e) => setC((s) => ({ ...s, title: e.target.value }))}
                      placeholder="e.g. Riya & Arjun"
                      className="input"
                      maxLength={40}
                    />
                  </Field>
                  <Field label="Date">
                    <input
                      value={c.date}
                      onChange={(e) => setC((s) => ({ ...s, date: e.target.value }))}
                      placeholder="e.g. 14 Feb 2024"
                      className="input"
                      maxLength={30}
                    />
                  </Field>
                  <Field label="Quote or message" full>
                    <textarea
                      value={c.subtitle}
                      onChange={(e) => setC((s) => ({ ...s, subtitle: e.target.value }))}
                      placeholder="Something meaningful…"
                      rows={2}
                      maxLength={120}
                      className="input resize-none"
                    />
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

              <Section title="Save your design">
                <Field label="Design name (optional)">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anniversary frame for Riya" className="input" maxLength={60} />
                </Field>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={saveDesign} className="btn-ghost">
                    <Save className="h-4 w-4" aria-hidden="true" /> {designParam ? "Update saved design" : "Save design"}
                  </button>
                </div>
                {!user && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    <Link to="/auth" className="underline">Sign in</Link> to save designs and access them across devices.
                  </p>
                )}
              </Section>

              <StepNav onBack={prev} onNext={next} nextLabel="Review preview" />
            </div>
          </section>
        )}

        {/* STEP 3 — Preview */}
        {step === 3 && (
          <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
            <div className="card-soft overflow-hidden">
              <div className="border-b border-border bg-secondary/40 px-5 py-3 text-sm">
                Final preview — this is exactly what we'll print.
              </div>
              <div className="p-4 md:p-6">
                <LiveMockup
                  product={product}
                  photoDataUrl={c.photoDataUrl}
                  state={c.mockup}
                  onChange={(m) => setC((s) => ({ ...s, mockup: m }))}
                  text={c.title}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="card-soft p-6">
                <h2 className="text-base font-semibold">Order summary</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row k="Product" v={product.name} />
                  {occasion && <Row k="Occasion" v={occasion.label} />}
                  {c.title && <Row k="Title" v={c.title} />}
                  {c.date && <Row k="Date" v={c.date} />}
                  {c.subtitle && <Row k="Message" v={c.subtitle} />}
                  <Row k="Quantity" v={String(c.quantity)} />
                  <Row k="Estimated price" v={product.price} />
                </dl>
              </div>
              <StepNav onBack={prev} onNext={next} nextLabel="Continue to order" />
            </div>
          </section>
        )}

        {/* STEP 4 — Checkout (WhatsApp) */}
        {step === 4 && (
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
                <a
                  href={whatsappOrderUrl(orderMessage())}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-cta"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Order on WhatsApp
                </a>
                <button onClick={saveDesign} className="btn-ghost">
                  <Save className="h-4 w-4" aria-hidden="true" /> Save & order later
                </button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Total estimated: <span className="font-medium text-foreground">{product.price} × {c.quantity}</span>
              </p>
            </div>
            <div className="mt-4 text-center">
              <button onClick={prev} className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to preview
              </button>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-soft p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function StepNav({ onBack, onNext, nextLabel }: { onBack?: () => void; onNext?: () => void; nextLabel?: string }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      {onBack ? (
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </button>
      ) : <span />}
      {onNext && (
        <button onClick={onNext} className="btn-cta">
          {nextLabel ?? "Continue"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function PhotoUpload({ value, onChange, onClear }: { value: string | null; onChange: (f: File) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const f = e.dataTransfer.files?.[0]; if (f) onChange(f);
        }}
        className={`relative grid place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition ${drag ? "border-accent bg-accent/5" : "border-border bg-secondary/40"}`}
      >
        {value ? (
          <div className="flex w-full items-center gap-4">
            <img src={value} alt="Your uploaded design" className="h-20 w-20 rounded-xl object-cover" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Photo ready</p>
              <p className="text-xs text-muted-foreground">Drag it on the preview to position.</p>
            </div>
            <button onClick={onClear} className="text-sm text-muted-foreground hover:text-destructive">Replace</button>
          </div>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent" aria-hidden="true">
              <Upload className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-medium">Drop a photo here or tap to upload</p>
            <p className="text-xs text-muted-foreground">JPG or PNG · up to 6MB</p>
            <button onClick={() => inputRef.current?.click()} className="btn-ghost mt-4 !py-2 text-sm">Choose photo</button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }}
        />
      </div>
    </div>
  );
}

export type { Customization };
