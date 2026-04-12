import { LogOut, Settings, Eye, Globe, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";

const menuItems = [
  { id: "visitors", label: "قائمة الزوار", icon: Eye },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCounts?: Record<string, never>;
}

const AdminSidebar = ({ activeTab, setActiveTab }: Props) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <header className="w-full bg-card border-b border-border flex items-center justify-between px-4 h-12 shrink-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">B</span>
        </div>
        <span className="text-sm font-bold hidden md:block">BCare Admin</span>
      </Link>

      {/* Status */}
      <div className="hidden md:flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-muted-foreground">الموقع يعمل</span>
        <Globe className="w-3 h-3 text-muted-foreground/60" />
      </div>

      {/* Nav items */}
      <nav className="flex items-center gap-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === item.id
                ? "bg-cta text-cta-foreground shadow-sm shadow-cta/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors"
          title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-cta" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:block">خروج</span>
        </button>
      </div>
    </header>
  );
};

export default AdminSidebar;
