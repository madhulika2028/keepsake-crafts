
-- Tighten recommendations_log INSERT policy (was WITH CHECK (true))
DROP POLICY IF EXISTS "Anyone can insert recommendations" ON public.recommendations_log;
CREATE POLICY "Insert own or anonymous recommendations"
ON public.recommendations_log
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Add scoped UPDATE/DELETE policies to orders
CREATE POLICY "Users update their own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own orders"
ON public.orders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
