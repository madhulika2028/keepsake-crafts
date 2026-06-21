import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/framely-data";
import { Reveal } from "./Reveal";

export function FAQ() {
  return (
    <section id="faq" className="container-page py-20 md:py-28">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Help & FAQ</span>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Everything you wanted to ask</h2>
          <p className="mt-4 text-muted-foreground">Short, honest answers about ordering, quality and delivery.</p>
        </div>
      </Reveal>
      <Reveal>
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-border bg-card p-2 shadow-soft md:p-4">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="px-4 text-left text-base font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </section>
  );
}
