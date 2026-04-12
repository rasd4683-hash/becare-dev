
-- 1. Remove anon SELECT on insurance_orders (use RPC instead)
DROP POLICY IF EXISTS "Anon can read own order by session" ON public.insurance_orders;

-- Create RPC for reading own order safely (returns only non-sensitive fields)
CREATE OR REPLACE FUNCTION public.get_own_order(
  p_visitor_session_id text,
  p_order_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'status', status,
    'current_stage', current_stage,
    'stage_status', stage_status,
    'company', company,
    'insurance_type', insurance_type,
    'base_price', base_price,
    'total_price', total_price,
    'add_ons', add_ons,
    'customer_name', customer_name,
    'vehicle_make', vehicle_make,
    'vehicle_model', vehicle_model,
    'vehicle_year', vehicle_year,
    'policy_number', policy_number,
    'draft_policy_number', draft_policy_number,
    'payment_method', payment_method,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result
  FROM public.insurance_orders
  WHERE id = p_order_id AND visitor_session_id = p_visitor_session_id;
  
  RETURN v_result;
END;
$$;

-- 2. Fix chat_conversations anon policies - use RPC
DROP POLICY IF EXISTS "Anon can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anon can read own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anon can update own conversation by token" ON public.chat_conversations;

-- Create RPC for chat operations
CREATE OR REPLACE FUNCTION public.create_chat_conversation(
  p_session_token text,
  p_visitor_name text DEFAULT NULL,
  p_visitor_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.chat_conversations (session_token, visitor_name, visitor_email, status)
  VALUES (p_session_token, p_visitor_name, p_visitor_email, 'bot')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_chat_conversation(
  p_session_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id, 'status', status, 'visitor_name', visitor_name,
    'created_at', created_at, 'updated_at', updated_at
  ) INTO v_result
  FROM public.chat_conversations
  WHERE session_token = p_session_token
  ORDER BY created_at DESC LIMIT 1;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_conversation(
  p_session_token text,
  p_conversation_id uuid,
  p_status text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_conversations SET
    status = COALESCE(p_status, status),
    updated_at = now()
  WHERE id = p_conversation_id AND session_token = p_session_token;
END;
$$;

-- 3. Fix chat_messages anon policies
DROP POLICY IF EXISTS "Anon can insert visitor messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anon can read own chat messages" ON public.chat_messages;

CREATE OR REPLACE FUNCTION public.send_chat_message(
  p_session_token text,
  p_conversation_id uuid,
  p_content text,
  p_sender_type text DEFAULT 'visitor'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_conv_session text;
BEGIN
  SELECT session_token INTO v_conv_session
  FROM public.chat_conversations WHERE id = p_conversation_id;
  
  IF v_conv_session IS NULL OR v_conv_session != p_session_token THEN
    RAISE EXCEPTION 'Unauthorized: conversation mismatch';
  END IF;
  
  IF p_sender_type NOT IN ('visitor', 'bot') THEN
    RAISE EXCEPTION 'Unauthorized: invalid sender type';
  END IF;
  
  INSERT INTO public.chat_messages (conversation_id, content, sender_type)
  VALUES (p_conversation_id, p_content, p_sender_type)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_chat_messages(
  p_session_token text,
  p_conversation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_conv_session text;
BEGIN
  SELECT session_token INTO v_conv_session
  FROM public.chat_conversations WHERE id = p_conversation_id;
  
  IF v_conv_session IS NULL OR v_conv_session != p_session_token THEN
    RETURN '[]'::jsonb;
  END IF;
  
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'content', content, 'sender_type', sender_type, 'created_at', created_at
  ) ORDER BY created_at ASC), '[]'::jsonb) INTO v_result
  FROM public.chat_messages
  WHERE conversation_id = p_conversation_id;
  
  RETURN v_result;
END;
$$;

-- 4. Fix insurance_order_stage_events anon policies  
DROP POLICY IF EXISTS "Anon can read own stage events" ON public.insurance_order_stage_events;

-- Anon doesn't need to read stage events directly - admin reads them
-- The frontend uses realtime subscription on insurance_orders, not stage_events

-- 5. Fix storage policies for vehicle-documents
-- Remove the temp/ prefix policy that uses get_visitor_session
DROP POLICY IF EXISTS "Anon can upload to temp folder" ON storage.objects;
DROP POLICY IF EXISTS "Anon can read own temp files" ON storage.objects;
