import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PremiumPageHeader from "@/components/PremiumPageHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PremiumPageHeader
        title="الصفحة غير موجودة"
        subtitle="عذراً، الصفحة التي تبحث عنها غير متاحة أو تم نقلها"
        badge="خطأ 404"
        badgeIcon={<AlertTriangle className="w-3.5 h-3.5 text-cta" />}
        compact
      >
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <Link to="/">
            <Button className="bg-cta text-cta-foreground hover:bg-cta-hover text-lg px-10 py-6 rounded-2xl font-bold btn-glow gap-2">
              <Home className="w-5 h-5" />
              العودة للرئيسية
            </Button>
          </Link>
        </motion.div>
      </PremiumPageHeader>
    </div>
  );
};

export default NotFound;
