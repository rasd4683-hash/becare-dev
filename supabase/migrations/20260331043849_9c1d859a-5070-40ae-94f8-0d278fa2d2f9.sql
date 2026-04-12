
-- ============================================================
-- SECURITY FIX ROUND 2: Address remaining findings
-- ============================================================

-- 1. Fix notifications UPDATE - add WITH CHECK to prevent ownership transfer
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Fix temp storage - scope to session prefix
DROP POLICY IF EXISTS "Anon can view temp vehicle documents" ON storage.objects;
CREATE POLICY "Anon can view own temp vehicle documents"
  ON storage.objects
  FOR SELECT TO anon
  USING (
    bucket_id = 'vehicle-documents'
    AND (storage.foldername(name))[1] = 'temp'
    AND (storage.foldername(name))[2] = public.get_visitor_session()
  );

-- 3. Fix temp upload - scope to session prefix
DROP POLICY IF EXISTS "Anon can upload to temp folder" ON storage.objects;
CREATE POLICY "Anon can upload to own temp folder"
  ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'vehicle-documents'
    AND (storage.foldername(name))[1] = 'temp'
    AND (storage.foldername(name))[2] = public.get_visitor_session()
  );

-- 4. Add DELETE and UPDATE for authenticated users on their own docs
CREATE POLICY "Authenticated users can delete own vehicle documents"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'vehicle-documents'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "Authenticated users can update own vehicle documents"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vehicle-documents'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 5. Restrict anon UPDATE on insurance_order_stage_events columns
-- Drop and recreate with restricted WITH CHECK
DROP POLICY IF EXISTS "Anon can update own stage events" ON public.insurance_order_stage_events;
CREATE POLICY "Anon can update own stage events"
  ON public.insurance_order_stage_events
  FOR UPDATE TO anon
  USING (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = public.get_visitor_session()
  )
  WITH CHECK (
    visitor_session_id IS NOT NULL
    AND visitor_session_id = public.get_visitor_session()
    -- Prevent changing stage/status directly from client
    AND status = 'pending'
  );
