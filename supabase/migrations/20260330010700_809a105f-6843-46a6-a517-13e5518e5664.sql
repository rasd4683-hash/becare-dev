
CREATE TABLE public.site_visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  visitor_name text DEFAULT 'زائر',
  current_page text DEFAULT '/',
  is_online boolean DEFAULT true,
  last_seen_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert/update their own session
CREATE POLICY "Anon can insert visitors" ON public.site_visitors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update own session" ON public.site_visitors FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Admins can view all visitors" ON public.site_visitors FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role can delete visitors" ON public.site_visitors FOR DELETE TO service_role USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visitors;
