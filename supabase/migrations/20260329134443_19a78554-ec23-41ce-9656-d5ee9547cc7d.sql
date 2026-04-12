
-- Drop overly permissive anon policies
DROP POLICY "Anyone can insert requests" ON public.insurance_requests;
DROP POLICY "Anyone can insert claims" ON public.claims;

-- Replace with more restrictive policies that still allow public submissions
-- but require certain fields to be non-null (enforced by table constraints)
CREATE POLICY "Public can submit insurance requests" ON public.insurance_requests
  FOR INSERT TO anon WITH CHECK (
    national_id IS NOT NULL AND phone IS NOT NULL
  );

CREATE POLICY "Public can submit claims" ON public.claims
  FOR INSERT TO anon WITH CHECK (
    full_name IS NOT NULL AND phone IS NOT NULL AND policy_number IS NOT NULL
  );
