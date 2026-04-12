import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { companyLogos } from "@/lib/companyLogos";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import { Button } from "@/components/ui/button";
import {
  Shield, Check, Wallet, ShoppingCart, ArrowLeft, CreditCard, FileText, Eye, X, AlertTriangle, User, Car, Download
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import InsuranceStepper from "@/components/InsuranceStepper";
import { useLanguage } from "@/i18n/LanguageContext";


const InsuranceCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, dir } = useLanguage();
  const ck = t.checkout;
  const offer = location.state?.offer;
  const customer = useMemo(() => {
    const stateCustomer = location.state?.customer && Object.keys(location.state.customer).length > 0
      ? location.state.customer
      : null;

    if (stateCustomer) return stateCustomer;

    try {
      return JSON.parse(sessionStorage.getItem("insurance_customer") || "{}");
    } catch {
      return {};
    }
  }, [location.state]);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    if (customer && Object.keys(customer).length > 0) {
      sessionStorage.setItem("insurance_customer", JSON.stringify(customer));
    }
  }, [customer]);

  const policyNumber = useMemo(() => `DRAFT-${Date.now().toString().slice(-8)}`, []);
  const verificationUrl = useMemo(() => `${window.location.origin}/verify?policy=${policyNumber}`, [policyNumber]);

  useEffect(() => {
    if (policyNumber) {
      sessionStorage.setItem("draft_policy_number", policyNumber);
    }
  }, [policyNumber]);

  const handleDownloadPDF = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;
    const today = new Date().toLocaleDateString("ar-SA");
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-SA");

    const usageMap: Record<string, string> = { personal: "شخصي", commercial: "تجاري" };
    const repairMap: Record<string, string> = { agency: "الوكالة", workshop: "ورشة" };

    const customerRows = [
      customer.full_name && `<tr><td>${customer.full_name}</td><td>الاسم الكامل</td></tr>`,
      customer.national_id && `<tr><td>${customer.national_id}</td><td>رقم الهوية</td></tr>`,
      customer.phone && `<tr><td>${customer.phone}</td><td>رقم الجوال</td></tr>`,
    ].filter(Boolean).join("");

    const vehicleRows = [
      customer.vehicle_make && `<tr><td>${customer.vehicle_make}</td><td>الشركة المصنعة</td></tr>`,
      customer.vehicle_model && `<tr><td>${customer.vehicle_model}</td><td>الموديل</td></tr>`,
      customer.vehicle_year && `<tr><td>${customer.vehicle_year}</td><td>سنة الصنع</td></tr>`,
      customer.serial_number && `<tr><td>${customer.serial_number}</td><td>الرقم التسلسلي</td></tr>`,
      customer.passenger_count && `<tr><td>${customer.passenger_count}</td><td>عدد الركاب</td></tr>`,
      customer.vehicle_usage && `<tr><td>${usageMap[customer.vehicle_usage] || customer.vehicle_usage}</td><td>غرض الاستخدام</td></tr>`,
      customer.estimated_value && `<tr><td>${customer.estimated_value}</td><td>القيمة التقديرية</td></tr>`,
      customer.repair_location && `<tr><td>${repairMap[customer.repair_location] || customer.repair_location}</td><td>مكان التصليح</td></tr>`,
    ].filter(Boolean).join("");

    const featuresHtml = (offer.features || []).map((f: string) => `<li>✓ ${f}</li>`).join("");
    const addOnsHtml = (offer.addOns || []).map((a: { label: string; price: number }) =>
      `<tr><td>${a.price.toLocaleString()} ر.س</td><td>${a.label}</td></tr>`
    ).join("");

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>بوليصة تأمين - مسودة</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
   body { font-family: 'Tajawal', sans-serif; background: #fff; color: #1a1a1a; padding: 16px; direction: rtl; max-width: 100vw; overflow-x: hidden; }
   .header { text-align: center; border-bottom: 3px solid #0d5c4b; padding-bottom: 20px; margin-bottom: 24px; }
   .logo { font-size: 28px; font-weight: 800; color: #0d5c4b; }
   .draft-badge { display: inline-block; background: #fff3cd; color: #856404; border: 1px solid #ffc107; border-radius: 8px; padding: 5px 12px; font-size: 12px; font-weight: 700; margin-top: 10px; }
   .policy-num { font-family: monospace; font-size: 15px; color: #0d5c4b; margin-top: 8px; letter-spacing: 1.5px; word-break: break-all; }
   .section { margin-bottom: 20px; }
   .section-title { font-size: 14px; font-weight: 700; color: #0d5c4b; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-bottom: 10px; }
   table { width: 100%; border-collapse: collapse; }
   td { padding: 6px 8px; font-size: 12px; border-bottom: 1px solid #f0f0f0; word-break: break-word; }
   td:first-child { text-align: left; font-weight: 600; }
   td:last-child { text-align: right; color: #666; white-space: nowrap; }
   ul { list-style: none; padding: 0; }
   li { padding: 5px 0; font-size: 12px; color: #333; }
   .total-box { background: #f0faf7; border: 2px solid #0d5c4b; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
   .total-amount { font-size: 24px; font-weight: 800; color: #0d5c4b; }
   .total-label { font-size: 12px; color: #666; margin-top: 4px; }
   .disclaimer { font-size: 10px; color: #999; text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e0e0e0; line-height: 1.8; }
   .print-btn { display: block; margin: 16px auto; padding: 12px 40px; background: #0d5c4b; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; font-family: 'Tajawal'; cursor: pointer; width: calc(100% - 32px); max-width: 400px; }
   .print-btn:hover { background: #094438; }
   .qr-section { text-align: center; margin: 20px 0; padding: 16px; border: 1px solid #e0e0e0; border-radius: 12px; background: #f9f9f9; }
   .qr-section img { max-width: 120px; height: auto; }
   @media (min-width: 600px) { body { padding: 40px; } .logo { font-size: 32px; } .policy-num { font-size: 18px; } td { padding: 8px 12px; font-size: 13px; } .total-amount { font-size: 28px; } }
   @media print { .print-btn { display: none; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo"><span style="color:#2196a9">B</span><span style="color:#f5a623">Care</span></div>
    <div class="draft-badge">⚠ مسودة - لأغراض المراجعة فقط</div>
    <div class="policy-num">${policyNumber}</div>
  </div>

  <div class="section">
    <div class="section-title">شركة التأمين</div>
    <table>
      <tr><td>${offer.company}</td><td>اسم الشركة</td></tr>
      <tr><td>${offer.type}</td><td>نوع التغطية</td></tr>
      <tr><td>12 شهر</td><td>مدة التغطية</td></tr>
      <tr><td>${today}</td><td>تاريخ البدء</td></tr>
      <tr><td>${endDate}</td><td>تاريخ الانتهاء</td></tr>
    </table>
  </div>

  ${customerRows ? `<div class="section"><div class="section-title">بيانات المؤمّن له</div><table>${customerRows}</table></div>` : ""}
  ${vehicleRows ? `<div class="section"><div class="section-title">بيانات المركبة</div><table>${vehicleRows}</table></div>` : ""}

  <div class="section">
    <div class="section-title">التغطيات المشمولة</div>
    <ul>${featuresHtml}</ul>
  </div>

  ${addOnsHtml ? `<div class="section"><div class="section-title">الإضافات المختارة</div><table>${addOnsHtml}</table></div>` : ""}

  <div class="section">
    <div class="section-title">ملخص الأسعار</div>
    <table>
      <tr><td style="text-decoration:line-through;color:#999">${offer.originalPrice?.toLocaleString()} ر.س</td><td>السعر الأصلي</td></tr>
      <tr><td style="color:#0d5c4b;font-weight:700">-${(offer.originalPrice - offer.price)?.toLocaleString()} ر.س</td><td>الخصم</td></tr>
      ${offer.addOnsTotal > 0 ? `<tr><td style="color:#0d5c4b">+${offer.addOnsTotal?.toLocaleString()} ر.س</td><td>خيارات إضافية</td></tr>` : ""}
    </table>
  </div>

  <div class="total-box">
    <div class="total-amount">${(offer.totalPrice || offer.price).toLocaleString()} ر.س</div>
    <div class="total-label">الإجمالي شامل ضريبة القيمة المضافة 15%</div>
  </div>

  <div class="qr-section">
    <p style="font-size:13px;font-weight:700;color:#0d5c4b;margin-bottom:10px">رمز التحقق من البوليصة</p>
    <img src="${qrUrl}" alt="QR Code" style="margin:0 auto;display:block" width="120" height="120" />
    <p style="font-size:10px;color:#999;margin-top:8px">امسح الرمز للتحقق من صحة البوليصة</p>
  </div>

  <div class="disclaimer">
    هذه البوليصة مسودة أولية لأغراض المراجعة فقط. سيتم إصدار البوليصة النهائية بعد إتمام عملية الدفع والتحقق من جميع البيانات المطلوبة.
    <br>© ${new Date().getFullYear()} بي كير. جميع الحقوق محفوظة.
  </div>

  <button class="print-btn" onclick="window.print()">طباعة / حفظ كـ PDF</button>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{ck.noOfferSelected}</p>
            <Button onClick={() => navigate("/insurance/offers")} className="rounded-xl">{ck.showAvailableOffers}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background" dir={dir}>
      <Navbar />

      <PremiumPageHeader
        title={ck.title}
        badge={ck.badge}
        badgeIcon={<ShoppingCart className="w-3.5 h-3.5 text-cta" />}
        compact
      />

      <div className="container mx-auto px-3 md:px-4 -mt-6 md:-mt-8 pb-24 md:pb-12">
        <div className="max-w-2xl mx-auto">
          <InsuranceStepper active={2}  />

          {/* Company Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gradient-to-bl from-primary/10 via-card to-card rounded-2xl border border-primary/15 shadow-[0_4px_24px_hsl(var(--primary)/0.08)] overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-card border-2 border-primary/20 flex items-center justify-center shadow-md">
                  {companyLogos[offer.company] ? (
                    <img src={companyLogos[offer.company]} alt={offer.company} className="w-full h-full object-contain p-1.5" loading="lazy" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{offer.logoInitials || offer.company?.slice(0, 2)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-lg text-foreground">{offer.company}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" />
                      {offer.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coverage Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3"
          >
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                </div>
                <h4 className="text-xs font-bold text-foreground">{ck.includedCoverage}</h4>
              </div>
              <div className="px-4 py-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {offer.features?.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-cta/5 border border-cta/10">
                      <div className="w-5 h-5 rounded-full bg-cta/15 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-cta" />
                      </div>
                      <span className="text-xs text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add-ons Section */}
          {offer.addOns?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-3"
            >
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{ck.additionalOptions}</h4>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mr-auto">{offer.addOns.length}</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {offer.addOns.map((addon: { id: string; label: string; price: number; description?: string }, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-foreground">{addon.label}</span>
                          {addon.description && (
                            <p className="text-[10px] text-muted-foreground">{addon.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary whitespace-nowrap">{addon.price.toLocaleString()} {ck.sar}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mt-3"
          >
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                </div>
                <h4 className="text-xs font-bold text-foreground">{ck.priceDetails}</h4>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground line-through">{offer.originalPrice?.toLocaleString()} {ck.sar}</span>
                  <span className="text-muted-foreground">{ck.originalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cta font-bold bg-cta/10 px-2 py-0.5 rounded-full">-{(offer.originalPrice - offer.price)?.toLocaleString()} {ck.sar}</span>
                  <span className="text-muted-foreground">{ck.discount}</span>
                </div>
                {offer.addOnsTotal > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary font-bold">+{offer.addOnsTotal?.toLocaleString()} {ck.sar}</span>
                    <span className="text-muted-foreground">{ck.addOnsOptions}</span>
                  </div>
                )}
              </div>
              {/* Total highlight */}
              <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/15">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-primary">{(offer.totalPrice || offer.price).toLocaleString()} {ck.sar}</span>
                  <span className="font-bold text-foreground text-sm">{ck.total}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1.5">{ck.vatIncluded}</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-5 space-y-2.5"
          >
            <Button
              onClick={() => navigate("/insurance/payment", { state: { offer } })}
              className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-2xl py-6 font-bold text-base gap-2 shadow-[0_4px_16px_hsl(var(--cta)/0.3)]"
            >
              <CreditCard className="w-5 h-5" />
              {ck.continueToPayment}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPolicy(true)}
                className="rounded-xl py-4 gap-1.5 border-primary/20 text-primary hover:bg-primary/5 text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                {ck.draftPolicy}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/insurance/offers")}
                className="rounded-xl py-4 gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {ck.backToOffers}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Draft Policy Modal - Full screen on mobile, centered on desktop */}
      <AnimatePresence>
        {showPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-foreground/60 backdrop-blur-sm"
            onClick={() => setShowPolicy(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-card rounded-t-3xl md:rounded-2xl border border-border shadow-2xl w-full max-w-lg h-[92dvh] md:max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="shrink-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between rounded-t-3xl md:rounded-t-2xl">
                <button onClick={() => setShowPolicy(false)} className="p-2 -m-1 rounded-xl hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <h3 className="font-bold text-sm text-foreground">{ck.policyDraft}</h3>
                {/* Mobile drag indicator */}
                <div className="w-8 md:hidden" />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {/* Draft Banner */}
                <div className="mx-3 mt-3 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-[11px] text-destructive font-medium leading-relaxed">
                    {ck.draftBanner}
                  </p>
                </div>

                <div className="p-3 space-y-3">
                  {/* Policy Number */}
                  <div className="text-center p-3 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-[10px] text-muted-foreground mb-1">{ck.tempPolicyNumber}</p>
                    <p className="font-mono font-bold text-primary text-base tracking-wider">
                      {policyNumber}
                    </p>
                  </div>

                  {/* Company Info */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-card border border-border flex items-center justify-center shrink-0">
                      {companyLogos[offer.company] ? (
                        <img src={companyLogos[offer.company]} alt={offer.company} className="w-full h-full object-contain p-1" loading="lazy" />
                      ) : (
                        <span className="text-[10px] font-bold text-primary">{offer.company?.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{offer.company}</p>
                      <p className="text-xs text-muted-foreground">{offer.type}</p>
                    </div>
                  </div>

                  {/* Info Sections */}
                  {[
                    {
                      show: customer.full_name || customer.national_id || customer.phone,
                      icon: <User className="w-3.5 h-3.5 text-primary" />,
                      title: ck.insuredData,
                      rows: [
                        { label: ck.fullName, value: customer.full_name },
                        { label: ck.nationalId, value: customer.national_id },
                        { label: ck.phoneNumber, value: customer.phone },
                      ].filter((r) => r.value),
                    },
                    {
                      show: customer.vehicle_make || customer.serial_number,
                      icon: <Car className="w-3.5 h-3.5 text-primary" />,
                      title: ck.vehicleData,
                      rows: [
                        { label: ck.manufacturer, value: customer.vehicle_make },
                        { label: ck.model, value: customer.vehicle_model },
                        { label: ck.yearOfMake, value: customer.vehicle_year },
                        { label: ck.serialNumber, value: customer.serial_number },
                        { label: ck.passengerCount, value: customer.passenger_count },
                        { label: ck.vehicleUsage, value: customer.vehicle_usage === "personal" ? ck.personal : customer.vehicle_usage === "commercial" ? ck.commercial : customer.vehicle_usage },
                        { label: ck.estimatedValue, value: customer.estimated_value || null },
                        { label: ck.repairLocation, value: customer.repair_location === "agency" ? ck.agencyRepair : customer.repair_location === "workshop" ? ck.workshopRepair : customer.repair_location },
                      ].filter((r) => r.value),
                    },
                    {
                      show: true,
                      icon: <FileText className="w-3.5 h-3.5 text-primary" />,
                      title: ck.policyDetails,
                      rows: [
                        { label: ck.coverageType, value: offer.type },
                        { label: ck.coverageDuration, value: ck.months12 },
                        { label: ck.startDate, value: new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US") },
                        { label: ck.endDate, value: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US") },
                      ],
                    },
                  ].filter((s) => s.show).map((section, si) => (
                    <div key={si} className="rounded-xl border border-border overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/40 border-b border-border">
                        {section.icon}
                        <h4 className="font-bold text-foreground text-xs">{section.title}</h4>
                      </div>
                      <div className="divide-y divide-border/40">
                        {section.rows.map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2">
                            <span className="text-xs font-medium text-foreground truncate max-w-[55%]">{item.value}</span>
                            <span className="text-[11px] text-muted-foreground shrink-0">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Coverage */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/40 border-b border-border">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <h4 className="font-bold text-foreground text-xs">{ck.coverages}</h4>
                    </div>
                    <div className="p-3 grid grid-cols-1 gap-1.5">
                      {offer.features?.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 py-1">
                          <Check className="w-3.5 h-3.5 text-cta shrink-0" />
                          <span className="text-xs text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  {offer.addOns?.length > 0 && (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/40 border-b border-border">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        <h4 className="font-bold text-foreground text-xs">{ck.selectedAddOns}</h4>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full mr-auto">{offer.addOns.length}</span>
                      </div>
                      <div className="divide-y divide-border/40">
                        {offer.addOns.map((addon: { label: string; price: number }, i: number) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2">
                            <span className="font-medium text-primary text-xs">{addon.price.toLocaleString()} {ck.sar}</span>
                            <span className="text-xs text-muted-foreground">{addon.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="p-4 rounded-xl bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{ck.totalPremium}</p>
                    <p className="text-2xl font-extrabold text-primary">{(offer.totalPrice || offer.price).toLocaleString()} {ck.sar}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{ck.vatIncluded}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-xs font-bold text-foreground">{ck.verificationCode}</p>
                    <QRCodeSVG
                      value={verificationUrl}
                      size={88}
                      bgColor="transparent"
                      fgColor="hsl(168, 75%, 20%)"
                      level="M"
                    />
                    <p className="text-[10px] text-muted-foreground text-center">
                      {ck.scanToVerify}
                    </p>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed px-2">
                    {ck.draftDisclaimer}
                  </p>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 bg-card border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] space-y-2">
                <Button
                  onClick={handleDownloadPDF}
                  className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-5 font-bold gap-2"
                >
                  <Download className="w-5 h-5" />
                  {ck.downloadPDF}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPolicy(false)}
                  className="w-full rounded-xl py-3.5 text-sm"
                >
                  {ck.closeDraft}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default InsuranceCheckout;
