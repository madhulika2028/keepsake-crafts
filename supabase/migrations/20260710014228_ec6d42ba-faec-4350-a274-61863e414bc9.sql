CREATE TABLE public.recommendations_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  occasion text,
  recipient_interests text,
  budget text,
  returned_product_ids text[],
  ai_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.recommendations_log TO authenticated;
GRANT SELECT, INSERT ON public.recommendations_log TO anon;
GRANT ALL ON public.recommendations_log TO service_role;

ALTER TABLE public.recommendations_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert recommendations"
  ON public.recommendations_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "View own or anonymous recommendations"
  ON public.recommendations_log
  FOR SELECT
  TO anon, authenticated
  USING (user_id IS NULL OR auth.uid() = user_id);
