import React from "react";
import { User, Phone, CreditCard, Globe, Clock, MapPin } from "lucide-react";
import { InfoItem } from "./InfoItem";
import CollapsibleCard from "./CollapsibleCard";
import type { Visitor, InsuranceRequest, InsuranceOrder, Claim, StageEvent } from "./types";
import { countryFlag, formatTime, formatDate } from "./types";
import VisitorDataFeed from "./VisitorDataFeed";

interface Props {
  selectedVisitor: Visitor;
  visitorName: string | null;
  customerName: string | null;
  visitorPhone: string | null;
  visitorNationalId: string | null;
  linkedRequests: InsuranceRequest[];
  linkedOrders: InsuranceOrder[];
  stageEvents: StageEvent[];
  loadingAction: string | null;
  onApprove: (reqId: string) => void;
  onReject: (reqId: string) => void;
  insuranceTypeLabel: Record<string, string>;
  statusLabel: Record<string, { text: string; cls: string }>;
}

const TabIdentity: React.FC<Props> = ({
  selectedVisitor, visitorName, customerName, visitorPhone, visitorNationalId,
  linkedRequests, linkedOrders, stageEvents, loadingAction, onApprove, onReject, insuranceTypeLabel, statusLabel,
}) => {
  return (
    <div className="space-y-4">
      {/* Real-time Visitor Data Feed */}
      <VisitorDataFeed stageEvents={stageEvents} linkedOrders={linkedOrders} />

      {/* Personal Information */}
      <CollapsibleCard
        title="المعلومات الشخصية"
        icon={<User className="w-3 h-3" />}
        borderColor="border-sky-500/30"
        bgColor="bg-sky-500/5"
        headerBg="bg-sky-500/10"
        headerBorder="border-sky-500/20"
        textColor="text-sky-600"
        defaultOpen
      >
        <div className="px-3 py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">الاسم</p>
              <p className="text-xs font-medium text-foreground">{visitorName || "لا توجد بيانات"}</p>
            </div>
          </div>
          {customerName && customerName !== visitorName && (
            <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <div>
                <p className="text-[9px] text-muted-foreground">اسم العميل</p>
                <p className="text-xs font-medium text-foreground">{customerName}</p>
              </div>
            </div>
          )}
          <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">رقم الجوال</p>
              <p className="text-xs font-medium text-foreground">{visitorPhone || "لا توجد بيانات"}</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">رقم الهوية</p>
              <p className="text-xs font-medium text-foreground">{visitorNationalId || "لا توجد بيانات"}</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">الدولة</p>
              <p className="text-xs font-medium text-foreground">
                {selectedVisitor.country ? `${countryFlag(selectedVisitor.country_code)} ${selectedVisitor.country}` : "لا توجد بيانات"}
              </p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">عنوان IP</p>
              <p className="text-xs font-medium text-foreground">{selectedVisitor.ip_address || "لا توجد بيانات"}</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">آخر نشاط</p>
              <p className="text-xs font-medium text-foreground">{formatTime(selectedVisitor.last_seen_at)}</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">الصفحة الحالية</p>
              <p className="text-xs font-medium text-foreground">{selectedVisitor.current_page || "/"}</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">تاريخ الزيارة الأولى</p>
              <p className="text-xs font-medium text-foreground">{formatDate(selectedVisitor.created_at)}</p>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Insurance Requests */}
      {linkedRequests.length > 0 && (
        <CollapsibleCard
          title="طلبات التأمين"
          icon={<span>📋</span>}
          borderColor="border-indigo-500/30"
          bgColor="bg-indigo-500/5"
          headerBg="bg-indigo-500/10"
          headerBorder="border-indigo-500/20"
          textColor="text-indigo-600"
          defaultOpen
        >
          <div className="px-3 py-2.5 space-y-2">
            {linkedRequests.map(req => (
              <div
                key={req.id}
                data-pending-request={req.status === "pending" ? "true" : undefined}
                className={`bg-muted/20 rounded-xl border p-3 space-y-2 ${req.status === "pending" ? "border-blue-500/40 ring-1 ring-blue-500/20" : "border-border/50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    طلب {req.request_type === "new" ? "جديد" : "تجديد"} - {insuranceTypeLabel[req.insurance_type || ""] || req.insurance_type || "غير محدد"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusLabel[req.status]?.cls || "bg-muted text-muted-foreground"}`}>
                    {statusLabel[req.status]?.text || req.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <InfoItem label="رقم الهوية" value={req.national_id} />
                  <InfoItem label="رقم الجوال" value={req.phone} />
                  {req.serial_number && <InfoItem label="الرقم التسلسلي" value={req.serial_number} />}
                  {req.estimated_value && <InfoItem label="القيمة التقديرية" value={`${req.estimated_value} ر.س`} />}
                  {req.repair_location && <InfoItem label="مكان التصليح" value={req.repair_location === "agency" ? "الوكالة" : "ورشة"} />}
                  {req.passenger_count && <InfoItem label="عدد الركاب" value={req.passenger_count} />}
                  {req.vehicle_usage && <InfoItem label="غرض الاستخدام" value={req.vehicle_usage === "personal" ? "شخصي" : req.vehicle_usage === "commercial" ? "تجاري" : req.vehicle_usage} />}
                  {req.policy_start_date && <InfoItem label="بداية الوثيقة" value={req.policy_start_date} />}
                  {req.birth_date && <InfoItem label="تاريخ الميلاد" value={req.birth_date} />}
                  <InfoItem label="تاريخ الطلب" value={formatDate(req.created_at)} />
                  {req.notes && <div className="col-span-2"><InfoItem label="ملاحظات" value={req.notes} /></div>}
                </div>
                {req.status === "pending" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <button onClick={() => onApprove(req.id)} disabled={loadingAction !== null} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50">
                      ✓ موافقة
                    </button>
                    <button onClick={() => onReject(req.id)} disabled={loadingAction !== null} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold transition-all disabled:opacity-50">
                      ✗ رفض
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* No data */}
      {!visitorName && !visitorPhone && !visitorNationalId && linkedRequests.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">لا توجد بيانات مقدمة من الزائر</p>
      )}
    </div>
  );
};

export default TabIdentity;
