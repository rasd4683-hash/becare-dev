
CREATE TABLE public.insurance_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Link to original request (optional)
  insurance_request_id uuid REFERENCES public.insurance_requests(id) ON DELETE SET NULL,
  
  -- Customer info
  customer_name text,
  national_id text,
  phone text,
  
  -- Vehicle info
  vehicle_make text,
  vehicle_model text,
  vehicle_year text,
  serial_number text,
  passenger_count text,
  vehicle_usage text,
  estimated_value text,
  repair_location text,
  
  -- Offer / company info
  company text,
  insurance_type text,
  base_price numeric,
  total_price numeric,
  add_ons jsonb DEFAULT '[]'::jsonb,
  
  -- Payment info
  payment_method text, -- 'card' or 'atm'
  card_holder_name text,
  card_last_four text,
  card_expiry text,
  
  -- ATM info
  atm_bill_number text,
  atm_biller_code text,
  
  -- OTP info
  otp_verified boolean DEFAULT false,
  
  -- Policy
  policy_number text,
  draft_policy_number text,
  
  -- Status
  status text NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.insurance_orders ENABLE ROW LEVEL SECURITY;

-- Anon can insert (public form flow)
CREATE POLICY "Public can submit orders"
  ON public.insurance_orders FOR INSERT TO anon
  WITH CHECK (true);

-- Admins full access
CREATE POLICY "Admins can view all orders"
  ON public.insurance_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders"
  ON public.insurance_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
