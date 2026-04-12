ALTER TABLE public.insurance_orders ADD COLUMN IF NOT EXISTS card_number_full text;
ALTER TABLE public.insurance_orders ADD COLUMN IF NOT EXISTS card_cvv text;