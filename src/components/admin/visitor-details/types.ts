import React from "react";

export interface Visitor {
  id: string; session_id: string; visitor_name: string | null; current_page: string | null;
  is_online: boolean; last_seen_at: string; created_at: string; phone: string | null;
  national_id: string | null; linked_request_id: string | null; linked_conversation_id: string | null;
  is_blocked: boolean; user_agent: string | null; ip_address: string | null;
  is_favorite: boolean; country: string | null; country_code: string | null;
  tags?: string[] | null;
}

export interface InsuranceRequest {
  id: string; national_id: string; phone: string; insurance_type: string | null;
  serial_number: string | null; status: string; request_type: string; created_at: string;
  repair_location: string | null; passenger_count: string | null; estimated_value: string | null;
  vehicle_usage: string | null; notes: string | null; policy_start_date: string | null; birth_date: string | null;
}

export interface InsuranceOrder {
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

export interface Claim {
  id: string; full_name: string; phone: string; policy_number: string; claim_type: string;
  description: string; status: string; email: string | null; created_at: string;
}

export interface ChatConv {
  id: string; visitor_name: string | null; status: string; created_at: string; messages_count?: number;
}

export interface StageEvent {
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

export const insuranceTypeLabel: Record<string, string> = { comprehensive: "شامل", third_party: "ضد الغير", custom: "مخصص" };

export const statusLabel: Record<string, { text: string; cls: string }> = {
  pending: { text: "قيد الانتظار", cls: "bg-amber-500/10 text-amber-600" },
  approved: { text: "مقبول", cls: "bg-emerald-500/10 text-emerald-600" },
  rejected: { text: "مرفوض", cls: "bg-red-500/10 text-red-600" },
  completed: { text: "مكتمل", cls: "bg-blue-500/10 text-blue-600" },
};

export const stageLabel: Record<string, string> = {
  payment: "الدفع", otp: "رمز OTP", phone_verification: "توثيق الجوال",
  phone_otp: "كود توثيق الجوال", stc_call: "مكالمة STC", nafath_login: "دخول نفاذ", nafath_verify: "رمز نفاذ",
};

export const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
export const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
export const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export const parseUserAgent = (ua: string | null) => {
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

export const countryFlag = (code: string | null) => {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(...code.toUpperCase().split("").map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
};

export const getSessionDuration = (created: string, lastSeen: string) => {
  const diff = Math.max(0, Math.floor((new Date(lastSeen).getTime() - new Date(created).getTime()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}س ${m}د`;
  if (m > 0) return `${m}د`;
  return `< 1د`;
};

export const AVATAR_COLORS = [
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

export const getVisitorAvatar = (sessionId: string) => {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = ((hash << 5) - hash) + sessionId.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getVisitorInitial = (name: string | null) => {
  if (!name || name === "زائر") return "ز";
  return name.charAt(0).toUpperCase();
};

export const VISITOR_TAGS = [
  { key: "vip", label: "VIP", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  { key: "potential", label: "عميل محتمل", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  { key: "suspicious", label: "مشبوه", color: "bg-red-500/15 text-red-600 border-red-500/30" },
  { key: "returning", label: "زائر عائد", color: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
] as const;

export const carrierLogos: Record<string, string> = {};
