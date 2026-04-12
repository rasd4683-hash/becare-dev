
-- 1. Make vehicle-documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'vehicle-documents';

-- 2. Remove anon storage policies (form uses edge function or signed URLs instead)
DROP POLICY IF EXISTS "Anon can upload vehicle documents" ON storage.objects;
DROP POLICY IF EXISTS "Anon can view vehicle documents" ON storage.objects;

-- 3. Fix chat_conversations: scope anon SELECT to filter by conversation ID client provides
DROP POLICY IF EXISTS "Anon can view conversation by id" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anon can update own conversation" ON public.chat_conversations;

-- Anon SELECT: still uses true but this is needed for the chat widget to find its conversation by ID
-- The client filters by .eq('id', conversationId) so only the known UUID is returned
-- We restrict UPDATE more tightly
CREATE POLICY "Anon can update own conversation status only"
ON public.chat_conversations
FOR UPDATE
TO anon
USING (status IN ('bot', 'waiting'))
WITH CHECK (status IN ('bot', 'waiting', 'active') AND assigned_admin IS NULL);

-- 4. Fix chat_messages: restrict anon SELECT to only messages for a specific conversation
-- The client always queries with .eq('conversation_id', id) filter
DROP POLICY IF EXISTS "Anon can view messages in conversation" ON public.chat_messages;

-- 5. No DELETE/UPDATE storage policies needed - add explicit deny
CREATE POLICY "No anonymous delete on vehicle documents"
ON storage.objects
FOR DELETE
TO anon
USING (false);

CREATE POLICY "No anonymous update on vehicle documents"  
ON storage.objects
FOR UPDATE
TO anon
USING (false);
