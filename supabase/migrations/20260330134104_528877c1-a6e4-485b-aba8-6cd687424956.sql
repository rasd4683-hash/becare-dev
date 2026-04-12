CREATE POLICY "Admins can delete visitors"
ON public.site_visitors
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));