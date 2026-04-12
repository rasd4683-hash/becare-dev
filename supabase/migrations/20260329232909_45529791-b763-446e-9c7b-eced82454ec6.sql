ALTER TABLE public.insurance_orders 
ADD COLUMN current_stage text DEFAULT null,
ADD COLUMN stage_status text DEFAULT null;