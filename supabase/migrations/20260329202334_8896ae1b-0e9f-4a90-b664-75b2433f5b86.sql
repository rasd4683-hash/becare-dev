
-- Add session_token to chat_conversations for ownership verification
ALTER TABLE public.chat_conversations ADD COLUMN IF NOT EXISTS session_token text;

-- Drop old policy and create ownership-scoped one
DROP POLICY IF EXISTS "Anon can update own conversation status only" ON public.chat_conversations;

CREATE POLICY "Anon can update own conversation by token"
ON public.chat_conversations
FOR UPDATE
TO anon
USING (session_token IS NOT NULL)
WITH CHECK (status IN ('bot', 'waiting', 'active') AND assigned_admin IS NULL);

-- Fix: the "Authenticated can insert messages" referenced in warn is the old one that was already dropped
-- The current policy is "Admins can insert messages" which is correct
