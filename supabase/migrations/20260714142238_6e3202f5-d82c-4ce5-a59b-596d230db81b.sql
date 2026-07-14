DROP POLICY IF EXISTS "View own or anonymous recommendations" ON public.recommendations_log;
CREATE POLICY "View own recommendations" ON public.recommendations_log
FOR SELECT TO authenticated
USING (auth.uid() = user_id);