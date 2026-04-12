
-- ============================================================
-- SECURITY FIX: Replace all overly permissive RLS policies
-- ============================================================

-- 1. Create helper function to extract visitor session from request headers
CREATE OR REPLACE FUNCTION public.get_visitor_session()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json->>'x-visitor-session',
    ''
  )
$$;

-- ============================================================
-- FIX: insurance_orders - anon SELECT (CRITICAL)
-- Was: USING (true) - exposed card numbers, CVV, PINs to everyone
-- Now: Only own orders by visitor_session_id
-- ============================================================
DROP POLICY IF EXISTS "Anon can read own order by id" ON public.insurance_orders;
CREATE POLICY "Anon can read own order by session"
  ON public.insurance_orders
  FOR SELECT TO anon
  USING (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = get_visitor_session()
  );

-- ============================================================
-- FIX: insurance_orders - anon UPDATE (CRITICAL)
-- Was: USING (true) WITH CHECK (true) - anyone could update any order
-- Now: Only own orders by visitor_session_id
-- ============================================================
DROP POLICY IF EXISTS "Anon can update stage" ON public.insurance_orders;
CREATE POLICY "Anon can update own order by session"
  ON public.insurance_orders
  FOR UPDATE TO anon
  USING (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = get_visitor_session()
  )
  WITH CHECK (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = get_visitor_session()
  );

-- ============================================================
-- FIX: insurance_orders - anon INSERT
-- Was: WITH CHECK (true)
-- Now: Must include visitor_session_id
-- ============================================================
DROP POLICY IF EXISTS "Public can submit orders" ON public.insurance_orders;
CREATE POLICY "Anon can insert own order"
  ON public.insurance_orders
  FOR INSERT TO anon
  WITH CHECK (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = get_visitor_session()
  );

-- ============================================================
-- FIX: site_visitors - anon SELECT (CRITICAL)
-- Was: USING (true) - exposed all visitor IPs, national IDs
-- Now: Only own row by session_id
-- ============================================================
DROP POLICY IF EXISTS "Anon can read own visitor row" ON public.site_visitors;
CREATE POLICY "Anon can read own visitor row"
  ON public.site_visitors
  FOR SELECT TO anon
  USING (session_id = get_visitor_session());

-- ============================================================
-- FIX: site_visitors - anon UPDATE (CRITICAL)
-- Was: USING (true) WITH CHECK (true)
-- Now: Only own row by session_id
-- ============================================================
DROP POLICY IF EXISTS "Anon can update own session" ON public.site_visitors;
CREATE POLICY "Anon can update own session"
  ON public.site_visitors
  FOR UPDATE TO anon
  USING (session_id = get_visitor_session())
  WITH CHECK (session_id = get_visitor_session());

-- ============================================================
-- FIX: site_visitors - anon INSERT
-- Was: WITH CHECK (true)
-- Now: session_id must match header
-- ============================================================
DROP POLICY IF EXISTS "Anon can insert visitors" ON public.site_visitors;
CREATE POLICY "Anon can insert own visitor"
  ON public.site_visitors
  FOR INSERT TO anon
  WITH CHECK (session_id = get_visitor_session());

-- ============================================================
-- FIX: chat_conversations - anon UPDATE
-- Was: USING (session_token IS NOT NULL) - matched ANY conversation with a token
-- Now: Must match own session_token
-- ============================================================
DROP POLICY IF EXISTS "Anon can update own conversation by token" ON public.chat_conversations;
CREATE POLICY "Anon can update own conversation by token"
  ON public.chat_conversations
  FOR UPDATE TO anon
  USING (
    session_token IS NOT NULL
    AND session_token = get_visitor_session()
  )
  WITH CHECK (
    (status = ANY (ARRAY['bot', 'waiting', 'active']))
    AND assigned_admin IS NULL
  );

-- ============================================================
-- FIX: chat_conversations - anon INSERT
-- Was: WITH CHECK (true) for anon+authenticated
-- Now: Separate policies - anon must provide session_token
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
CREATE POLICY "Anon can create conversations"
  ON public.chat_conversations
  FOR INSERT TO anon
  WITH CHECK (
    session_token IS NOT NULL
    AND session_token = get_visitor_session()
  );
CREATE POLICY "Admins can create conversations"
  ON public.chat_conversations
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============================================================
-- FIX: chat_messages - authenticated INSERT
-- Was: WITH CHECK (true) - any auth user could insert into any conversation
-- Now: Admin only
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert messages" ON public.chat_messages;
CREATE POLICY "Admins can insert messages"
  ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============================================================
-- FIX: site_visitors - authenticated UPDATE
-- Was: USING (true) WITH CHECK (true) - any auth user could update any visitor
-- Now: Admin only
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can update visitors" ON public.site_visitors;
CREATE POLICY "Admins can update visitors"
  ON public.site_visitors
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============================================================
-- FIX: site_visitors - authenticated INSERT
-- Was: WITH CHECK (true)
-- Now: Admin only (anon handles visitor creation)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert visitors" ON public.site_visitors;
CREATE POLICY "Admins can insert visitors"
  ON public.site_visitors
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============================================================
-- FIX: notifications - INSERT
-- Was: Applied to 'authenticated' with WITH CHECK (true)
-- Now: Admin only
-- ============================================================
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============================================================
-- FIX: insurance_order_stage_events - anon policies
-- Tighten to also check visitor_session_id
-- ============================================================
DROP POLICY IF EXISTS "Anon can insert valid stage events" ON public.insurance_order_stage_events;
CREATE POLICY "Anon can insert own stage events"
  ON public.insurance_order_stage_events
  FOR INSERT TO anon
  WITH CHECK (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = get_visitor_session()
    AND EXISTS (
      SELECT 1 FROM insurance_orders o
      WHERE o.id = insurance_order_stage_events.order_id
        AND o.visitor_session_id = get_visitor_session()
    )
  );

DROP POLICY IF EXISTS "Anon can update valid stage events" ON public.insurance_order_stage_events;
CREATE POLICY "Anon can update own stage events"
  ON public.insurance_order_stage_events
  FOR UPDATE TO anon
  USING (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = get_visitor_session()
  )
  WITH CHECK (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = get_visitor_session()
  );

-- Add anon SELECT for stage events (scoped to own session)
CREATE POLICY "Anon can read own stage events"
  ON public.insurance_order_stage_events
  FOR SELECT TO anon
  USING (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = get_visitor_session()
  );

-- ============================================================
-- FIX: chat_messages - anon INSERT
-- Was: sender_type check only
-- Now: Also verify conversation belongs to caller
-- ============================================================
DROP POLICY IF EXISTS "Anon can insert visitor messages" ON public.chat_messages;
CREATE POLICY "Anon can insert visitor messages"
  ON public.chat_messages
  FOR INSERT TO anon
  WITH CHECK (
    sender_type IN ('visitor', 'bot')
    AND EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND c.session_token = get_visitor_session()
    )
  );

-- Add anon SELECT for own chat messages
CREATE POLICY "Anon can read own chat messages"
  ON public.chat_messages
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND c.session_token = get_visitor_session()
    )
  );

-- Add anon SELECT for own conversations
CREATE POLICY "Anon can read own conversations"
  ON public.chat_conversations
  FOR SELECT TO anon
  USING (
    session_token IS NOT NULL
    AND session_token = get_visitor_session()
  );
