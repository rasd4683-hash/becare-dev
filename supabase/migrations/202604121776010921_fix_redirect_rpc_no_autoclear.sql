-- Fix: remove auto-clear of redirect_to from upsert_visitor_tracking
-- The client will now clear redirect_to explicitly via a separate RPC
-- This ensures Realtime delivers the value before it gets cleared

CREATE OR REPLACE FUNCTION public.upsert_visitor_tracking(
  p_session_id text,
  p_current_page text DEFAULT NULL::text,
  p_is_online boolean DEFAULT true
)
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

  -- DO NOT clear redirect_to here anymore
  -- Realtime subscription on the client will catch it
  -- Client clears it explicitly via clear_visitor_redirect RPC

  RETURN jsonb_build_object(
    'is_blocked', COALESCE(v_blocked, false),
    'redirect_to', v_redirect
  );
END;
$function$;

-- New RPC: client calls this after receiving and acting on redirect
CREATE OR REPLACE FUNCTION public.clear_visitor_redirect(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.site_visitors
  SET redirect_to = NULL
  WHERE session_id = p_session_id AND redirect_to IS NOT NULL;
END;
$function$;
