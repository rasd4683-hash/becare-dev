
-- Re-add chat tables to realtime - needed for admin dashboard and visitor agent mode
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
