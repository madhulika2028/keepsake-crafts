import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Reveal } from "@/components/framely/Reveal";
import { SiteHeader } from "@/components/framely/SiteHeader";
import { SiteFooter } from "@/components/framely/SiteFooter";
import { OccasionCard } from "@/components/framely/OccasionCard";
import { TrustBadges } from "@/components/framely/TrustBadges";
import { FAQ } from "@/components/framely/FAQ";
import { HeroParticles } from "@/components/framely/HeroParticles";
import { FloatingCheckout } from "@/components/framely/FloatingCheckout";

import { useState, type FormEvent } from "react";
import {
  PRODUCTS,
  OCCASIONS,
  REASONS,
  AUDIENCES,
  TESTIMONIALS,
  whatsappOrderUrl,
  type FramelyProduct,
} from "@/lib/framely-data";
import { toggleWishlist, useStoreSnapshot } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroCollage from "@/assets/hero-collage.jpg";
import {
  ArrowRight,
  Upload,
  Wand2,
  Eye,
  MessageCircle,
  Check,
  Sparkles,
  Heart,
  Star,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Framely — Personalized Gifts & Custom Printing in Tirupati" },
      { name: "description", content: "Turn your photos into personalized frames, mugs, polaroids, T-shirts and memory books. Live preview, premium printing, easy WhatsApp ordering. Made with love in Tirupati." },
      { property: "og:title", content: "Framely — Personalized Gifts & Custom Printing in Tirupati" },
      { property: "og:description", content: "Turn your photos into personalized frames, mugs, polaroids, T-shirts and memory books. Live preview, premium printing, easy WhatsApp ordering. Made with love in Tirupati." },
      { property: "og:image", content: heroCollage },
      { name: "twitter:image", content: heroCollage },
    ],
    links: [
      { rel: "preload", as: "image", href: heroCollage, fetchPriority: "high" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main>
        <Hero />
        <TrustStrip />
        <AIRecommender />
        <Products />
        <RecentlyViewed />
        <HowItWorks />
        <Why />
        <Occasions />
        <Services />
        <EmotionalBrand />
        <Audience />
        <Testimonials />
        <TrustBadges />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
      <MobileStickyCTA />
      <FloatingCheckout />
    </div>
  );
}



