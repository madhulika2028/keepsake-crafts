import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, whatsappOrderUrl, type FramelyProduct } from "@/lib/framely-data";
import { SiteHeader } from "@/components/framely/SiteHeader";
import { SiteFooter } from "@/components/framely/SiteFooter";
import { ArrowLeft, Upload, MessageCircle, Save, Image as ImageIcon, Sparkles } from "lucide-react";

const search = z.object({ product: z.string().optional(), design: z.string().optional() });

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
  photoDataUrl: string | null;
  title: string;
  subtitle: string;
  date: string;
  theme: "ivory" | "charcoal" | "terracotta";
  layout: "classic" | "polaroid" | "split";
  quantity: number;
};

const DEFAULT: Customization = {
  productId: "wood-frame",
  photoDataUrl: null,
  title: "",
  subtitle: "",
  date: "",
  theme: "ivory",
  layout: "classic",
  quantity: 1,
};

function Customize() {
  const navigate = useNavigate();
  const { product: productParam, design: designParam } = Route.useSearch();
  const initial = useMemo<Customization>(() => ({ ...DEFAULT, productId: productParam ?? DEFAULT.productId }), [productParam]);
  const [c, setC] = useState<Customization>(initial);
  const [name, setName] = useState("");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loadingDesign, setLoadingDesign] = useState(!!designParam);

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
        setC({ ...DEFAULT, ...cust, productId: data.product_id });
        setName(data.name);
      }
      setLoadingDesign(false);
    })();
  }, [designParam]);

  const product = PRODUCTS.find((p) => p.id === c.productId) ?? PRODUCTS[0];

  const onPhoto = (file: File) => {
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Photo is too large. Please pick one under 6MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setC((s) => ({ ...s, photoDataUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const orderMessage = () => {
    const lines = [
      `Hi Framely! I'd like to order a ${product.name}.`,
      c.title && `Title / Names: ${c.title}`,
      c.subtitle && `Message: ${c.subtitle}`,
      c.date && `Date: ${c.date}`,
      `Theme: ${c.theme}`,
      `Layout: ${c.layout}`,
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
      <div className="min-h-screen">
        <SiteHeader />
        <div className="container-page py-32 text-center text-muted-foreground">Loading your design…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-10 md:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          {/* PREVIEW */}
          <div>
            <div className="card-soft sticky top-24 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-accent" /> Live preview
                </div>
                <span className="text-xs text-muted-foreground">{product.name}</span>
              </div>
              <div className="p-6 md:p-10">
                <LivePreview c={c} product={product} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/30 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Estimated</p>
                  <p className="text-lg font-semibold">{product.price} <span className="text-sm font-normal text-muted-foreground">/ piece</span></p>
                </div>
                <a
                  href={whatsappOrderUrl(orderMessage())}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-cta !py-3 text-sm"
                >
                  <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="space-y-8">
            <header>
              <span className="eyebrow">Studio</span>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Customize your gift</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick a product, upload a photo, add your details — then preview and order.
              </p>
            </header>

            <Section title="1. Choose your product">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setC((s) => ({ ...s, productId: p.id }))}
                    className={`overflow-hidden rounded-2xl border text-left transition ${c.productId === p.id ? "border-accent shadow-lift" : "border-border hover:border-foreground/30"}`}
                  >
                    <img src={p.image} alt={p.name} width={400} height={400} loading="lazy" className="aspect-square w-full object-cover" />
                    <div className="p-2.5">
                      <p className="truncate text-xs font-semibold">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="2. Upload your photo">
              <PhotoUpload value={c.photoDataUrl} onChange={onPhoto} onClear={() => setC((s) => ({ ...s, photoDataUrl: null }))} />
            </Section>

            <Section title="3. Add your personal touch">
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
              </div>
            </Section>

            <Section title="4. Style">
              <div className="space-y-3">
                <Choice
                  label="Theme"
                  options={[
                    { v: "ivory", label: "Ivory" },
                    { v: "charcoal", label: "Charcoal" },
                    { v: "terracotta", label: "Terracotta" },
                  ]}
                  value={c.theme}
                  onChange={(v) => setC((s) => ({ ...s, theme: v as Customization["theme"] }))}
                />
                <Choice
                  label="Layout"
                  options={[
                    { v: "classic", label: "Classic" },
                    { v: "polaroid", label: "Polaroid" },
                    { v: "split", label: "Split" },
                  ]}
                  value={c.layout}
                  onChange={(v) => setC((s) => ({ ...s, layout: v as Customization["layout"] }))}
                />
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

            <Section title="5. Save & order">
              <Field label="Design name (optional)">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anniversary frame for Riya" className="input" maxLength={60} />
              </Field>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={saveDesign} className="btn-ghost">
                  <Save className="h-4 w-4" /> {designParam ? "Update saved design" : "Save design"}
                </button>
                <a href={whatsappOrderUrl(orderMessage())} target="_blank" rel="noreferrer" className="btn-cta">
                  <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                </a>
              </div>
              {!user && (
                <p className="mt-3 text-xs text-muted-foreground">
                  <Link to="/auth" className="underline">Sign in</Link> to save designs and access them across devices.
                </p>
              )}
            </Section>
          </div>
        </div>
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

function Choice<T extends string>({ label, options, value, onChange }: { label: string; options: { v: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`rounded-full border px-4 py-2 text-sm transition ${value === o.v ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:border-foreground/30"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
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
            <img src={value} alt="Your upload" className="h-20 w-20 rounded-xl object-cover" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Photo ready</p>
              <p className="text-xs text-muted-foreground">Looks great in the live preview.</p>
            </div>
            <button onClick={onClear} className="text-sm text-muted-foreground hover:text-destructive">Replace</button>
          </div>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
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

function LivePreview({ c, product }: { c: Customization; product: FramelyProduct }) {
  const themeBg = c.theme === "charcoal" ? "oklch(0.235 0.012 60)" : c.theme === "terracotta" ? "oklch(0.6 0.135 38)" : "oklch(0.965 0.018 78)";
  const themeFg = c.theme === "ivory" ? "oklch(0.235 0.012 60)" : "oklch(0.98 0.01 80)";

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className="relative aspect-square overflow-hidden rounded-[1.5rem] border border-border shadow-soft"
        style={{ background: themeBg, color: themeFg }}
      >
        {c.layout === "split" ? (
          <div className="grid h-full grid-cols-2">
            <PhotoSlot photo={c.photoDataUrl} />
            <Caption c={c} fg={themeFg} centered />
          </div>
        ) : c.layout === "polaroid" ? (
          <div className="flex h-full flex-col items-center justify-center p-6">
            <div className="w-[78%] rounded-md bg-ivory p-3 shadow-lift" style={{ color: "oklch(0.235 0.012 60)" }}>
              <div className="aspect-square overflow-hidden rounded-sm bg-secondary">
                <PhotoSlot photo={c.photoDataUrl} naked />
              </div>
              <div className="pt-3 text-center font-medium">
                {c.title || "Your title"}
              </div>
            </div>
            {(c.subtitle || c.date) && (
              <div className="mt-4 text-center text-xs opacity-80">
                {c.subtitle}{c.subtitle && c.date ? " · " : ""}{c.date}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="absolute inset-0">
              <PhotoSlot photo={c.photoDataUrl} naked />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
            </div>
            <div className="relative flex h-full flex-col justify-end p-6 text-ivory" style={{ color: "oklch(0.98 0.01 80)" }}>
              <Caption c={c} fg="oklch(0.98 0.01 80)" />
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Final printing may slightly vary. Our studio reviews every order before printing.
      </p>
      <p className="mt-1 text-center text-xs text-muted-foreground">Product: <span className="font-medium text-foreground">{product.name}</span></p>
    </div>
  );
}

function PhotoSlot({ photo, naked }: { photo: string | null; naked?: boolean }) {
  if (photo) return <img src={photo} alt="Your memory" className="h-full w-full object-cover" />;
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 text-center ${naked ? "" : "p-6"}`}>
      <ImageIcon className="h-8 w-8 opacity-50" />
      <p className="text-xs opacity-70">Upload a photo to preview it here</p>
    </div>
  );
}

function Caption({ c, fg, centered }: { c: Customization; fg: string; centered?: boolean }) {
  return (
    <div className={`flex h-full flex-col justify-center gap-1.5 p-5 ${centered ? "items-center text-center" : ""}`} style={{ color: fg }}>
      <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">{c.date || "Your date"}</p>
      <h3 className="text-2xl font-semibold leading-tight">{c.title || "Your title"}</h3>
      {c.subtitle && <p className="text-sm opacity-85">{c.subtitle}</p>}
    </div>
  );
}
