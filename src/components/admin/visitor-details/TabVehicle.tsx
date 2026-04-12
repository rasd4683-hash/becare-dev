import React from "react";
import { Car, Shield } from "lucide-react";
import { InfoItem } from "./InfoItem";
import CollapsibleCard from "./CollapsibleCard";
import type { InsuranceOrder } from "./types";
import { formatDate } from "./types";

interface Props {
  linkedOrders: InsuranceOrder[];
}

const TabVehicle: React.FC<Props> = ({ linkedOrders }) => {
  if (linkedOrders.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-6">لا توجد بيانات مركبة</p>;
  }

  return (
    <div className="space-y-4">
      {linkedOrders.map(order => (
        <div key={order.id} className="space-y-3">
          {/* Vehicle Info */}
          <CollapsibleCard
            title="معلومات المركبة"
            icon={<Car className="w-3 h-3" />}
            borderColor="border-border/50"
            bgColor="bg-muted/10"
            headerBg="bg-muted/30"
            headerBorder="border-border/30"
            textColor="text-muted-foreground"
            defaultOpen
          >
            <div className="px-3 py-2.5 grid grid-cols-2 gap-2">
              {(order.vehicle_make || order.vehicle_model || order.vehicle_year || order.serial_number || order.passenger_count || order.vehicle_usage || order.estimated_value || order.repair_location) ? (
                <>
                  {order.vehicle_make && <InfoItem label="الشركة المصنعة" value={order.vehicle_make} />}
                  {order.vehicle_model && <InfoItem label="الموديل" value={order.vehicle_model} />}
                  {order.vehicle_year && <InfoItem label="سنة الصنع" value={order.vehicle_year} />}
                  {order.serial_number && <InfoItem label="الرقم التسلسلي" value={order.serial_number} />}
                  {order.passenger_count && <InfoItem label="عدد الركاب" value={order.passenger_count} />}
                  {order.vehicle_usage && <InfoItem label="غرض الاستخدام" value={order.vehicle_usage === "personal" ? "شخصي" : order.vehicle_usage === "commercial" ? "تجاري" : order.vehicle_usage} />}
                  {order.estimated_value && <InfoItem label="القيمة التقديرية" value={`${order.estimated_value} ر.س`} />}
                  {order.repair_location && <InfoItem label="مكان التصليح" value={order.repair_location === "agency" ? "الوكالة" : "ورشة"} />}
                </>
              ) : (
                <p className="col-span-2 text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>
              )}
            </div>
          </CollapsibleCard>

          {/* Insurance & Pricing */}
          <CollapsibleCard
            title="التأمين والأسعار"
            icon={<Shield className="w-3 h-3" />}
            borderColor="border-border/50"
            bgColor="bg-muted/10"
            headerBg="bg-muted/30"
            headerBorder="border-border/30"
            textColor="text-muted-foreground"
            defaultOpen
          >
            <div className="px-3 py-2.5 grid grid-cols-2 gap-2">
              {(order.base_price != null || order.total_price != null || order.policy_number || order.draft_policy_number || (order.add_ons && Array.isArray(order.add_ons) && (order.add_ons as any[]).length > 0)) ? (
                <>
                  {order.base_price != null && <InfoItem label="السعر الأساسي" value={`${order.base_price} ر.س`} />}
                  {order.total_price != null && <InfoItem label="السعر الإجمالي" value={`${order.total_price} ر.س`} />}
                  {order.policy_number && <InfoItem label="رقم الوثيقة" value={order.policy_number} />}
                  {order.draft_policy_number && <InfoItem label="رقم الوثيقة المبدئي" value={order.draft_policy_number} />}
                  {order.add_ons && Array.isArray(order.add_ons) && (order.add_ons as any[]).length > 0 && (
                    <div className="col-span-2"><InfoItem label="الإضافات" value={(order.add_ons as any[]).map((a: any) => typeof a === 'string' ? a : a.name || JSON.stringify(a)).join("، ")} /></div>
                  )}
                </>
              ) : (
                <p className="col-span-2 text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>
              )}
            </div>
          </CollapsibleCard>

          {/* Order Date */}
          <div className="bg-muted/10 rounded-lg px-3 py-2">
            <InfoItem label="تاريخ الطلب" value={formatDate(order.created_at)} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TabVehicle;
