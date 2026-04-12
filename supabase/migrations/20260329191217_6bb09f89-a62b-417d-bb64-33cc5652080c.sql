INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-documents', 'vehicle-documents', true);

CREATE POLICY "Anyone can upload vehicle documents" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'vehicle-documents');

CREATE POLICY "Anyone can read vehicle documents" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'vehicle-documents');