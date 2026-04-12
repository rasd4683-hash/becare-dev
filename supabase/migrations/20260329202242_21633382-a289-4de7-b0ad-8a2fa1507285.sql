
-- Remove chat tables from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages;
