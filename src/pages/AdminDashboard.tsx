import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminVisitors from "@/components/admin/AdminVisitors";
import AdminLiveFeed from "@/components/admin/AdminLiveFeed";
import PullToRefresh from "@/components/PullToRefresh";
import { Search, RefreshCw, Activity, VolumeX } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("visitors");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);
  const [liveFeedOpen, setLiveFeedOpen] = useState(false);
  const [liveFeedCount, setLiveFeedCount] = useState(0);
  const handleCountChange = useCallback((count: number) => {
    setLiveFeedCount(count);
  }, []);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("admin_feed_mute") === "true");

  // Listen for mute changes from LiveFeed settings
  useEffect(() => {
    const checkMute = () => setIsMuted(localStorage.getItem("admin_feed_mute") === "true");
    window.addEventListener("storage", checkMute);
    const interval = setInterval(checkMute, 1000);
    return () => { window.removeEventListener("storage", checkMute); clearInterval(interval); };
  }, []);

  const handlePullRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
    await new Promise(r => setTimeout(r, 600));
    toast.success("تم تحديث البيانات");
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin/login"); return; }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!data) {
        toast.error("ليس لديك صلاحية الوصول");
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [navigate]);

  if (isAdmin === null) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-white/50 animate-spin" />
          <span className="text-white/60 text-sm">جاري التحقق من الصلاحيات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-secondary/30 flex flex-col">
      {/* Top Navigation Bar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Secondary toolbar: search + live feed */}
      <div className="h-10 bg-card/60 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none flex-1 min-w-0"
          />
        </div>

        <div className="flex items-center gap-1">
          {isMuted && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive" title="الصوت مكتوم">
              <VolumeX className="w-3 h-3" />
            </div>
          )}
          <button
            onClick={() => setLiveFeedOpen(true)}
            className="relative p-1.5 rounded-lg hover:bg-secondary/70 transition-colors"
            title="التنبيهات المباشرة"
          >
            <Activity className="w-4 h-4 text-primary" />
            {liveFeedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {liveFeedCount > 9 ? "9+" : liveFeedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <PullToRefresh onRefresh={handlePullRefresh}>
        <main className="flex-1 p-2 md:p-4 lg:p-6">
          {activeTab === "settings" && <AdminSettings />}
          {activeTab === "visitors" && <AdminVisitors key={refreshKey} />}
        </main>
      </PullToRefresh>

      {/* Live Feed Panel */}
      <AdminLiveFeed isOpen={liveFeedOpen} onOpenChange={setLiveFeedOpen} onCountChange={handleCountChange} />
    </div>
  );
};

export default AdminDashboard;
