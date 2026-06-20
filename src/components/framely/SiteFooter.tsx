import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, MapPin, Sparkles } from "lucide-react";
import { whatsappOrderUrl, BRAND_INSTAGRAM, BRAND_LOCATION } from "@/lib/framely-data";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-background/60">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold">Framely</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Memories you can hold. Framely is a personalized gifting studio turning your favorite photos into beautiful keepsakes — designed with love in {BRAND_LOCATION}.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-accent" /> {BRAND_LOCATION}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Products</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#products" className="hover:text-foreground">Custom Frames</a></li>
            <li><a href="#products" className="hover:text-foreground">Photo Prints</a></li>
            <li><a href="#products" className="hover:text-foreground">Personalized Gifts</a></li>
            <li><a href="#products" className="hover:text-foreground">Custom Apparel</a></li>
            <li><a href="#products" className="hover:text-foreground">Memory Books</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Get in touch</h4>
          <div className="mt-4 flex flex-col gap-3">
            <a href={whatsappOrderUrl("Hi Framely! I'd like to place an order.")} target="_blank" rel="noreferrer" className="btn-cta !py-2.5 text-sm">
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
            <a href={BRAND_INSTAGRAM} target="_blank" rel="noreferrer" className="btn-ghost !py-2.5 text-sm">
              <Instagram className="h-4 w-4" /> Follow on Instagram
            </a>
            <Link to="/customize" className="btn-ghost !py-2.5 text-sm">Start customizing</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Framely. Memories you can hold.</p>
          <p>Designed & printed with love in Tirupati.</p>
        </div>
      </div>
    </footer>
  );
}
