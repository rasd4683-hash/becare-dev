
-- Allow admins to update any conversation
CREATE POLICY "Admins can update conversations"
ON public.chat_conversations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
