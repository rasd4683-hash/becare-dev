
-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text,
  visitor_email text,
  status text NOT NULL DEFAULT 'bot',
  assigned_admin uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('visitor', 'bot', 'admin')),
  sender_id uuid,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Anyone can create conversations" ON public.chat_conversations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view own conversation by id" ON public.chat_conversations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update conversations" ON public.chat_conversations FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Admins can view all conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Messages policies
CREATE POLICY "Anyone can insert messages" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view messages" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
