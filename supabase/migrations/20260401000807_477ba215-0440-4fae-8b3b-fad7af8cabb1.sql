
-- Add redirect_to column to site_visitors
ALTER TABLE public.site_visitors ADD COLUMN IF NOT EXISTS redirect_to text DEFAULT NULL;

-- Update upsert_visitor_tracking to return redirect_to and clear it after reading
CREATE OR REPLACE FUNCTION public.upsert_visitor_tracking(p_session_id text, p_current_page text DEFAULT NULL::text, p_is_online boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_blocked boolean;
  v_redirect text;
BEGIN
  INSERT INTO public.site_visitors (session_id, current_page, is_online, last_seen_at)
  VALUES (p_session_id, COALESCE(p_current_page, '/'), p_is_online, now())
  ON CONFLICT (session_id) DO UPDATE SET
    current_page = COALESCE(p_current_page, site_visitors.current_page),
    is_online = p_is_online,
    last_seen_at = now();

  SELECT is_blocked, redirect_to INTO v_blocked, v_redirect
  FROM public.site_visitors WHERE session_id = p_session_id;

  -- Clear redirect_to after reading so it only fires once
  IF v_redirect IS NOT NULL THEN
    UPDATE public.site_visitors SET redirect_to = NULL WHERE session_id = p_session_id;
  END IF;

  RETURN jsonb_build_object('is_blocked', COALESCE(v_blocked, false), 'redirect_to', v_redirect);
END;
$function$;
