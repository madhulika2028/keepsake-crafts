
DROP POLICY IF EXISTS "Users read own customization photos" ON storage.objects;
CREATE POLICY "Users read own customization photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'customization-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users upload own customization photos" ON storage.objects;
CREATE POLICY "Users upload own customization photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'customization-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own customization photos" ON storage.objects;
CREATE POLICY "Users update own customization photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'customization-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own customization photos" ON storage.objects;
CREATE POLICY "Users delete own customization photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'customization-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