function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroParticles />
      <div className="container-page relative grid items-center gap-8 pt-6 pb-8 md:grid-cols-2 md:gap-10 md:pt-10 md:pb-12">

        <div className="animate-fade-up">
          <span className="eyebrow">Personalized Gifting Studio · Tirupati</span>
          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-6xl">
            Turn your memories
            <br />
            into gifts you can{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-accent">hold</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-accent/15" />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Upload your favorite photos and create personalized frames, mugs, T-shirts, polaroid prints, memory books and custom gifts — designed with love, printed in premium quality.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/customize" className="btn-cta">
              Customize Your Gift <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#products" className="btn-ghost">Explore Products</a>
          </div>
          <ul className="mt-7 grid max-w-lg grid-cols-2 gap-3 text-sm text-muted-foreground">
            {["Easy photo upload", "Live preview", "Premium printing", "Perfect for any occasion"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-rose/30 via-beige to-ivory blur-xl opacity-70" aria-hidden="true" />
          <div className="relative max-h-[50vh] overflow-hidden rounded-[2rem] border border-border shadow-soft animate-float aspect-[4/5] md:aspect-[5/6]">
            <img
              src={heroCollage}
              alt="Premium flat-lay of personalized Framely gifts: wooden photo frame, polaroid prints, custom mug and memory book on cream linen."
              width={1536}
              height={1280}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[center_top] md:object-center"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-soft md:flex md:items-center md:gap-3">
            <Heart className="h-5 w-5 text-accent" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-semibold leading-tight">2,400+ memories</p>
              <p className="text-muted-foreground">crafted and gifted</p>
            </div>
          </div>
          <div className="absolute -top-4 right-4 hidden rounded-2xl border border-border bg-card px-4 py-2 shadow-soft md:flex md:items-center md:gap-2">
            <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
            <span className="text-sm font-medium">4.9 / 5 · 850 reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = ["Premium printing", "Live photo preview", "Mobile-friendly studio", "WhatsApp ordering", "Saved designs"];
  return (
    <div className="border-y border-border bg-secondary/40">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {items.map((i) => (
          <span key={i} className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-accent" aria-hidden="true" /> {i}</span>
        ))}
      </div>
    </div>
  );
}

function AIRecommender() {
  const [occasion, setOccasion] = useState("");
  const [interests, setInterests] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ product: FramelyProduct; reason: string }[] | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!occasion || !interests) {
      setError("Please fill in the occasion and their interests.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("recommend-gifts", {
        body: { occasion, recipientInterests: interests, budget: budget || undefined },
      });
      if (fnError) throw fnError;
      const recs = (data?.recommendations ?? []) as { productId: string; reason: string }[];
      const matched = recs
        .map((r) => {
          const product = PRODUCTS.find((p) => p.id === r.productId);
          return product ? { product, reason: r.reason } : null;
        })
        .filter((x): x is { product: FramelyProduct; reason: string } => Boolean(x));
      if (matched.length === 0) throw new Error("No matches returned.");
      setResults(matched);
    } catch (err) {
      console.error(err);
      setError("Something went wrong getting suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="ai-gift-finder" className="bg-secondary/40 py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">AI Gift Finder</span>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Not sure what to get? Ask AI.</h2>
            <p className="mt-4 text-muted-foreground">Tell us the occasion and who it's for — we'll suggest the perfect personalized gift.</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <form onSubmit={handleSubmit} className="card-soft mx-auto mt-10 max-w-3xl p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="ai-occasion" className="text-sm font-medium">Occasion</label>
                <input
                  id="ai-occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="e.g. Anniversary"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="ai-interests" className="text-sm font-medium">Their interests</label>
                <input
                  id="ai-interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. loves gardening, coffee"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="ai-budget" className="text-sm font-medium">Budget (optional)</label>
                <input
                  id="ai-budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. under ₹800"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-cta mt-6 w-full justify-center disabled:opacity-60">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> Get AI Suggestions
                </>
              )}
            </button>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </form>
        </Reveal>

        {results && (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {results.map(({ product, reason }, i) => (
              <Reveal key={product.id} delay={i * 80}>
                <div className="card-soft flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-semibold">{product.name}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{reason}</p>
                    <Link
                      to="/customize"
                      search={{ product: product.id }}
                      className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-medium text-foreground transition hover:text-accent"
                    >
                      Customize Now <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Products() {
  const { wishlist } = useStoreSnapshot();
  return (
    <section id="products" className="container-page py-20 md:py-28">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Our Studio</span>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Personalized Gifts Made for Every Memory</h2>
          <p className="mt-4 text-muted-foreground">A curated range of keepsakes — designed to feel personal, printed to feel premium.</p>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p, i) => {
          const wished = wishlist.includes(p.id);
          return (
            <Reveal key={p.id} delay={i * 60}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="card-soft group flex h-full flex-col overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={p.image}
                    alt={`${p.name} — ${p.tagline}`}
                    width={768}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
                  />
                  {p.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent backdrop-blur">
                      {p.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                    onClick={() => {
                      const on = toggleWishlist(p.id);
                      toast.success(on ? "Saved to wishlist" : "Removed from wishlist");
                    }}
                    className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
                      wished ? "bg-accent text-accent-foreground" : "bg-card/90 text-foreground hover:bg-card"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-semibold leading-tight">{p.name}</h3>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Starting at</p>
                      <p className="text-sm font-semibold text-accent">{p.price}</p>
                    </div>
                  </div>
                 <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{p.tagline}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> Ships in 3–5 days
                  </p>
                  <Link
                    to="/customize"
                    search={{ product: p.id }}
                    className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-medium text-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md"
                  >
                    Customize Now <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </motion.article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function RecentlyViewed() {
  const { recent } = useStoreSnapshot();
  const items = recent
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));
  if (items.length === 0) return null;
  return (
    <section aria-label="Recently viewed" className="container-page pb-4 pt-8 md:pt-12">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="eyebrow">Just for you</span>
          <h2 className="mt-1 text-xl font-semibold md:text-2xl">Recently viewed</h2>
        </div>
        <Link to="/customize" className="text-sm font-medium text-accent hover:underline">Start new</Link>
      </div>
      <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {items.map((p) => (
          <Link
            key={p.id}
            to="/customize"
            search={{ product: p.id }}
            className="group card-soft w-40 shrink-0 snap-start overflow-hidden sm:w-48"
          >
            <div className="aspect-square overflow-hidden bg-secondary">
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-accent">{p.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}



function HowItWorks() {
  const steps = [
    { icon: Upload, title: "Upload your photos", copy: "Drag and drop photos from your phone or computer in seconds." },
    { icon: Wand2, title: "Customize with details", copy: "Add names, quotes, dates and pick a layout you love." },
    { icon: Eye, title: "Preview & place order", copy: "See a live preview, then place your order on WhatsApp." },
  ];
  return (
    <section id="how" className="bg-secondary/40 py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Create Your Gift in 3 Simple Steps</h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className="card-soft hover-lift relative p-7">
                <span className="absolute right-5 top-5 text-5xl font-semibold text-accent/15" aria-hidden="true">0{i + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent" aria-hidden="true">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/customize" className="btn-cta">Start Creating Now <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section id="why" className="container-page py-20 md:py-28">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Why Framely</span>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Why People Love Framely</h2>
          <p className="mt-4 text-muted-foreground">A studio built for thoughtful gifts — easy, beautiful and reliable.</p>
        </div>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((r, i) => (
          <Reveal key={r.title} delay={i * 50}>
            <div className="card-soft hover-lift h-full p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/10 text-accent" aria-hidden="true">
     <r.icon className="h-5 w-5" />
   </div>
              <h3 className="mt-4 text-base font-semibold">{r.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Occasions() {
  return (
    <section id="occasions" className="bg-secondary/40 py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Occasions</span>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Gifts for Every Special Moment</h2>
            <p className="mt-4 text-muted-foreground">Pick the occasion and we'll suggest the perfect personalised gift.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {OCCASIONS.map((o, i) => (
            <Reveal key={o.id} delay={i * 40}>
              <Link to="/customize" search={{ occasion: o.id }} className="block h-full">
                <OccasionCard occasion={o} />
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/customize" className="btn-cta">Find the Perfect Gift <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const groups = [
    { title: "Frames", items: ["Wooden frames", "Mini frames", "Wall frames", "Collage frames"] },
    { title: "Apparel & Accessories", items: ["Coffee mugs", "Tote bags", "T-shirts", "Keychains"] },
    { title: "Prints & Books", items: ["Polaroid prints", "Photo strips", "Memory books", "Photo albums"] },
    { title: "Studio Services", items: ["Design assistance", "Photo editing & enhancement", "Bulk & event orders", "Personalized gift boxes"] },
  ];
  return (
    <section className="container-page py-20 md:py-28">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Custom Printing</span>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Custom Printing That Feels Personal</h2>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {groups.map((g, i) => (
          <Reveal key={g.title} delay={i * 80}>
            <div className="card-soft h-full p-6">
              <h3 className="text-base font-semibold">{g.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {g.items.map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" /> {it}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function EmotionalBrand() {
  return (
    <section className="container-page py-20 md:py-28">
      <Reveal>
        <div className="card-soft mx-auto max-w-4xl bg-gradient-to-br from-beige to-card p-10 text-center md:p-16">
          <span className="eyebrow">Our Promise</span>
          <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">Not Just a Gift. A Memory Made Real.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Some photos deserve more than a place in your gallery. Framely helps you turn your favorite moments into meaningful keepsakes you can gift, frame, display and treasure forever.
          </p>
          <Link to="/customize" className="btn-cta mt-7">Create a Memory Gift <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </Reveal>
    </section>
  );
}

function Audience() {
  return (
    <section className="bg-secondary/40 py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Made For</span>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Made for Students, Couples, Families & Gift Lovers</h2>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.label} delay={i * 60}>
              <div className="card-soft hover-lift h-full p-6">
                <h3 className="text-base font-semibold">{a.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="container-page py-20 md:py-28">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Loved by gift lovers</span>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Real reviews from real moments</h2>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <figure className="card-soft hover-lift h-full p-7">
              <div className="flex gap-0.5 text-accent" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">"{t.quote}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent/30 to-rose/40 text-sm font-semibold text-foreground"
                >
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container-page py-20 md:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-accent/15 via-beige to-card p-10 text-center md:p-16">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">Ready to turn your photos into something beautiful?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Create a personalized gift that feels thoughtful, emotional and unforgettable.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/customize" className="btn-cta">Start Customizing <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <a href="#occasions" className="btn-ghost">View Gift Ideas</a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-3 z-40 mx-3 md:hidden">
      <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-background/85 p-1.5 shadow-lift backdrop-blur">
        <Link to="/customize" className="btn-cta !py-3 text-sm" aria-label="Customize your gift">Customize</Link>
        <a
          href={whatsappOrderUrl("Hi Framely! I'd like to place an order.")}
          target="_blank"
          rel="noreferrer"
          aria-label="Order on WhatsApp"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-foreground py-3 text-sm font-semibold text-background"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
