CREATE POLICY "Anon can read own visitor row"
ON public.site_visitors
FOR SELECT
TO anon
USING (true);