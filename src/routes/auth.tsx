import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/framely/SiteHeader";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Sign in — Framely" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: (redirect as "/customize" | "/designs" | undefined) ?? "/designs" });
    });
  }, [navigate, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: (redirect as "/customize" | "/designs" | undefined) ?? "/designs" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-16 md:py-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="mx-auto mt-8 max-w-md">
          <div className="card-soft p-8">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold">Framely</span>
            </div>
            <h1 className="mt-5 text-2xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Save your designs and revisit them across devices.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</span>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm" />
              </label>
              <button type="submit" disabled={loading} className="btn-cta w-full disabled:opacity-60">
                {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? "New to Framely? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
