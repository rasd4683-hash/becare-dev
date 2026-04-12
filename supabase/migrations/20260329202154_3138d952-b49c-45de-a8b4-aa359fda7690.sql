
-- 1. Remove old broad storage read policy
DROP POLICY IF EXISTS "Anyone can read vehicle documents" ON storage.objects;

-- 2. Fix chat_messages: restrict authenticated SELECT to admins only (regular users don't need to read all messages)
DROP POLICY IF EXISTS "Authenticated can view all messages" ON public.chat_messages;

CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix privilege escalation: add restrictive INSERT policy on user_roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
