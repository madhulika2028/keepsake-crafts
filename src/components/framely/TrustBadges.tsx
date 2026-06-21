import { TRUST_BADGES } from "@/lib/framely-data";
import { Reveal } from "./Reveal";

export function TrustBadges() {
  return (
    <section aria-label="Why shop with Framely" className="container-page py-12 md:py-16">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {TRUST_BADGES.map((b, i) => (
          <Reveal key={b.title} delay={i * 60}>
            <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift md:p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/10 text-2xl" aria-hidden="true">
                {b.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{b.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.copy}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
