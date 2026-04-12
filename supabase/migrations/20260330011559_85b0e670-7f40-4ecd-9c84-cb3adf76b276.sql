
-- Add is_blocked column
ALTER TABLE public.site_visitors ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Fix: allow authenticated users to insert/update site_visitors (for admin browsing the site)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can insert visitors' AND tablename = 'site_visitors') THEN
    CREATE POLICY "Authenticated can insert visitors" ON public.site_visitors FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can update visitors' AND tablename = 'site_visitors') THEN
    CREATE POLICY "Authenticated can update visitors" ON public.site_visitors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
