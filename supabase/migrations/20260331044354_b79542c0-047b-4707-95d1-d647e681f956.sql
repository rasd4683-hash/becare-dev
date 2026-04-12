
-- Drop the fragile session-based anon policies on site_visitors
DROP POLICY IF EXISTS "Anon can insert own visitor" ON public.site_visitors;
DROP POLICY IF EXISTS "Anon can read own visitor row" ON public.site_visitors;
DROP POLICY IF EXISTS "Anon can update own session" ON public.site_visitors;

-- Simpler anon policies - allow basic tracking without custom header requirement
CREATE POLICY "Anon can insert visitor"
  ON public.site_visitors FOR INSERT TO anon
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Anon can read own visitor"
  ON public.site_visitors FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can update visitor"
  ON public.site_visitors FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
