CREATE POLICY "Public read inventory photos" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'inventory-photos');

CREATE POLICY "Public upload inventory photos" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'inventory-photos');

CREATE POLICY "Public update inventory photos" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'inventory-photos') WITH CHECK (bucket_id = 'inventory-photos');

CREATE POLICY "Public delete inventory photos" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'inventory-photos');