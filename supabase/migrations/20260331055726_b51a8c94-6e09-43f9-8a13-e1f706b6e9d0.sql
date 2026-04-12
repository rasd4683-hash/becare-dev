-- Update link_visitor_data to support linked_request_id
CREATE OR REPLACE FUNCTION public.link_visitor_data(
  p_session_id text,
  p_phone text DEFAULT NULL,
  p_national_id text DEFAULT NULL,
  p_visitor_name text DEFAULT NULL,
  p_linked_request_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.site_visitors SET
    phone = COALESCE(p_phone, phone),
    national_id = COALESCE(p_national_id, national_id),
    visitor_name = COALESCE(p_visitor_name, visitor_name),
    linked_request_id = COALESCE(p_linked_request_id, linked_request_id),
    last_seen_at = now()
  WHERE session_id = p_session_id;
END;
$$;