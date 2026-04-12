
CREATE OR REPLACE FUNCTION public.get_own_order(p_visitor_session_id text, p_order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'nafath_number', nafath_number,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result
  FROM public.insurance_orders
  WHERE id = p_order_id AND visitor_session_id = p_visitor_session_id;
  
  RETURN v_result;
END;
$function$;

ALTER PUBLICATION supabase_realtime ADD TABLE insurance_orders;
