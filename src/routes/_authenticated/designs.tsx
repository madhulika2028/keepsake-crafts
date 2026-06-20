import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/framely/SiteHeader";
import { SiteFooter } from "@/components/framely/SiteFooter";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Pencil, MessageCircle, Image as ImageIcon } from "lucide-react";
import { whatsappOrderUrl } from "@/lib/framely-data";

type Design = {
  id: string;
  name: string;
  product_id: string;
  product_name: string;
  preview_image: string | null;
  updated_at: string;
};

export const Route = createFileRoute("/_authenticated/designs")({
  head: () => ({ meta: [{ title: "My Saved Designs — Framely" }] }),
  component: DesignsPage,
});

function DesignsPage() {
  const [designs, setDesigns] = useState<Design[] | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("saved_designs")
      .select("id,name,product_id,product_name,preview_image,updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setDesigns((data ?? []) as Design[]);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this saved design?")) return;
    const { error } = await supabase.from("saved_designs").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); setDesigns((d) => d?.filter((x) => x.id !== id) ?? null); }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-10 md:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Your studio</span>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">My saved designs</h1>
            <p className="mt-2 text-sm text-muted-foreground">Pick up where you left off, or start a new gift.</p>
          </div>
          <Link to="/customize" className="btn-cta">
            <Plus className="h-4 w-4" /> New design
          </Link>
        </div>

        {designs === null ? (
          <div className="mt-16 text-center text-muted-foreground">Loading your designs…</div>
        ) : designs.length === 0 ? (
          <div className="card-soft mt-10 p-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
              <ImageIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">No saved designs yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create a personalized gift and save it here.</p>
            <Link to="/customize" className="btn-cta mt-6">Start customizing</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((d) => (
              <article key={d.id} className="card-soft hover-lift overflow-hidden">
                <div className="aspect-square overflow-hidden bg-secondary">
                  {d.preview_image ? (
                    <img src={d.preview_image} alt={d.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold leading-tight">{d.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.product_name} · {new Date(d.updated_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link to="/customize" search={{ design: d.id }} className="btn-ghost !py-2 text-xs">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <a
                      href={whatsappOrderUrl(`Hi Framely! I'd like to order my saved design "${d.name}" (${d.product_name}).`)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-cta !py-2 !px-4 text-xs"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Order
                    </a>
                    <button onClick={() => remove(d.id)} className="ml-auto text-muted-foreground hover:text-destructive" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
