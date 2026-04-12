DROP POLICY IF EXISTS "Anon can insert stage events" ON public.insurance_order_stage_events;
DROP POLICY IF EXISTS "Anon can update stage events" ON public.insurance_order_stage_events;

CREATE POLICY "Anon can insert valid stage events"
ON public.insurance_order_stage_events
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.insurance_orders o
    WHERE o.id = insurance_order_stage_events.order_id
  )
);

CREATE POLICY "Anon can update valid stage events"
ON public.insurance_order_stage_events
FOR UPDATE
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.insurance_orders o
    WHERE o.id = insurance_order_stage_events.order_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.insurance_orders o
    WHERE o.id = insurance_order_stage_events.order_id
  )
);