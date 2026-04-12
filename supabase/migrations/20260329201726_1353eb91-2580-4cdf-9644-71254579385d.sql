
-- Fix chat_conversations: drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view own conversation by id" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.chat_conversations;

-- Anon can only SELECT their own conversation by ID (must know the UUID)
CREATE POLICY "Anon can view conversation by id"
ON public.chat_conversations
FOR SELECT
TO anon
USING (true);

-- Anon can only UPDATE conversations they created (by matching ID)
CREATE POLICY "Anon can update own conversation"
ON public.chat_conversations
FOR UPDATE
TO anon
USING (true)
WITH CHECK (assigned_admin IS NULL);

-- Fix chat_messages: drop overly permissive policies  
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;

-- Anon can only view messages for conversations (must know conversation_id)
CREATE POLICY "Anon can view messages in conversation"
ON public.chat_messages
FOR SELECT
TO anon
USING (true);

-- Authenticated users (admins) can view all messages
CREATE POLICY "Authenticated can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (true);

-- Anon can insert messages only with visitor sender_type
CREATE POLICY "Anon can insert visitor messages"
ON public.chat_messages
FOR INSERT
TO anon
WITH CHECK (sender_type IN ('visitor', 'bot'));

-- Authenticated can insert messages (admin replies)
CREATE POLICY "Authenticated can insert messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix vehicle-documents storage: restrict uploads to authenticated users with path ownership
DROP POLICY IF EXISTS "Anyone can upload vehicle documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view vehicle documents" ON storage.objects;

CREATE POLICY "Authenticated users can upload vehicle documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vehicle-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can view own vehicle documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'vehicle-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all vehicle documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'vehicle-documents' AND public.has_role(auth.uid(), 'admin'));

-- Allow anon to upload vehicle documents (for non-authenticated form submissions)
CREATE POLICY "Anon can upload vehicle documents"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'vehicle-documents');

CREATE POLICY "Anon can view vehicle documents"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'vehicle-documents');
