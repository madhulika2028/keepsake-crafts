## Goal

Lift Framely from a pretty landing page to a real personalized-gifting flow: fix the hero crop, add a live drag/resize/rotate mockup over real product images, modernize occasion cards, add a progress stepper, FAQ, trust badges, and tighten mobile/accessibility.

## What I'll change

### 1. Hero image (home)
- Replace `h-auto` + `aspect-auto` image with a fixed responsive frame (`aspect-[4/5] md:aspect-[5/6]`) using `object-cover` + responsive `object-position` (`object-[center_top] md:object-center`).
- Add `fetchpriority="high"` + preload link in route `head()`; lazy-load every other image.
- Tighten top padding so hero CTA + image sit above the fold on common mobile heights.

### 2. Occasion cards (home + new step)
- Redesign `OCCASIONS` grid: real illustration/emoji on a soft gradient tile, title, subtitle, hover lift, selected ring + checkmark.
- Reuse the same `<OccasionCard selected={…} />` component on the new `/customize` step 1.
- Update list to: Birthday, Anniversary, Corporate Events, Team Outings, Festivals, Family Events, Friends Reunion, Custom Occasion.

### 3. Real-time product mockup (highest priority)
- New component `LiveMockup` using **react-konva** (Konva.js wrapper, works in CSR).
  - Layers: product base image → print-safe overlay (dashed rect) → user image (Konva.Image, draggable, transformer for resize+rotate) → optional text node.
  - Print-safe bounding box per product (defined in `framely-data.ts` as `printArea: {x,y,w,h}` in % of canvas).
  - Warn (toast + red overlay) when user image bounds exit the safe area.
  - Controls: zoom +/−, reset, undo/redo (history stack), front/back toggle (uses second image when available), product color swap (CSS hue tint via Konva filter or pre-rendered color variants).
  - Estimated print size readout based on bbox % × product physical dims.
  - Runs only on client — dynamic import inside `useEffect` so SSR doesn't break.
- Replaces the current static `LivePreview` in `/customize`.

### 4. Progress stepper
- New `<Stepper steps={[Occasion, Product, Customize, Preview, Checkout]} current={…}/>` shown at the top of `/customize`.
- Customize page becomes a single scroll with anchored steps; current step tracked by state, clicking a past step scrolls back. State persists in `sessionStorage` so back-nav doesn't lose work.

### 5. Home additions
- **Trust badges row** (Secure payment, Fast delivery, Quality guarantee, Easy returns) above footer.
- **FAQ** accordion (shadcn Accordion) with 6 questions.
- Keep existing Testimonials, polish spacing.

### 6. Mobile, a11y, perf
- Add `aria-label` to every icon-only button (sticky CTA, mockup controls).
- Tap targets ≥ 44px on mockup controls.
- All `<img>` get descriptive alt + `loading="lazy"` (hero stays eager).
- `h-dvh` instead of `h-screen` where used.
- Wrap mockup canvas in `aspect-square` so no CLS while Konva mounts.

### 7. Data
- Add `printArea` and `physicalSize` to each product in `framely-data.ts`.
- No DB schema change — saved designs already store JSON `customization`; we extend the shape with `{ transform: {x,y,scale,rotation}, side: "front"|"back", color: string }`.

## Files

- edit `src/routes/index.tsx` — hero fix, occasion redesign, trust badges, FAQ
- edit `src/routes/customize.tsx` — stepper, swap LivePreview for LiveMockup
- new `src/components/framely/LiveMockup.tsx` — Konva canvas + controls
- new `src/components/framely/Stepper.tsx`
- new `src/components/framely/OccasionCard.tsx`
- new `src/components/framely/FAQ.tsx`
- new `src/components/framely/TrustBadges.tsx`
- edit `src/lib/framely-data.ts` — occasion list, printArea/physicalSize
- edit `src/styles.css` — tokens for selected ring, dashed overlay, focus styles

## Technical notes

- `bun add konva react-konva` — both pure JS, safe for client-only rendering; gated behind `typeof window !== 'undefined'` and dynamic `import()` so SSR/prerender don't touch them.
- History stack capped at 30 entries to keep memory bounded.
- Print-safe check: compare transformer bounding box vs safe rect on every `transformend`/`dragend`.

## Out of scope (will not touch this turn)

- Real checkout (still WhatsApp order).
- Adding a separate Hoodie product (only t-shirt/tote/mug already exist; mockup works on all).
- Lighthouse audit numbers — I'll apply the perf rules above but won't run Lighthouse.