-- Track full visitor/order stage timeline with timestamps and approval status
CREATE TABLE IF NOT EXISTS public.insurance_order_stage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  visitor_session_id TEXT,
  stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stage_entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_order_stage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all stage events"
ON public.insurance_order_stage_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon can insert stage events"
ON public.insurance_order_stage_events
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update stage events"
ON public.insurance_order_stage_events
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can update stage events"
ON public.insurance_order_stage_events
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can delete stage events"
ON public.insurance_order_stage_events
FOR DELETE
TO service_role
USING (true);

CREATE INDEX IF NOT EXISTS idx_order_stage_events_order_id ON public.insurance_order_stage_events(order_id, stage_entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_stage_events_visitor_session ON public.insurance_order_stage_events(visitor_session_id, stage_entered_at DESC);

CREATE OR REPLACE FUNCTION public.set_stage_events_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stage_events_updated_at ON public.insurance_order_stage_events;
CREATE TRIGGER trg_stage_events_updated_at
BEFORE UPDATE ON public.insurance_order_stage_events
FOR EACH ROW
EXECUTE FUNCTION public.set_stage_events_updated_at();