
-- Allow service role to delete from tables (needed for clear-all-data edge function)
CREATE POLICY "Service role can delete messages" ON public.chat_messages FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete conversations" ON public.chat_conversations FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete orders" ON public.insurance_orders FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete requests" ON public.insurance_requests FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role can delete claims" ON public.claims FOR DELETE TO service_role USING (true);
