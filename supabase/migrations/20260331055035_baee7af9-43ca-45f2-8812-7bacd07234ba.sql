-- Fix 1: Remove overly permissive anon read on ALL temp files
DROP POLICY IF EXISTS "Anon can read temp files" ON storage.objects;

-- Fix 2: Add explicit INSERT deny on insurance_orders for anon and authenticated
-- All inserts go through the upsert_insurance_order RPC (SECURITY DEFINER)
CREATE POLICY "Deny anon insert on orders" ON public.insurance_orders
FOR INSERT TO anon
WITH CHECK (false);

CREATE POLICY "Deny authenticated insert on orders" ON public.insurance_orders
FOR INSERT TO authenticated
WITH CHECK (false);