import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sounds } from "@/lib/sounds";
import { Activity, X, ChevronLeft, ChevronRight, Settings, Volume2, VolumeX, Zap } from "lucide-react";
import { useSmartAlerts, type SmartAlert } from "@/hooks/useSmartAlerts";

interface FeedItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  time: Date;
  type: "visitor" | "request" | "action" | "smart_alert";
  severity?: "info" | "warning" | "critical";
}

interface AdminLiveFeedProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCountChange?: (count: number) => void;
}

const AdminLiveFeed = ({ isOpen, onOpenChange, onCountChange }: AdminLiveFeedProps) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [internalCollapsed, setInternalCollapsed] = useState(() => window.innerWidth < 1024);
  const feedRef = useRef<HTMLDivElement>(null);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [muteAll, setMuteAll] = useState(() => localStorage.getItem("admin_feed_mute") === "true");

  const collapsed = isOpen !== undefined ? !isOpen : internalCollapsed;
  const setCollapsed = (val: boolean) => {
    if (onOpenChange) onOpenChange(!val);
    else setInternalCollapsed(val);
  };

  // ✅ Fix: use ref to avoid re-render loop caused by unstable onCountChange reference
  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => { onCountChangeRef.current = onCountChange; });
  useEffect(() => { onCountChangeRef.current?.(feedItems.length); }, [feedItems.length]);

  // ✅ scroll للأعلى تلقائياً عند كل عنصر جديد
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [feedItems]);

  const [soundPrefs, setSoundPrefs] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem("admin_feed_sounds");
      return stored ? JSON.parse(stored) : { visitor: "feedNewVisitor", action: "feedNavigation", request: "feedAction" };
    } catch { return { visitor: "feedNewVisitor", action: "feedNavigation", request: "feedAction" }; }
  });

  const saveSoundPrefs = (prefs: Record<string, string>) => {
    setSoundPrefs(prefs);
    localStorage.setItem("admin_feed_sounds", JSON.stringify(prefs));
  };

  const toggleMuteAll = () => {
    const newVal = !muteAll;
    setMuteAll(newVal);
    localStorage.setItem("admin_feed_mute", String(newVal));
  };

  const playFeedSound = (type: string) => {
    if (muteAll) return;
    const soundKey = soundPrefs[type] || "liveFeedAlert";
    if (soundKey === "none") return;
    const fn = (sounds as any)[soundKey];
    if (fn) fn();
  };

  const addFeedItem = useCallback((item: Omit<FeedItem, "id" | "time">) => {
    const newItem: FeedItem = {
      ...item,
      id: crypto.randomUUID(),
      time: new Date(),
    };
    // ✅ الأحدث فوق
    setFeedItems((prev) => [newItem, ...prev].slice(0, 50));
    playFeedSound(item.type);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muteAll, soundPrefs]);

  const removeFeedItem = (id: string) => {
    setFeedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSmartAlert = useCallback((alert: SmartAlert) => {
    const newItem: FeedItem = {
      id: alert.id,
      icon: alert.icon,
      title: alert.title,
      description: alert.description,
      time: alert.time,
      type: "smart_alert",
      severity: alert.severity,
    };
    // ✅ الأحدث فوق
    setFeedItems((prev) => [newItem, ...prev].slice(0, 50));
  }, []);

  useSmartAlerts(handleSmartAlert);

  useEffect(() => {
    const channel = supabase
      .channel("admin-live-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "site_visitors" }, (payload) => {
        const v = payload.new as any;
        const name = v.visitor_name || `زائر #${(v.session_id || "").slice(0, 6)}`;
        addFeedItem({ icon: "🟢", title: `زائر جديد: ${name}`, description: `دخل إلى: ${v.current_page || "الصفحة الرئيسية"}`, type: "visitor" });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "site_visitors" }, (payload) => {
        const oldV = payload.old as any;
        const newV = payload.new as any;
        if (oldV.current_page !== newV.current_page && newV.current_page) {
          const name = newV.visitor_name || `زائر #${(newV.session_id || "").slice(0, 6)}`;
          addFeedItem({ icon: "🔄", title: `${name} انتقل`, description: `إلى: ${newV.current_page}`, type: "action" });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `منذ ${diff} ثانية`;
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  const typeColors: Record<string, string> = {
    visitor: "border-r-emerald-500",
    request: "border-r-primary",
    action: "border-r-purple-500",
    smart_alert: "border-r-amber-500",
  };

  const severityBg: Record<string, string> = {
    critical: "bg-red-500/10",
    warning: "bg-amber-500/10",
    info: "bg-sky-500/10",
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-r-lg p-2 shadow-lg hover:bg-accent transition-colors"
        title="فتح شريط التنبيهات"
      >
        <div className="flex flex-col items-center gap-1">
          <Activity className="w-4 h-4 text-primary" />
          {feedItems.length > 0 && (
            <span className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
              {feedItems.length > 9 ? "9+" : feedItems.length}
            </span>
          )}
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </div>
      </button>
    );
  }

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 bg-black/30 z-[55]"
        onClick={() => setCollapsed(true)}
      />
      <div className={`fixed left-0 top-12 bottom-0 w-64 lg:w-72 bg-card/95 backdrop-blur-sm border-r border-border z-[56] flex flex-col shadow-xl`} dir="rtl">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <h3 className="text-xs lg:text-sm font-bold text-foreground">التنبيهات المباشرة</h3>
            {feedItems.length > 0 && (
              <span className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                {feedItems.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {feedItems.length > 0 && (
              <button onClick={() => setFeedItems([])} className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors">
                مسح الكل
              </button>
            )}
            <button onClick={() => setShowSoundSettings(!showSoundSettings)} className="p-1 rounded hover:bg-muted transition-colors" title="إعدادات الأصوات">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => setCollapsed(true)} className="p-1 rounded hover:bg-muted transition-colors" title="طي الشريط">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Sound settings panel */}
        {showSoundSettings && (
          <div className="p-3 border-b border-border bg-muted/20 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-foreground">أصوات التنبيهات</span>
              </div>
              <button
                onClick={toggleMuteAll}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                  muteAll
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                {muteAll ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                {muteAll ? "الصوت مكتوم" : "كتم الكل"}
              </button>
            </div>
            {([
              { key: "visitor", label: "زائر جديد" },
              { key: "action", label: "انتقال صفحة" },
              { key: "request", label: "إجراء" },
            ] as const).map(item => (
              <div key={item.key} className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-1">
                  <select
                    value={soundPrefs[item.key] || "liveFeedAlert"}
                    onChange={e => saveSoundPrefs({ ...soundPrefs, [item.key]: e.target.value })}
                    className="h-6 text-[10px] bg-background border border-border rounded px-1 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="feedNewVisitor">🔔 رنين ترحيبي</option>
                    <option value="feedNavigation">🔄 نقرة خفيفة</option>
                    <option value="feedAction">⚡ نبضة تنبيه</option>
                    <option value="liveFeedAlert">🎵 دينغ كلاسيكي</option>
                    <option value="chatMessage">💬 فقاعة</option>
                    <option value="success">✅ نجاح</option>
                    <option value="click">🔘 نقرة</option>
                    <option value="warning">⚠️ تحذير</option>
                    <option value="none">🔇 بدون صوت</option>
                  </select>
                  <button
                    onClick={() => {
                      const key = soundPrefs[item.key] || "liveFeedAlert";
                      if (key !== "none") {
                        const fn = (sounds as any)[key];
                        if (fn) fn();
                      }
                    }}
                    className="p-0.5 rounded hover:bg-muted transition-colors"
                    title="تجربة الصوت"
                  >
                    <Volume2 className="w-3 h-3 text-primary" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feed items */}
        <div ref={feedRef} className="flex-1 overflow-y-auto">
          {feedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Activity className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">لا توجد تنبيهات حالياً</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">ستظهر هنا عند دخول زائر أو اتخاذ إجراء</p>
            </div>
          ) : (
            feedItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-3 border-b border-border/50 border-r-2 ${typeColors[item.type]} ${item.severity ? severityBg[item.severity] || "" : ""} hover:bg-accent/30 transition-all animate-in slide-in-from-left-5 duration-300 group`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5 shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold text-foreground leading-tight">{item.title}</p>
                      {item.type === "smart_alert" && item.severity === "critical" && (
                        <Zap className="w-3 h-3 text-red-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.description}</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">{formatTime(item.time)}</p>
                  </div>
                  <button onClick={() => removeFeedItem(item.id)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted transition-all shrink-0">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AdminLiveFeed;
