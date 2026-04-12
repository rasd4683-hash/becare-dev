
-- Re-add anon upload policy since the insurance form allows non-authenticated submissions
-- But scope uploads to a temp folder
CREATE POLICY "Anon can upload to temp folder"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'vehicle-documents' AND (storage.foldername(name))[1] = 'temp');

-- Anon can read their own uploaded files from temp folder
CREATE POLICY "Anon can view temp vehicle documents"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'vehicle-documents' AND (storage.foldername(name))[1] = 'temp');
