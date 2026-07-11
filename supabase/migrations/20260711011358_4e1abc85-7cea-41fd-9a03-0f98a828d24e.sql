
-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  tagline text,
  description text,
  image_url text,
  price text NOT NULL,
  badge text,
  category text NOT NULL,
  print_area jsonb,
  physical_size jsonb,
  colors jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);

-- Seed products (idempotent)
INSERT INTO public.products (id, name, tagline, description, price, badge, category, print_area, physical_size, colors) VALUES
('wood-frame','Custom Wood Frame','A timeless way to display the moment','Hand-finished wooden frame printed with your favorite memory.','₹499','Best Seller','frames','{"x":12,"y":12,"w":76,"h":76}','{"w":8,"h":10,"unit":"in"}',NULL),
('photo-mug','Personalized Mug','Your story, sip after sip','Premium ceramic mug printed with your photo and a personal message.','₹299','Trending','accessories','{"x":22,"y":30,"w":56,"h":36}','{"w":8.5,"h":3.5,"unit":"in"}','[{"id":"white","label":"White","hex":"#ffffff"},{"id":"black","label":"Black","hex":"#1f1f1f"}]'),
('polaroid','Polaroid Prints (Set of 12)','Tiny moments, big feelings','Aesthetic polaroid-style prints on premium matte paper.','₹349','Instagram Pick','prints','{"x":14,"y":14,"w":72,"h":72}','{"w":3.5,"h":4.2,"unit":"in"}',NULL),
('tote','Printed Tote Bag','Carry your memories everywhere','Natural cotton tote, printed with your custom design.','₹449',NULL,'apparel','{"x":28,"y":25,"w":44,"h":50}','{"w":12,"h":14,"unit":"in"}','[{"id":"natural","label":"Natural","hex":"#e8dcc2"},{"id":"black","label":"Black","hex":"#202020"}]'),
('tshirt','Custom T-Shirt','Wear the moment','Soft cotton tee with photo or quote printing.','₹599',NULL,'apparel','{"x":32,"y":26,"w":36,"h":44}','{"w":11,"h":14,"unit":"in"}','[{"id":"white","label":"White","hex":"#ffffff"},{"id":"black","label":"Black","hex":"#161616"},{"id":"sand","label":"Sand","hex":"#d8c8a8"}]'),
('memory-book','Memory Book','A keepsake you can flip through forever','Hardcover memory book personalized with your photos and notes.','₹899','Perfect Gift','books','{"x":18,"y":18,"w":64,"h":64}','{"w":8,"h":8,"unit":"in"}',NULL),
('photo-strip','Photo Strip','The classic four-shot keepsake','Vertical photo strips, premium printed and ready to gift.','₹199',NULL,'prints','{"x":28,"y":8,"w":44,"h":84}','{"w":2,"h":8,"unit":"in"}',NULL),
('gift-box','Personalized Gift Box','A surprise wrapped with care','Curated gift box with your chosen keepsakes and a handwritten note.','₹1199','For Couples','gifting','{"x":20,"y":22,"w":60,"h":56}','{"w":9,"h":7,"unit":"in"}',NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, tagline = EXCLUDED.tagline, description = EXCLUDED.description,
  price = EXCLUDED.price, badge = EXCLUDED.badge, category = EXCLUDED.category,
  print_area = EXCLUDED.print_area, physical_size = EXCLUDED.physical_size, colors = EXCLUDED.colors;

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id text REFERENCES public.products(id) ON DELETE SET NULL,
  customization_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view their own orders" ON public.orders;
CREATE POLICY "Users view their own orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
