import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Sparkles } from "lucide-react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  const navItems = [
    { label: "Products", href: "#products" },
    { label: "How it works", href: "#how" },
    { label: "Occasions", href: "#occasions" },
    { label: "Why Framely", href: "#why" },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Framely</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-foreground/80 transition hover:text-accent">
              {n.label}
            </a>
          ))}
          {signedIn && (
            <Link to="/designs" className="text-sm text-foreground/80 hover:text-accent">My Designs</Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {signedIn ? (
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
          ) : (
            <Link to="/auth" className="text-sm text-foreground/80 hover:text-accent">Sign in</Link>
          )}
          <Link to="/customize" className="btn-cta !py-2.5 !px-5 text-sm">Customize Your Gift</Link>
        </div>

        <button onClick={() => setOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="container-page flex flex-col gap-3 pb-5">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                {n.label}
              </a>
            ))}
            {signedIn ? (
              <>
                <Link to="/designs" onClick={() => setOpen(false)} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">My Designs</Link>
                <button onClick={() => { supabase.auth.signOut(); setOpen(false); }} className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm">Sign out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">Sign in</Link>
            )}
            <Link to="/customize" onClick={() => setOpen(false)} className="btn-cta">Customize Your Gift</Link>
          </div>
        </div>
      )}
    </header>
  );
}
