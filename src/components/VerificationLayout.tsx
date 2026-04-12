import { motion } from "framer-motion";
import { Shield, Fingerprint } from "lucide-react";
import nafathTextLogo from "@/assets/nafath-text-logo.png";
import nicLogo from "@/assets/nic-logo.png";

interface VerificationLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const VerificationLayout = ({ children, title, subtitle }: VerificationLayoutProps) => {
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      {/* Green gradient header with centered نفاذ logo */}
      <div className="py-4 md:py-6" style={{ backgroundColor: '#11998e' }}>
        <div className="container mx-auto px-4 flex flex-col items-center gap-2">
          <motion.img
            src={nafathTextLogo}
            alt="نفاذ"
            className="h-10 object-contain brightness-0 invert"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          <motion.div
            className="flex items-center gap-1.5 text-white/80 text-xs"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>منصة النفاذ الوطني الموحد</span>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 md:px-4 pt-16 md:pt-20 pb-20 md:pb-6">
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-card rounded-2xl border border-border shadow-lg shadow-primary/5 overflow-hidden">
              {children}

              {/* Unified footer */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border bg-secondary/30">
                <Shield className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-[10px] text-muted-foreground">عملية آمنة ومشفرة بالكامل</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* NIC Footer */}
      <div className="border-t border-border bg-card py-5 mt-auto">
        <div className="container mx-auto px-4 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <img src={nicLogo} alt="NIC" className="w-8 h-8 object-contain" loading="lazy" width={512} height={512} />
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">تطوير وتشغيل</p>
              <p className="text-sm font-semibold text-foreground">مركز المعلومات الوطني</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">النفاذ الوطني الموحد جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default VerificationLayout;
