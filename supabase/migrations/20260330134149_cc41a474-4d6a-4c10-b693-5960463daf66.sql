CREATE POLICY "Admins can delete conversations"
ON public.chat_conversations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));