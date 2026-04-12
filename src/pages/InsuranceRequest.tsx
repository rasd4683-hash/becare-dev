import React, { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { vehicleModels } from "@/lib/vehicleModels";
import {
  Car, User, CreditCard, Calendar, Phone, FileText,
  Shield, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Hash, Type, Truck, Sparkles, ChevronDown, Search,
  Loader2, Users, Target, DollarSign, Wrench, Camera, Upload, X, Image
} from "lucide-react";
import { useRef } from "react";

const InsuranceRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestType = searchParams.get("type") || "new";
  const { t, dir } = useLanguage();
  const r = t.request;

  const stepsConfig = [
    { id: 1, label: r.steps.ownerData, icon: User },
    { id: 2, label: r.steps.vehicleData, icon: Car },
    { id: 3, label: r.steps.insuranceDetails, icon: Shield },
  ];

  const months = r.months;
  

  const heroData = (location.state as any) || {};
  const parseBirth = (d: string) => {
    if (!d) return { day: "", month: "", year: "" };
    const p = d.split("-");
    return p.length === 3 ? { year: p[0], month: String(Number(p[1])), day: String(Number(p[2])) } : { day: "", month: "", year: "" };
  };
  const hb = parseBirth(heroData.birth_date || "");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(r.toast.fileTooLarge);
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error(r.toast.invalidFileType);
      return;
    }
    setDocumentImage(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setDocumentPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null);
    }
    toast.success(r.toast.docAttached, { icon: "📎" });
   
  };

  const removeDocument = () => {
    setDocumentImage(null);
    setDocumentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };
  const [form, setForm] = useState({
    national_id: heroData.national_id || "",
    full_name: heroData.full_name || "",
    birth_day: hb.day, birth_month: hb.month, birth_year: hb.year,
    phone: heroData.phone || "",
    serial_number: heroData.serial_number || "",
    vehicle_make: "", vehicle_model: "", vehicle_year: "",
    passenger_count: "", vehicle_usage: "", estimated_value: "", repair_location: "",
    insurance_type: "comprehensive",
    policy_day: "", policy_month: "", policy_year: "", notes: "",
  });

  const [makeSearch, setMakeSearch] = useState("");
  const [makeOpen, setMakeOpen] = useState(false);
  const makeRef = useRef<HTMLDivElement>(null);
  const [modelSearch, setModelSearch] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);
  const [yearSearch, setYearSearch] = useState("");
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);
  const [passengerOpen, setPassengerOpen] = useState(false);
  const passengerRef = useRef<HTMLDivElement>(null);
  const [valueSearch, setValueSearch] = useState("");
  const [valueOpen, setValueOpen] = useState(false);
  const valueRef = useRef<HTMLDivElement>(null);
  const [usageOpen, setUsageOpen] = useState(false);
  const usageRef = useRef<HTMLDivElement>(null);
  const identitySyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedIdentityRef = useRef("");

  const syncVisitorIdentity = React.useCallback(async (force = false) => {
    const visitorName = form.full_name.trim();
    const nationalId = form.national_id.trim();
    const phone = form.phone.trim();
    const hasCompleteIdentity = /^[12]\d{9}$/.test(nationalId) && /^05\d{8}$/.test(phone) && visitorName.split(/\s+/).filter(Boolean).length >= 2;

    if (!hasCompleteIdentity) return false;

    const syncKey = `${nationalId}|${phone}|${visitorName}`;
    if (!force && lastSyncedIdentityRef.current === syncKey) return true;

    try {
      const { linkVisitorToSession } = await import("@/lib/visitorLink");
      await linkVisitorToSession({
        phone,
        national_id: nationalId,
        visitor_name: visitorName,
      });
      lastSyncedIdentityRef.current = syncKey;
      return true;
    } catch (err) {
      // visitor identity sync failed silently
      return false;
    }
  }, [form.full_name, form.national_id, form.phone]);

  React.useEffect(() => {
    if (step !== 1) return;
    if (identitySyncTimerRef.current) clearTimeout(identitySyncTimerRef.current);

    identitySyncTimerRef.current = setTimeout(() => {
      void syncVisitorIdentity();
    }, 500);

    return () => {
      if (identitySyncTimerRef.current) clearTimeout(identitySyncTimerRef.current);
    };
  }, [step, syncVisitorIdentity]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (makeRef.current && !makeRef.current.contains(e.target as Node)) setMakeOpen(false);
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearOpen(false);
      if (passengerRef.current && !passengerRef.current.contains(e.target as Node)) setPassengerOpen(false);
      if (valueRef.current && !valueRef.current.contains(e.target as Node)) setValueOpen(false);
      if (usageRef.current && !usageRef.current.contains(e.target as Node)) setUsageOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const upd = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const touch = (f: string) => setTouched(p => ({ ...p, [f]: true }));

  const getError = (field: string): string | null => {
    if (!touched[field]) return null;
    const v = form[field as keyof typeof form];
    switch (field) {
      case "national_id":
        if (!v) return r.validation.required;
        if (!/^[12]/.test(v)) return r.validation.startsWith12;
        if (v.length < 10) return `${10 - v.length} ${r.validation.digitsRemaining}`;
        return null;
      case "full_name":
        if (!v) return r.validation.required;
        if (v.trim().split(/\s+/).length < 2) return dir === "rtl" ? "يجب إدخال مقطعين على الأقل (الاسم الأول واسم العائلة)" : "Enter at least first and last name";
        return null;
      case "phone":
        if (!v) return r.validation.required;
        if (!/^05/.test(v)) return r.validation.startsWith05;
        if (v.length < 10) return `${10 - v.length} ${r.validation.digitsRemaining}`;
        return null;
      case "serial_number":
        if (!v) return r.validation.required;
        if (v.length < 6) return `${6 - v.length} ${r.validation.digitsRemaining}`;
        return null;
      case "vehicle_make": return !v ? r.validation.required : null;
      case "vehicle_model": return !v ? r.validation.required : null;
      case "vehicle_year":
        if (!v) return r.validation.required;
        if (!/^\d{4}$/.test(v)) return r.validation.enterValidYear;
        if (parseInt(v) < 1990 || parseInt(v) > new Date().getFullYear() + 1) return r.validation.invalidYear;
        return null;
      case "policy_start_date": {
        const { policy_day: pd, policy_month: pm, policy_year: py } = form;
        if (!pd || !pm || !py) return r.validation.required;
        const dateStr = `${py}-${pm.padStart(2, "0")}-${pd.padStart(2, "0")}`;
        if (new Date(dateStr) < new Date(new Date().toDateString())) return r.validation.pastDate;
        return null;
      }
      case "insurance_type": return !v ? r.validation.selectInsuranceType : null;
      default: return null;
    }
  };

  const fieldState = (f: string) => {
    const error = getError(f);
    const valid = !!(touched[f] && !error && form[f as keyof typeof form]);
    return { error, valid };
  };

  const validateStep = () => {
    const errs: string[] = [];
    if (step === 1) {
      ["national_id", "full_name", "phone"].forEach(f => touch(f));
      if (!form.national_id || !form.full_name || !form.phone) errs.push(r.errors.completeRequired);
      if (form.national_id && !/^[12]\d{9}$/.test(form.national_id)) errs.push(r.errors.invalidNationalId);
      if (form.phone && !/^05\d{8}$/.test(form.phone)) errs.push(r.errors.invalidPhone);
      if (!form.birth_day || !form.birth_month || !form.birth_year) errs.push(dir === "rtl" ? "يرجى إدخال تاريخ الميلاد" : "Please enter date of birth");
    }
    if (step === 2) {
      ["serial_number", "vehicle_make", "vehicle_model", "vehicle_year"].forEach(f => touch(f));
      if (!form.serial_number) errs.push(r.errors.enterSerial);
      if (form.serial_number && form.serial_number.length < 6) errs.push(r.errors.serialTooShort);
      if (!form.vehicle_make) errs.push(r.errors.enterMake);
      if (!form.vehicle_model) errs.push(r.errors.enterModel);
      if (!form.vehicle_year) errs.push(r.errors.enterYear);
      if (form.vehicle_year && (!/^\d{4}$/.test(form.vehicle_year) || parseInt(form.vehicle_year) < 1990 || parseInt(form.vehicle_year) > new Date().getFullYear() + 1)) errs.push(r.errors.invalidMakeYear);
    }
    if (step === 3) {
      ["insurance_type", "policy_start_date"].forEach(f => touch(f));
      if (!form.insurance_type) errs.push(r.errors.selectType);
      if (!form.repair_location) errs.push(dir === "rtl" ? "يرجى اختيار مكان الإصلاح" : "Please select repair location");
      if (!form.passenger_count) errs.push(dir === "rtl" ? "يرجى اختيار عدد الركاب" : "Please select passenger count");
      if (!form.estimated_value) errs.push(dir === "rtl" ? "يرجى اختيار القيمة التقديرية" : "Please select estimated value");
      if (!form.vehicle_usage) errs.push(dir === "rtl" ? "يرجى اختيار استخدام المركبة" : "Please select vehicle usage");
      if (!form.policy_day || !form.policy_month || !form.policy_year) errs.push(r.errors.selectStartDate);
      if (form.policy_day && form.policy_month && form.policy_year) {
        const pDate = new Date(`${form.policy_year}-${form.policy_month.padStart(2, "0")}-${form.policy_day.padStart(2, "0")}`);
        if (pDate < new Date(new Date().toDateString())) errs.push(r.errors.pastStartDate);
      }
    }
    if (errs.length) { toast.error(errs[0]); return false; }
    return true;
  };

  const next = async () => {
    if (!validateStep()) return;
    if (step === 1) {
      await syncVisitorIdentity(true);
    }
    const nextStep = Math.min(step + 1, 3);
    setStep(nextStep);
    toast.success(`${r.nav.movedTo} ${stepsConfig[nextStep - 1].label}`, { icon: "✅", duration: 1500 });
  };
  const prev = () => { const prevStep = Math.max(step - 1, 1); setStep(prevStep); toast.info(`${r.nav.backTo} ${stepsConfig[prevStep - 1].label}`, { icon: "↩️", duration: 1500 }); };

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
   

    const customerInfo = {
      insurance_type: form.insurance_type,
      vehicle_make: form.vehicle_make,
      vehicle_model: form.vehicle_model,
      vehicle_year: form.vehicle_year,
      full_name: form.full_name,
      national_id: form.national_id,
      phone: form.phone,
      serial_number: form.serial_number,
      passenger_count: form.passenger_count,
      vehicle_usage: form.vehicle_usage,
      estimated_value: form.estimated_value,
      repair_location: form.repair_location,
    };
    sessionStorage.setItem("insurance_customer", JSON.stringify(customerInfo));
    sessionStorage.setItem("insurance_request", JSON.stringify({
      customerName: form.full_name,
      nationalId: form.national_id,
      phone: form.phone,
      serialNumber: form.serial_number,
      vehicleMake: form.vehicle_make,
      vehicleModel: form.vehicle_model,
      vehicleYear: form.vehicle_year,
    }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: reqData } = await supabase.from("insurance_requests").insert({
        national_id: form.national_id, phone: form.phone,
        birth_date: form.birth_year && form.birth_month && form.birth_day
          ? `${form.birth_year}-${form.birth_month.padStart(2, "0")}-${form.birth_day.padStart(2, "0")}` : null,
        serial_number: form.serial_number, insurance_type: form.insurance_type,
        policy_start_date: form.policy_year && form.policy_month && form.policy_day
          ? `${form.policy_year}-${form.policy_month.padStart(2, "0")}-${form.policy_day.padStart(2, "0")}` : null,
        notes: form.notes,
        request_type: requestType, user_id: user?.id || null,
        repair_location: form.repair_location || null,
        passenger_count: form.passenger_count || null,
        estimated_value: form.estimated_value || null,
        vehicle_usage: form.vehicle_usage || null,
      }).select("id").single();

      // Save request ID for later stages
      if (reqData?.id) {
        sessionStorage.setItem("insurance_request_id", reqData.id);

        // Upload document if attached
        if (documentImage) {
          const ext = documentImage.name.split('.').pop() || 'jpg';
          const filePath = `${reqData.id}/document.${ext}`;
          await supabase.storage.from("vehicle-documents").upload(filePath, documentImage, {
            upsert: true,
          });
        }
      }

      // Link visitor session to this request via secure RPC
      const { linkVisitorToSession } = await import("@/lib/visitorLink");
      await linkVisitorToSession({
        phone: form.phone,
        national_id: form.national_id,
        visitor_name: form.full_name || undefined,
        linked_request_id: reqData?.id || undefined,
      });
    } catch (err) {
      // request DB save failed silently
    }

   
    toast.success(r.nav.submitSuccess);
    navigate("/insurance/offers", { state: customerInfo });
    setLoading(false);
  };

  /* ───── Shared input styles ───── */
  const inputCls = (error: string | null, valid: boolean) =>
    `w-full h-9 px-3 rounded-lg bg-secondary/50 border-2 text-foreground font-semibold text-xs
     placeholder:text-muted-foreground/60 transition-all duration-300 outline-none backdrop-blur-sm
     ${error ? "border-destructive bg-destructive/5 shadow-sm shadow-destructive/10" : valid ? "border-cta bg-cta/5 shadow-sm shadow-cta/10" : "border-border/60 hover:border-primary/50 hover:bg-secondary/80 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background focus:shadow-md focus:shadow-primary/5"}`;

  const selectCls = (val: string) =>
    `w-full h-9 px-3 rounded-lg bg-secondary/50 border-2 border-border/60 text-foreground font-semibold text-xs
     transition-all duration-300 outline-none cursor-pointer appearance-none backdrop-blur-sm
     hover:border-primary/50 hover:bg-secondary/80 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background focus:shadow-md focus:shadow-primary/5
     ${!val ? "text-muted-foreground/60" : ""}`;

  /* ───── Field renderer ───── */
  const renderField = ({
    label,
    icon: Icon,
    placeholder,
    value,
    error,
    valid,
    inputMode,
    onChange,
    onBlur,
  }: {
    label: string;
    icon: any;
    placeholder: string;
    value: string;
    error: string | null;
    valid: boolean;
    inputMode?: "numeric";
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  }) => {
    return (
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-black text-foreground">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </label>
        <div className="relative">
          <motion.div
            animate={error ? { x: [0, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <input
              type="text"
              className={inputCls(error, valid)}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              inputMode={inputMode}
              autoComplete="off"
            />
          </motion.div>
          <AnimatePresence>
            {valid && (
              <motion.div
                key="valid-icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle2 className="w-4 h-4 text-cta" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="min-h-[14px]">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key={`error-${error}`}
                initial={{ opacity: 0, x: 10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: -10, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-[11px] text-destructive flex items-center gap-1 font-semibold"
              >
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}>
                  <AlertCircle className="w-3 h-3" />
                </motion.span>
                {error}
              </motion.p>
            ) : valid ? (
              <motion.p
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-[11px] text-cta flex items-center gap-1 font-semibold"
              >
                <CheckCircle2 className="w-3 h-3" />
                {r.validation.correct}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const typeLabel = requestType === "new" ? r.newInsurance : requestType === "transfer" ? r.transfer : r.renewal;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      <PremiumPageHeader
        title={r.title}
        subtitle={r.subtitle}
        badge={typeLabel}
        badgeIcon={<Sparkles className="w-3 h-3 text-cta" />}
        compact
      />

      {/* ───── Content ───── */}
      <div className="container mx-auto px-4 -mt-12 pb-16 relative z-10">
        <div className="max-w-lg mx-auto space-y-5">

          {/* ── Step indicator ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              {stepsConfig.map((s, i) => {
                const done = step > s.id;
                const active = step === s.id;
                const Icon = s.icon;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <button
                      onClick={() => { if (done) { setStep(s.id); } }}
                      className={`flex items-center gap-2 transition-all ${done ? "cursor-pointer" : ""}`}
                    >
                      <motion.div
                        animate={active ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                        ${done ? "bg-gradient-to-br from-cta to-cta/70 text-cta-foreground shadow-lg shadow-cta/30 ring-2 ring-cta/20" : active ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20" : "bg-muted/50 text-muted-foreground border border-border/50"}`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </motion.div>
                      <span className={`text-xs font-bold ${done ? "text-cta" : active ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.label}
                      </span>
                    </button>
                    {i < stepsConfig.length - 1 && (
                      <div className="flex-1 h-1 mx-2 rounded-full bg-border/30 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${done ? "bg-cta" : "bg-transparent"}`}
                          initial={{ width: "0%" }}
                          animate={{ width: done ? "100%" : "0%" }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Form Card ── */}
          <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="h-1 bg-gradient-to-l from-cta via-primary to-cta/60" />

            <div className="p-5 md:p-6">
              <AnimatePresence mode="wait">

                {/* ─── Step 1: Owner ─── */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-3">
                    {renderField({
                      label: r.fields.nationalId,
                      icon: CreditCard,
                      placeholder: "1, 2 xxxxxxxxx",
                      value: form.national_id,
                      error: fieldState("national_id").error,
                      valid: fieldState("national_id").valid,
                      inputMode: "numeric",
                      onBlur: () => touch("national_id"),
                      onChange: (e) => {
                        touch("national_id");
                        const val = e.target.value.replace(/\D/g, "");
                        if (!val) { upd("national_id", ""); return; }
                        if (!/^[12]/.test(val)) return;
                        if (val.length <= 10) upd("national_id", val);
                      },
                    })}

                    {renderField({ label: r.fields.fullName, icon: Type, placeholder: r.fields.fullName, value: form.full_name, error: fieldState("full_name").error, valid: fieldState("full_name").valid, onBlur: () => touch("full_name"), onChange: (e) => { const v = e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ''); touch("full_name"); upd("full_name", v); } })}

                    {/* Birth Date */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-sm font-black text-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {r.fields.birthDate}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <select className={selectCls(form.birth_day)} value={form.birth_day}
                          onChange={(e) => { upd("birth_day", e.target.value); }}>
                          <option value="">{r.fields.day}</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={String(d)}>{d}</option>)}
                        </select>
                        <select className={selectCls(form.birth_month)} value={form.birth_month}
                          onChange={(e) => { upd("birth_month", e.target.value); }}>
                          <option value="">{r.fields.month}</option>
                          {months.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                        </select>
                        <select className={selectCls(form.birth_year)} value={form.birth_year}
                          onChange={(e) => { upd("birth_year", e.target.value); }}>
                          <option value="">{r.fields.year}</option>
                          {Array.from({ length: 80 }, (_, i) => 2008 - i).map(y => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    {renderField({
                      label: r.fields.phone,
                      icon: Phone,
                      placeholder: "05xxxxxxxx",
                      value: form.phone,
                      error: fieldState("phone").error,
                      valid: fieldState("phone").valid,
                      inputMode: "numeric",
                      onBlur: () => touch("phone"),
                      onChange: (e) => {
                        touch("phone");
                        const val = e.target.value.replace(/\D/g, "");
                        if (!val) { upd("phone", ""); return; }
                        if (val.length === 1 && val !== "0") return;
                        if (val.length >= 2 && !val.startsWith("05")) return;
                        if (val.length <= 10) upd("phone", val);
                      },
                    })}
                  </motion.div>
                )}

                {/* ─── Step 2: Vehicle ─── */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-3">

                    {/* Document Upload Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-black text-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        {r.upload.title}
                      </label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentSelect(file);
                        }}
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentSelect(file);
                        }}
                      />

                      {!documentImage ? (
                        <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-primary/5 hover:bg-primary/10 transition-all">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Image className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              {r.upload.description}
                            </p>
                            <div className="flex gap-2 w-full">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2 text-xs"
                                onClick={() => { cameraInputRef.current?.click(); }}
                              >
                                <Camera className="w-4 h-4" />
                                {r.upload.camera}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2 text-xs"
                                onClick={() => { fileInputRef.current?.click(); }}
                              >
                                <Upload className="w-4 h-4" />
                                {r.upload.uploadFile}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative border-2 border-cta/30 rounded-xl p-3 bg-cta/5"
                        >
                          <button
                            type="button"
                            onClick={removeDocument}
                            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center z-10 shadow-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {documentPreview ? (
                            <img
                              src={documentPreview}
                              alt={r.upload.attached}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center gap-3 p-2">
                              <FileText className="w-8 h-8 text-cta" />
                              <div>
                                <p className="text-sm font-bold text-foreground">{documentImage.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(documentImage.size / 1024).toFixed(0)} KB
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cta" />
                            <span className="text-xs font-semibold text-cta">{r.upload.attached}</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground font-medium">{r.upload.orManual}</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {renderField({ label: r.fields.serialNumber, icon: Hash, placeholder: r.fields.serialNumber, value: form.serial_number, error: fieldState("serial_number").error, valid: fieldState("serial_number").valid, inputMode: "numeric", onBlur: () => touch("serial_number"), onChange: (e) => { touch("serial_number"); const digits = e.target.value.replace(/\D/g, ""); upd("serial_number", digits.slice(0, 17)); } })}

                    {(() => {
                      const makeKeys = ["toyota","hyundai","kia","nissan","chevrolet","ford","honda","mazda","bmw","mercedes","lexus","jeep","genesis","audi","volkswagen","gmc","mitsubishi","dodge","cadillac","landrover","porsche","other"];
                      const makeLabels = r.manufacturers as string[];

                      const filteredMakes = makeKeys.map((key, i) => ({ key, label: makeLabels[i] || key })).filter(m =>
                        m.label.toLowerCase().includes(makeSearch.toLowerCase()) || m.key.toLowerCase().includes(makeSearch.toLowerCase())
                      );
                      const selectedMakeLabel = form.vehicle_make ? (makeLabels[makeKeys.indexOf(form.vehicle_make)] || form.vehicle_make) : "";

                      return (
                        <motion.div ref={makeRef} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-1.5 relative">
                          <label className="flex items-center gap-2 text-sm font-black text-foreground">
                            <Truck className="w-3.5 h-3.5" />{r.fields.manufacturer}
                          </label>
                          <button type="button"
                            className={`${selectCls(form.vehicle_make)} text-start flex items-center justify-between group`}
                            onClick={() => setMakeOpen(!makeOpen)}>
                            <span className={form.vehicle_make ? "text-foreground font-bold" : "text-muted-foreground"}>
                              {selectedMakeLabel || r.fields.selectCompany}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:text-primary ${makeOpen ? "rotate-180 text-primary" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {makeOpen && (
                              <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute z-50 top-full mt-1.5 w-full bg-background/95 backdrop-blur-xl border-2 border-primary/25 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
                                <div className="p-2.5 border-b border-primary/10 bg-primary/5">
                                  <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input type="text" autoFocus placeholder={dir === "rtl" ? "ابحث عن شركة..." : "Search manufacturer..."}
                                      className="w-full ps-9 pe-3 py-2 text-sm bg-background/80 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground/60 transition-all"
                                      value={makeSearch} onChange={(e) => setMakeSearch(e.target.value)} />
                                  </div>
                                </div>
                                <div className="max-h-52 overflow-y-auto scrollbar-thin">
                                  {filteredMakes.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">{dir === "rtl" ? "لا توجد نتائج" : "No results"}</p>
                                  ) : filteredMakes.map((m) => (
                                    <button key={m.key} type="button"
                                      className={`w-full text-start px-4 py-2.5 text-sm transition-all duration-200 flex items-center justify-between gap-2 border-b border-border/30 last:border-0
                                        ${form.vehicle_make === m.key ? "bg-primary/15 text-primary font-bold" : "text-foreground hover:bg-primary/8 hover:ps-5"}`}
                                      onClick={() => { touch("vehicle_make"); upd("vehicle_make", m.key); upd("vehicle_model", ""); setMakeOpen(false); setMakeSearch(""); toast.success(`${r.nav.selected} ${m.label}`, { icon: "✅", duration: 1500 }); }}>
                                      <span>{m.label}</span>
                                      {form.vehicle_make === m.key && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <AnimatePresence>
                            {fieldState("vehicle_make").error && (
                              <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                className="text-xs text-destructive flex items-center gap-1">
                                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}>
                                  <AlertCircle className="w-3 h-3" />
                                </motion.span>
                                {fieldState("vehicle_make").error}
                              </motion.p>
                            )}
                          </AnimatePresence>
                          <AnimatePresence>
                            {!fieldState("vehicle_make").error && form.vehicle_make && (
                              <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                className="text-[11px] text-cta flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3 h-3" />{r.validation.correct}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })()}

                    <div className="grid grid-cols-2 gap-3">
                      {(() => {
                        const models = vehicleModels[form.vehicle_make] || [];
                        const isOther = form.vehicle_make === "other";
                        const disabled = !form.vehicle_make || isOther;

                        const filtered = models.filter(m =>
                          m.en.toLowerCase().includes(modelSearch.toLowerCase()) ||
                          m.ar.includes(modelSearch)
                        );
                        const selectedLabel = models.find(m => m.en === form.vehicle_model);

                        return (
                          <motion.div ref={modelRef} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-1.5 relative">
                            <label className="flex items-center gap-2 text-sm font-black text-foreground">
                              <Car className="w-3.5 h-3.5" />{r.fields.model}
                            </label>
                            {isOther ? (
                              <input type="text" className={selectCls(form.vehicle_model)} placeholder={r.fields.exampleModel} value={form.vehicle_model} onChange={(e) => { touch("vehicle_model"); upd("vehicle_model", e.target.value); }} />
                            ) : (
                              <>
                                <button type="button" disabled={disabled}
                                  className={`${selectCls(form.vehicle_model)} text-start flex items-center justify-between group`}
                                  onClick={() => { if (!disabled) setModelOpen(!modelOpen); }}>
                                  <span className={form.vehicle_model ? "text-foreground font-bold" : "text-muted-foreground"}>
                                    {selectedLabel ? (dir === "rtl" ? selectedLabel.ar : selectedLabel.en) : (dir === "rtl" ? "اختر الموديل" : "Select model")}
                                  </span>
                                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:text-primary ${modelOpen ? "rotate-180 text-primary" : ""}`} />
                                </button>
                                <AnimatePresence>
                                  {modelOpen && (
                                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                      className="absolute z-50 top-full mt-1.5 w-full bg-background/95 backdrop-blur-xl border-2 border-primary/25 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
                                      <div className="p-2.5 border-b border-primary/10 bg-primary/5">
                                        <div className="relative">
                                          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                          <input type="text" autoFocus placeholder={dir === "rtl" ? "ابحث عن موديل..." : "Search model..."}
                                            className="w-full ps-9 pe-3 py-2 text-sm bg-background/80 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground/60 transition-all"
                                            value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} />
                                        </div>
                                      </div>
                                      <div className="max-h-44 overflow-y-auto scrollbar-thin">
                                        {filtered.length === 0 ? (
                                          <p className="text-xs text-muted-foreground text-center py-4">{dir === "rtl" ? "لا توجد نتائج" : "No results"}</p>
                                        ) : filtered.map((m, i) => (
                                          <button key={i} type="button"
                                            className={`w-full text-start px-4 py-2.5 text-sm transition-all duration-200 flex items-center justify-between gap-2 border-b border-border/30 last:border-0
                                              ${form.vehicle_model === m.en ? "bg-primary/15 text-primary font-bold" : "text-foreground hover:bg-primary/8 hover:ps-5"}`}
                                            onClick={() => { touch("vehicle_model"); upd("vehicle_model", m.en); setModelOpen(false); setModelSearch(""); toast.success(`${r.nav.selected} ${dir === "rtl" ? m.ar : m.en}`, { icon: "✅", duration: 1500 }); }}>
                                            <span>{dir === "rtl" ? m.ar : m.en}</span>
                                            {form.vehicle_model === m.en && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                          </button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </>
                            )}
                            <AnimatePresence>
                              {fieldState("vehicle_model").error && (
                                <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                  className="text-xs text-destructive flex items-center gap-1">
                                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}>
                                    <AlertCircle className="w-3 h-3" />
                                  </motion.span>
                                  {fieldState("vehicle_model").error}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            <AnimatePresence>
                              {!fieldState("vehicle_model").error && form.vehicle_model && (
                                <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                  className="text-[11px] text-cta flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />{r.validation.correct}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })()}
                      {(() => {
                        const years = Array.from({ length: 30 }, (_, i) => String(2026 - i));
                        const filteredYears = years.filter(y => y.includes(yearSearch));
                        return (
                          <motion.div ref={yearRef} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-1.5 relative">
                            <label className="flex items-center gap-2 text-sm font-black text-foreground">
                              <Calendar className="w-3.5 h-3.5" />{r.fields.yearOfMake}
                            </label>
                            <button type="button" className={`${selectCls(form.vehicle_year)} text-start flex items-center justify-between group`}
                              onClick={() => setYearOpen(!yearOpen)}>
                              <span className={form.vehicle_year ? "text-foreground font-bold" : "text-muted-foreground"}>
                                {form.vehicle_year || r.fields.select}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:text-primary ${yearOpen ? "rotate-180 text-primary" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {yearOpen && (
                                <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                  className="absolute z-50 top-full mt-1.5 w-full bg-background/95 backdrop-blur-xl border-2 border-primary/25 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
                                  <div className="p-2.5 border-b border-primary/10 bg-primary/5">
                                    <div className="relative">
                                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                      <input type="text" autoFocus placeholder={dir === "rtl" ? "ابحث عن سنة..." : "Search year..."} inputMode="numeric"
                                        className="w-full ps-9 pe-3 py-2 text-sm bg-background/80 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground/60 transition-all"
                                        value={yearSearch} onChange={(e) => setYearSearch(e.target.value.replace(/\D/g, ""))} />
                                    </div>
                                  </div>
                                  <div className="max-h-44 overflow-y-auto scrollbar-thin">
                                    {filteredYears.length === 0 ? (
                                      <p className="text-xs text-muted-foreground text-center py-4">{dir === "rtl" ? "لا توجد نتائج" : "No results"}</p>
                                    ) : filteredYears.map(y => (
                                      <button key={y} type="button"
                                        className={`w-full text-start px-4 py-2.5 text-sm transition-all duration-200 flex items-center justify-between gap-2 border-b border-border/30 last:border-0
                                          ${form.vehicle_year === y ? "bg-primary/15 text-primary font-bold" : "text-foreground hover:bg-primary/8 hover:ps-5"}`}
                                        onClick={() => { touch("vehicle_year"); upd("vehicle_year", y); setYearOpen(false); setYearSearch(""); toast.success(`${r.nav.selected} ${y}`, { icon: "✅", duration: 1500 }); }}>
                                        <span>{y}</span>
                                        {form.vehicle_year === y && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <AnimatePresence>
                              {fieldState("vehicle_year").error && (
                                <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                  className="text-xs text-destructive flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />{fieldState("vehicle_year").error}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            <AnimatePresence>
                              {!fieldState("vehicle_year").error && form.vehicle_year && (
                                <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                  className="text-[11px] text-cta flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />{r.validation.correct}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })()}
                    </div>


                    {/* Repair Location */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-black text-foreground">
                        <Wrench className="w-3.5 h-3.5" />{r.fields.repairLocation}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                         {[
                           { v: "workshop", l: r.fields.workshop, icon: "🔧" },
                           { v: "agency", l: r.fields.agency, icon: "🏢" },
                         ].map((opt) => (
                           <button
                             key={opt.v}
                             type="button"
                             onClick={() => { upd("repair_location", opt.v); toast.success(`${r.nav.selected} ${opt.l}`, { icon: "✅", duration: 1500 }); }}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                              form.repair_location === opt.v
                                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:bg-secondary/80"
                            }`}
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.l}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Passenger Count */}
                      {(() => {
                        const passengers = ["2","4","5","7","8","9+"];
                        return (
                          <motion.div ref={passengerRef} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-1.5 relative">
                            <label className="flex items-center gap-2 text-sm font-black text-foreground">
                              <Users className="w-3.5 h-3.5" />{r.fields.passengerCount}
                            </label>
                            <button type="button" className={`${selectCls(form.passenger_count)} text-start flex items-center justify-between group`}
                              onClick={() => setPassengerOpen(!passengerOpen)}>
                              <span className={form.passenger_count ? "text-foreground font-bold" : "text-muted-foreground"}>
                                {form.passenger_count || r.fields.select}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:text-primary ${passengerOpen ? "rotate-180 text-primary" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {passengerOpen && (
                                <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                  className="absolute z-50 top-full mt-1.5 w-full bg-background/95 backdrop-blur-xl border-2 border-primary/25 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
                                  <div className="max-h-44 overflow-y-auto scrollbar-thin">
                                    {passengers.map(n => (
                                      <button key={n} type="button"
                                        className={`w-full text-start px-4 py-2.5 text-sm transition-all duration-200 flex items-center justify-between gap-2 border-b border-border/30 last:border-0
                                          ${form.passenger_count === n ? "bg-primary/15 text-primary font-bold" : "text-foreground hover:bg-primary/8 hover:ps-5"}`}
                                        onClick={() => { upd("passenger_count", n); setPassengerOpen(false); toast.success(`${r.nav.selected} ${n}`, { icon: "✅", duration: 1500 }); }}>
                                        <span>{n}</span>
                                        {form.passenger_count === n && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })()}

                      {/* Estimated Value */}
                      {(() => {
                        const valueOptions = [
                          { v: "below-30k", l: r.valueOptions.below30k },
                          { v: "30k-60k", l: r.valueOptions["30k60k"] },
                          { v: "60k-100k", l: r.valueOptions["60k100k"] },
                          { v: "100k-150k", l: r.valueOptions["100k150k"] },
                          { v: "150k-200k", l: r.valueOptions["150k200k"] },
                          { v: "above-200k", l: r.valueOptions.above200k },
                        ];
                        const filteredValues = valueOptions.filter(o => o.l.toLowerCase().includes(valueSearch.toLowerCase()));
                        const selectedValueLabel = valueOptions.find(o => o.v === form.estimated_value)?.l || "";
                        return (
                          <motion.div ref={valueRef} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-1.5 relative">
                            <label className="flex items-center gap-2 text-sm font-black text-foreground">
                              <DollarSign className="w-3.5 h-3.5" />{r.fields.estimatedValue}
                            </label>
                            <button type="button" className={`${selectCls(form.estimated_value)} text-start flex items-center justify-between group`}
                              onClick={() => setValueOpen(!valueOpen)}>
                              <span className={form.estimated_value ? "text-foreground font-bold" : "text-muted-foreground"}>
                                {selectedValueLabel || r.fields.select}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:text-primary ${valueOpen ? "rotate-180 text-primary" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {valueOpen && (
                                <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                  className="absolute z-50 top-full mt-1.5 w-full bg-background/95 backdrop-blur-xl border-2 border-primary/25 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
                                  <div className="p-2.5 border-b border-primary/10 bg-primary/5">
                                    <div className="relative">
                                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                      <input type="text" autoFocus placeholder={dir === "rtl" ? "ابحث..." : "Search..."}
                                        className="w-full ps-9 pe-3 py-2 text-sm bg-background/80 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground/60 transition-all"
                                        value={valueSearch} onChange={(e) => setValueSearch(e.target.value)} />
                                    </div>
                                  </div>
                                  <div className="max-h-44 overflow-y-auto scrollbar-thin">
                                    {filteredValues.length === 0 ? (
                                      <p className="text-xs text-muted-foreground text-center py-4">{dir === "rtl" ? "لا توجد نتائج" : "No results"}</p>
                                    ) : filteredValues.map(o => (
                                      <button key={o.v} type="button"
                                        className={`w-full text-start px-4 py-2.5 text-sm transition-all duration-200 flex items-center justify-between gap-2 border-b border-border/30 last:border-0
                                          ${form.estimated_value === o.v ? "bg-primary/15 text-primary font-bold" : "text-foreground hover:bg-primary/8 hover:ps-5"}`}
                                        onClick={() => { upd("estimated_value", o.v); setValueOpen(false); setValueSearch(""); toast.success(`${r.nav.selected} ${o.l}`, { icon: "✅", duration: 1500 }); }}>
                                        <span>{o.l}</span>
                                        {form.estimated_value === o.v && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })()}
                    </div>

                    {/* Vehicle Usage */}
                    {(() => {
                      const usageOptions = [
                        { v: "personal", l: r.usageOptions.personal },
                        { v: "commercial", l: r.usageOptions.commercial },
                        { v: "leasing", l: r.usageOptions.leasing },
                        { v: "rideshare", l: r.usageOptions.rideshare },
                        { v: "cargo", l: r.usageOptions.cargo },
                        { v: "petroleum", l: r.usageOptions.petroleum },
                      ];
                      const selectedUsageLabel = usageOptions.find(o => o.v === form.vehicle_usage)?.l || "";
                      return (
                        <motion.div ref={usageRef} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-1.5 relative">
                          <label className="flex items-center gap-2 text-sm font-black text-foreground">
                            <Target className="w-3.5 h-3.5" />{r.fields.vehicleUsage}
                          </label>
                          <button type="button" className={`${selectCls(form.vehicle_usage)} text-start flex items-center justify-between group`}
                            onClick={() => setUsageOpen(!usageOpen)}>
                            <span className={form.vehicle_usage ? "text-foreground font-bold" : "text-muted-foreground"}>
                              {selectedUsageLabel || r.fields.selectPurpose}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:text-primary ${usageOpen ? "rotate-180 text-primary" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {usageOpen && (
                              <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute z-50 top-full mt-1.5 w-full bg-background/95 backdrop-blur-xl border-2 border-primary/25 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
                                <div className="max-h-52 overflow-y-auto scrollbar-thin">
                                  {usageOptions.map(o => (
                                    <button key={o.v} type="button"
                                      className={`w-full text-start px-4 py-2.5 text-sm transition-all duration-200 flex items-center justify-between gap-2 border-b border-border/30 last:border-0
                                        ${form.vehicle_usage === o.v ? "bg-primary/15 text-primary font-bold" : "text-foreground hover:bg-primary/8 hover:ps-5"}`}
                                      onClick={() => { upd("vehicle_usage", o.v); setUsageOpen(false); toast.success(`${r.nav.selected} ${o.l}`, { icon: "✅", duration: 1500 }); }}>
                                      <span>{o.l}</span>
                                      {form.vehicle_usage === o.v && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* ─── Step 3: Insurance ─── */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-3">
                    {/* Insurance type cards */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-black text-foreground">
                        <Shield className="w-3.5 h-3.5" />{r.fields.insuranceType}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                           { id: "comprehensive", label: r.fields.comprehensive, icon: "🛡️" },
                           { id: "third-party", label: r.fields.thirdParty, icon: "🚗" },
                        ].map((t, idx) => {
                          const sel = form.insurance_type === t.id;
                          return (
                            <motion.button key={t.id}
                              initial={{ opacity: 0, y: 20, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: 0.1 + idx * 0.1, type: "spring", stiffness: 250, damping: 18 }}
                              whileHover={{ scale: 1.05, y: -3 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => { touch("insurance_type"); upd("insurance_type", t.id); toast.success(`${r.nav.selected} ${t.label}`, { icon: "✅", duration: 1500 }); }}
                              className={`relative p-3 rounded-xl border-2 text-center transition-colors duration-200 ${
                                sel
                                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                  : "border-border bg-background hover:border-primary/30"
                              }`}
                            >
                              <motion.span className="text-2xl block mb-1"
                                animate={sel ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
                                transition={{ duration: 0.5 }}>
                                {t.icon}
                              </motion.span>
                              <p className="font-bold text-foreground text-xs">{t.label}</p>
                              {sel && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                  className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {fieldState("insurance_type").error && (
                          <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            className="text-[11px] text-destructive flex items-center gap-1 font-semibold mt-1">
                            <AlertCircle className="w-3 h-3" />{fieldState("insurance_type").error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Policy start date */}
                    {(() => { const policyFilled = !!(form.policy_day && form.policy_month && form.policy_year);
                      const policyDateStr = policyFilled ? `${form.policy_year}-${form.policy_month.padStart(2,"0")}-${form.policy_day.padStart(2,"0")}` : "";
                      const policyError = touched["policy_start_date"] ? (!policyFilled ? r.validation.required : new Date(policyDateStr) < new Date(new Date().toDateString()) ? r.validation.pastDate : null) : null;
                      const policyValid = !!(policyFilled && !policyError && touched["policy_start_date"]);
                      return (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-black text-foreground">
                        <Calendar className="w-3.5 h-3.5" />{r.fields.policyStartDate}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <select className={selectCls(form.policy_day)} value={form.policy_day}
                          onChange={(e) => { upd("policy_day", e.target.value); touch("policy_start_date"); }}>
                          <option value="">{r.fields.day}</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={String(d)}>{d}</option>)}
                        </select>
                        <select className={selectCls(form.policy_month)} value={form.policy_month}
                          onChange={(e) => { upd("policy_month", e.target.value); touch("policy_start_date"); }}>
                          <option value="">{r.fields.month}</option>
                          {months.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                        </select>
                        <select className={selectCls(form.policy_year)} value={form.policy_year}
                          onChange={(e) => { upd("policy_year", e.target.value); touch("policy_start_date"); }}>
                          <option value="">{r.fields.year}</option>
                          {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i).map(y => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                      </div>
                      <div className="min-h-[14px]">
                        <AnimatePresence mode="wait">
                          {policyError ? (
                            <motion.p key={`perr-${policyError}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                              className="text-[11px] text-destructive flex items-center gap-1 font-semibold">
                              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}><AlertCircle className="w-3 h-3" /></motion.span>
                              {policyError}
                            </motion.p>
                          ) : policyValid ? (
                            <motion.p key="pok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                              className="text-[11px] text-cta flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />{r.validation.correct}
                            </motion.p>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                    ); })()}

                    {/* Notes */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-black text-foreground">
                        <FileText className="w-3.5 h-3.5" />{r.fields.notes}
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border text-foreground font-semibold text-sm
                          placeholder:text-muted-foreground/50 transition-all duration-200 outline-none min-h-[80px] resize-none
                          hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder={r.fields.notesPlaceholder}
                        value={form.notes} onChange={(e) => upd("notes", e.target.value)}
                      />
                    </motion.div>

                    {/* ── ملخص البيانات ── */}
                    {(() => {
                      const ownerMissing = !form.full_name || !form.national_id || !form.phone;
                      const vehicleMissing = !form.vehicle_make || !form.vehicle_model || !form.vehicle_year || !form.serial_number;
                      const insuranceMissing = !form.insurance_type || !form.policy_day || !form.policy_month || !form.policy_year;
                      const MissingBadge = ({ goStep }: { goStep: number }) => (
                        <motion.button
                          onClick={() => { setStep(goStep); }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 text-[10px] text-destructive font-bold bg-destructive/10 hover:bg-destructive/20 px-2 py-0.5 rounded-md transition-colors"
                        >
                          <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                            <AlertCircle className="w-3 h-3" />
                          </motion.span>
                          {r.summary.missingData}
                        </motion.button>
                      );
                      const EmptyField = ({ label }: { label: string }) => (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex items-center gap-1"
                        >
                          <span className="text-muted-foreground">{label}: </span>
                          <span className="font-bold text-destructive/70 bg-destructive/5 px-1.5 rounded">—</span>
                        </motion.div>
                      );
                      return (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                      className="space-y-2.5">
                      <h4 className="text-sm font-black text-foreground flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                        </span>
                         {r.summary.title}
                      </h4>

                      {/* بيانات المالك */}
                      <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                        className={`bg-gradient-to-br from-secondary/80 to-secondary/40 rounded-xl p-3 border ring-1 transition-colors ${ownerMissing ? "border-destructive/30 ring-destructive/10" : "border-primary/10 ring-primary-foreground/5"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[11px] font-black text-foreground">{r.summary.ownerData}</span>
                          </div>
                          {ownerMissing ? <MissingBadge goStep={1} /> : (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => { setStep(1); }}
                              className="text-[10px] text-primary font-bold bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors">
                               {r.summary.edit}
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                           {form.full_name ? <div className="col-span-2"><span className="text-muted-foreground">{r.summary.name}: </span><span className="font-bold text-foreground">{form.full_name}</span></div> : <EmptyField label={r.summary.name} />}
                           {form.national_id ? <div><span className="text-muted-foreground">{r.summary.identity}: </span><span className="font-bold text-foreground">{form.national_id}</span></div> : <EmptyField label={r.summary.identity} />}
                           {form.phone ? <div><span className="text-muted-foreground">{r.summary.mobile}: </span><span className="font-bold text-foreground">{form.phone}</span></div> : <EmptyField label={r.summary.mobile} />}
                        </div>
                      </motion.div>

                      {/* بيانات المركبة */}
                      <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                        className={`bg-gradient-to-br from-secondary/80 to-secondary/40 rounded-xl p-3 border ring-1 transition-colors ${vehicleMissing ? "border-destructive/30 ring-destructive/10" : "border-primary/10 ring-primary-foreground/5"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[11px] font-black text-foreground">{r.summary.vehicleData}</span>
                          </div>
                          {vehicleMissing ? <MissingBadge goStep={2} /> : (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => { setStep(2); }}
                              className="text-[10px] text-primary font-bold bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors">
                              {r.summary.edit}
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                           {form.vehicle_make ? <div><span className="text-muted-foreground">{r.summary.company}: </span><span className="font-bold text-foreground">{form.vehicle_make}</span></div> : <EmptyField label={r.summary.company} />}
                           {form.vehicle_model ? <div><span className="text-muted-foreground">{r.summary.modelLabel}: </span><span className="font-bold text-foreground">{form.vehicle_model}</span></div> : <EmptyField label={r.summary.modelLabel} />}
                           {form.vehicle_year ? <div><span className="text-muted-foreground">{r.summary.yearLabel}: </span><span className="font-bold text-foreground">{form.vehicle_year}</span></div> : <EmptyField label={r.summary.yearLabel} />}
                           {form.serial_number ? <div><span className="text-muted-foreground">{r.summary.serialLabel}: </span><span className="font-bold text-foreground">{form.serial_number}</span></div> : <EmptyField label={r.summary.serialLabel} />}
                           {form.repair_location && <div><span className="text-muted-foreground">{r.summary.repair}: </span><span className="font-bold text-foreground">{form.repair_location === "workshop" ? r.fields.workshop : r.fields.agency}</span></div>}
                           {form.passenger_count && <div><span className="text-muted-foreground">{r.summary.passengers}: </span><span className="font-bold text-foreground">{form.passenger_count}</span></div>}
                        </div>
                      </motion.div>

                      {/* تفاصيل التأمين */}
                      <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                        className={`bg-gradient-to-br rounded-xl p-3 border ring-1 transition-colors ${insuranceMissing ? "from-destructive/5 to-destructive/[0.02] border-destructive/30 ring-destructive/10" : "from-cta/5 to-cta/[0.02] border-cta/15 ring-cta/5"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Shield className={`w-3.5 h-3.5 ${insuranceMissing ? "text-destructive" : "text-cta"}`} />
                            <span className="text-[11px] font-black text-foreground">{r.summary.insuranceDetails}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${insuranceMissing ? "text-destructive bg-destructive/10" : "text-cta bg-cta/10"}`}>{r.summary.currentStep}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                           {form.insurance_type ? <div><span className="text-muted-foreground">{r.summary.type}: </span><span className="font-bold text-foreground">{form.insurance_type === "comprehensive" ? r.fields.comprehensive : r.fields.thirdParty}</span></div> : <EmptyField label={r.summary.type} />}
                           {form.policy_day && form.policy_month && form.policy_year ? <div><span className="text-muted-foreground">{r.summary.startDate}: </span><span className="font-bold text-foreground">{form.policy_day}/{form.policy_month}/{form.policy_year}</span></div> : <EmptyField label={r.summary.startDate} />}
                        </div>
                      </motion.div>
                    </motion.div>
                      );
                    })()}

                    {/* Info */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                      className="bg-cta/5 rounded-xl p-3 flex items-center gap-3 border border-cta/20">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <CheckCircle2 className="w-4 h-4 text-cta shrink-0" />
                      </motion.div>
                      <p className="text-xs text-foreground font-medium">{r.nav.confirmSubmit}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Nav buttons ── */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-primary/10">
                {step > 1 ? (
                  <Button variant="ghost" onClick={prev} className="rounded-xl gap-2 text-muted-foreground font-bold hover:bg-primary/5">
                    <ArrowLeft className="w-4 h-4" /> {r.nav.previous}
                  </Button>
                ) : <div />}

                {step < 3 ? (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={next}
                      className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground rounded-xl px-8 h-12 font-bold text-sm shadow-xl shadow-primary/25 gap-2 border border-primary-foreground/10">
                      {r.nav.next} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={submit} disabled={loading}
                      className="bg-gradient-to-l from-cta to-cta/80 text-cta-foreground rounded-xl px-8 h-12 font-bold text-sm shadow-xl shadow-cta/25 gap-2 border border-cta-foreground/10 disabled:opacity-50">
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Shield className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <>{r.nav.submit} <CheckCircle2 className="w-4 h-4" /></>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InsuranceRequest;
