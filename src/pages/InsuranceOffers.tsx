import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { companyLogos } from "@/lib/companyLogos";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import { useLanguage } from "@/i18n/LanguageContext";

import { Button } from "@/components/ui/button";
import {
  Shield, Star, Check, ChevronDown, ChevronUp, X,
  Car, ArrowUpDown, SlidersHorizontal, Plus, Minus,
  Search, Building2, FileCheck, Sparkles
} from "lucide-react";

interface AddOn {
  id: string;
  label: string;
  price: number;
  description: string;
}

interface Offer {
  id: string;
  company: string;
  companyEn: string;
  logoInitials: string;
  logoColor: string;
  logoBg: string;
  type: string;
  typeLabel: string;
  price: number;
  originalPrice: number;
  monthlyPrice: number;
  rating: number;
  reviewCount: number;
  features: { label: string; included: boolean }[];
  highlights: string[];
  addOns: AddOn[];
  popular?: boolean;
  bestValue?: boolean;
  cheapest?: boolean;
}

// أسعار السوق السعودي الحقيقية مع خصم 25 ر.س لكل إضافة
const comprehensiveAddOns: AddOn[] = [
  { id: "roadside", label: "مساعدة على الطريق متقدمة", price: 175, description: "سحب + بنشر + بطارية 24/7" },
  { id: "agency-repair", label: "إصلاح في الوكالة", price: 475, description: "إصلاح لدى الوكيل المعتمد" },
  { id: "replacement-car", label: "سيارة بديلة إضافية", price: 275, description: "تمديد مدة السيارة البديلة 30 يوم" },
  { id: "windshield", label: "تغطية الزجاج الأمامي", price: 125, description: "استبدال بدون تحمل" },
  { id: "personal-accident", label: "حوادث شخصية للسائق", price: 225, description: "تغطية حتى 100,000 ر.س" },
  { id: "geo-extension", label: "تغطية جغرافية (دول الخليج)", price: 325, description: "توسيع التغطية لدول GCC" },
  { id: "depreciation", label: "حماية من الاستهلاك", price: 375, description: "تعويض بدون خصم استهلاك" },
  { id: "natural-disaster", label: "كوارث طبيعية موسعة", price: 100, description: "فيضانات + عواصف رملية" },
];

const thirdPartyAddOns: AddOn[] = [
  { id: "roadside-tp", label: "مساعدة على الطريق", price: 75, description: "سحب + بنشر 24/7" },
  { id: "personal-accident-tp", label: "حوادث شخصية", price: 125, description: "تغطية حتى 50,000 ر.س" },
  { id: "fire-theft", label: "حريق وسرقة", price: 225, description: "تغطية ضد الحريق والسرقة" },
  { id: "natural-tp", label: "كوارث طبيعية", price: 75, description: "فيضانات + عواصف" },
  { id: "driver-cover", label: "تغطية السائق", price: 175, description: "إصابات السائق الشخصية" },
];

const getAddOns = (type: string, companyId: string): AddOn[] => {
  const base = type === "comprehensive" ? comprehensiveAddOns : thirdPartyAddOns;
  // Vary prices slightly per company for realism
  const seed = companyId.charCodeAt(0) + companyId.charCodeAt(1);
  return base.map(a => ({
    ...a,
    price: Math.round(a.price * (0.85 + (seed % 30) / 100)),
  }));
};

const mockOffers: Offer[] = [
  // === شامل (Comprehensive) - أسعار حقيقية من السوق السعودي (مخصومة 100 ر.س) ===
  {
    id: "1", company: "التعاونية", companyEn: "Tawuniya", logoInitials: "تع", logoColor: "#fff", logoBg: "#00539B",
    type: "comprehensive", typeLabel: "شامل", price: 3050, originalPrice: 3800, monthlyPrice: 254,
    rating: 4.8, reviewCount: 2340,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (30 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: true }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["سيارة بديلة", "إصلاح وكالة", "زجاج مجاني"], popular: true,
    addOns: getAddOns("comprehensive", "1"),
  },
  {
    id: "2", company: "أليانز السعودية", companyEn: "Allianz Saudi (AZSA)", logoInitials: "أز", logoColor: "#fff", logoBg: "#003781",
    type: "comprehensive", typeLabel: "شامل", price: 3350, originalPrice: 4200, monthlyPrice: 279,
    rating: 4.7, reviewCount: 1850,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (45 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: true }, { label: "تغطية دولية", included: true },
    ],
    highlights: ["تغطية دولية", "سيارة بديلة 45 يوم", "تطبيق ذكي"], bestValue: true,
    addOns: getAddOns("comprehensive", "2"),
  },
  {
    id: "3", company: "الراجحي تكافل", companyEn: "Al Rajhi Takaful", logoInitials: "رج", logoColor: "#fff", logoBg: "#6D4C41",
    type: "comprehensive", typeLabel: "شامل", price: 2250, originalPrice: 3100, monthlyPrice: 188,
    rating: 4.5, reviewCount: 1620,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (15 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["متوافق مع الشريعة", "سعر تنافسي"],
    addOns: getAddOns("comprehensive", "3"),
  },
  {
    id: "4", company: "وقاية تكافل", companyEn: "Wiqaya Takaful", logoInitials: "وق", logoColor: "#fff", logoBg: "#2E7D32",
    type: "comprehensive", typeLabel: "شامل", price: 2050, originalPrice: 2900, monthlyPrice: 171,
    rating: 4.4, reviewCount: 1450,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (20 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["متوافق شرعياً", "أسعار تنافسية"],
    addOns: getAddOns("comprehensive", "4"),
  },
  {
    id: "5", company: "ميدغلف", companyEn: "MedGulf", logoInitials: "مد", logoColor: "#fff", logoBg: "#C62828",
    type: "comprehensive", typeLabel: "شامل", price: 2750, originalPrice: 3600, monthlyPrice: 229,
    rating: 4.4, reviewCount: 1430,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (20 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["أسعار منافسة", "خدمة سريعة"],
    addOns: getAddOns("comprehensive", "5"),
  },
  {
    id: "6", company: "سلامة", companyEn: "Salama Insurance", logoInitials: "سل", logoColor: "#fff", logoBg: "#F9A825",
    type: "comprehensive", typeLabel: "شامل", price: 2450, originalPrice: 3300, monthlyPrice: 204,
    rating: 4.3, reviewCount: 1120,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (15 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["تكافلي", "إصلاح وكالة"],
    addOns: getAddOns("comprehensive", "6"),
  },
  {
    id: "7", company: "الدرع العربي", companyEn: "Arabian Shield (ASCANA)", logoInitials: "دع", logoColor: "#fff", logoBg: "#1565C0",
    type: "comprehensive", typeLabel: "شامل", price: 1250, originalPrice: 1800, monthlyPrice: 104,
    rating: 4.4, reviewCount: 980,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (25 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: true }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["حماية درع", "زجاج مجاني"],
    addOns: getAddOns("comprehensive", "7"),
  },
  {
    id: "8", company: "GIG", companyEn: "Gulf Insurance Group", logoInitials: "GIG", logoColor: "#fff", logoBg: "#0D47A1",
    type: "comprehensive", typeLabel: "شامل", price: 800, originalPrice: 1200, monthlyPrice: 67,
    rating: 4.5, reviewCount: 1340,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (30 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: true }, { label: "تغطية دولية", included: true },
    ],
    highlights: ["تغطية دولية", "شبكة ورش واسعة"],
    addOns: getAddOns("comprehensive", "8"),
  },
  {
    id: "9", company: "ولاء للتأمين", companyEn: "Walaa Insurance", logoInitials: "ول", logoColor: "#fff", logoBg: "#00695C",
    type: "comprehensive", typeLabel: "شامل", price: 1650, originalPrice: 2400, monthlyPrice: 138,
    rating: 4.3, reviewCount: 870,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (20 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["ولاء مكافآت", "تجديد سهل"],
    addOns: getAddOns("comprehensive", "9"),
  },
  {
    id: "10", company: "الاتحاد التجاري", companyEn: "ACIG Insurance", logoInitials: "إت", logoColor: "#fff", logoBg: "#37474F",
    type: "comprehensive", typeLabel: "شامل", price: 1550, originalPrice: 2200, monthlyPrice: 129,
    rating: 4.2, reviewCount: 760,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (15 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["خبرة طويلة", "أسعار مناسبة"],
    addOns: getAddOns("comprehensive", "10"),
  },
  {
    id: "11", company: "ليفا للتأمين", companyEn: "Liva Insurance", logoInitials: "لف", logoColor: "#fff", logoBg: "#E65100",
    type: "comprehensive", typeLabel: "شامل", price: 2550, originalPrice: 3400, monthlyPrice: 213,
    rating: 4.5, reviewCount: 1150,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (30 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: true }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["رقمي بالكامل", "إصلاح وكالة"],
    addOns: getAddOns("comprehensive", "11"),
  },
  {
    id: "12", company: "الصقر للتأمين", companyEn: "Al Sagr Insurance", logoInitials: "صق", logoColor: "#fff", logoBg: "#4E342E",
    type: "comprehensive", typeLabel: "شامل", price: 1350, originalPrice: 2000, monthlyPrice: 113,
    rating: 4.1, reviewCount: 650,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (10 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["سعر اقتصادي"],
    addOns: getAddOns("comprehensive", "12"),
  },
  {
    id: "13", company: "المتكاملة (أسيج)", companyEn: "ASEIG Insurance", logoInitials: "أس", logoColor: "#fff", logoBg: "#1976D2",
    type: "comprehensive", typeLabel: "شامل", price: 800, originalPrice: 1300, monthlyPrice: 67,
    rating: 4.2, reviewCount: 890,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (10 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["سعر اقتصادي", "تغطية أساسية"],
    addOns: getAddOns("comprehensive", "13"),
  },
  {
    id: "14", company: "التكافل العربي", companyEn: "Arabian Takaful", logoInitials: "تك", logoColor: "#fff", logoBg: "#2E7D32",
    type: "comprehensive", typeLabel: "شامل", price: 1850, originalPrice: 2600, monthlyPrice: 154,
    rating: 4.3, reviewCount: 720,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (15 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["متوافق شرعياً", "تكافلي"],
    addOns: getAddOns("comprehensive", "14"),
  },
  {
    id: "15", company: "العربية للتأمين", companyEn: "Arabia Insurance", logoInitials: "عر", logoColor: "#fff", logoBg: "#283593",
    type: "comprehensive", typeLabel: "شامل", price: 2150, originalPrice: 3000, monthlyPrice: 179,
    rating: 4.4, reviewCount: 940,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (25 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["خدمة متميزة", "إصلاح وكالة"],
    addOns: getAddOns("comprehensive", "15"),
  },
  {
    id: "16", company: "الخليجية العامة", companyEn: "Gulf General Insurance", logoInitials: "خل", logoColor: "#fff", logoBg: "#0277BD",
    type: "comprehensive", typeLabel: "شامل", price: 1450, originalPrice: 2100, monthlyPrice: 121,
    rating: 4.2, reviewCount: 580,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (15 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: false },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["تغطية خليجية"],
    addOns: getAddOns("comprehensive", "16"),
  },
  {
    id: "17", company: "ACI للتأمين", companyEn: "ACI Insurance", logoInitials: "ACI", logoColor: "#fff", logoBg: "#455A64",
    type: "comprehensive", typeLabel: "شامل", price: 1750, originalPrice: 2500, monthlyPrice: 146,
    rating: 4.3, reviewCount: 670,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (20 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["إصلاح وكالة", "خدمة مميزة"],
    addOns: getAddOns("comprehensive", "17"),
  },
  {
    id: "18", company: "ملاذ للتأمين", companyEn: "Malath Insurance", logoInitials: "مل", logoColor: "#fff", logoBg: "#EF6C00",
    type: "comprehensive", typeLabel: "شامل", price: 3250, originalPrice: 4100, monthlyPrice: 271,
    rating: 4.4, reviewCount: 1050,
    features: [
      { label: "تغطية شاملة للمركبة", included: true }, { label: "تغطية ضد الغير", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "سيارة بديلة (25 يوم)", included: true },
      { label: "تغطية الكوارث الطبيعية", included: true }, { label: "إصلاح في الوكالة", included: true },
      { label: "زجاج أمامي مجاني", included: false }, { label: "تغطية دولية", included: false },
    ],
    highlights: ["خدمة مطالبات سريعة", "إصلاح وكالة"],
    addOns: getAddOns("comprehensive", "18"),
  },

  // === ضد الغير (Third Party) - أسعار حقيقية من السوق السعودي (مخصومة 100 ر.س) ===
  {
    id: "tp1", company: "التعاونية", companyEn: "Tawuniya", logoInitials: "تع", logoColor: "#fff", logoBg: "#00539B",
    type: "third-party", typeLabel: "ضد الغير", price: 430, originalPrice: 680, monthlyPrice: 36,
    rating: 4.8, reviewCount: 3200,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["أقل سعر", "الأكثر ثقة"], cheapest: true,
    addOns: getAddOns("third-party", "tp1"),
  },
  {
    id: "tp2", company: "ميدغلف", companyEn: "MedGulf", logoInitials: "مد", logoColor: "#fff", logoBg: "#C62828",
    type: "third-party", typeLabel: "ضد الغير", price: 480, originalPrice: 730, monthlyPrice: 40,
    rating: 4.4, reviewCount: 1890,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["سعر تنافسي", "سرعة إصدار"],
    addOns: getAddOns("third-party", "tp2"),
  },
  {
    id: "tp3", company: "المتكاملة (أسيج)", companyEn: "ASEIG Insurance", logoInitials: "أس", logoColor: "#fff", logoBg: "#1976D2",
    type: "third-party", typeLabel: "ضد الغير", price: 530, originalPrice: 780, monthlyPrice: 44,
    rating: 4.2, reviewCount: 1100,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: false }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["سعر اقتصادي"],
    addOns: getAddOns("third-party", "tp3"),
  },
  {
    id: "tp4", company: "سلامة", companyEn: "Salama Insurance", logoInitials: "سل", logoColor: "#fff", logoBg: "#F9A825",
    type: "third-party", typeLabel: "ضد الغير", price: 550, originalPrice: 810, monthlyPrice: 46,
    rating: 4.3, reviewCount: 890,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: false },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["تكافلي"],
    addOns: getAddOns("third-party", "tp4"),
  },
  {
    id: "tp5", company: "الراجحي تكافل", companyEn: "Al Rajhi Takaful", logoInitials: "رج", logoColor: "#fff", logoBg: "#6D4C41",
    type: "third-party", typeLabel: "ضد الغير", price: 510, originalPrice: 830, monthlyPrice: 43,
    rating: 4.5, reviewCount: 2100,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["تكافلي", "متوافق شرعياً"],
    addOns: getAddOns("third-party", "tp5"),
  },
  {
    id: "tp6", company: "الاتحاد الخليجي", companyEn: "Union Gulf Insurance", logoInitials: "GIG", logoColor: "#fff", logoBg: "#0D47A1",
    type: "third-party", typeLabel: "ضد الغير", price: 630, originalPrice: 930, monthlyPrice: 53,
    rating: 4.1, reviewCount: 780,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["مساعدة طريق"],
    addOns: getAddOns("third-party", "tp6"),
  },
  {
    id: "tp7", company: "ليفا للتأمين", companyEn: "Liva Insurance", logoInitials: "لف", logoColor: "#fff", logoBg: "#E65100",
    type: "third-party", typeLabel: "ضد الغير", price: 680, originalPrice: 980, monthlyPrice: 57,
    rating: 4.4, reviewCount: 1050,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["رقمي بالكامل", "إصدار فوري"],
    addOns: getAddOns("third-party", "tp7"),
  },
  {
    id: "tp8", company: "وفاء للتأمين", companyEn: "Wafa Insurance", logoInitials: "وف", logoColor: "#fff", logoBg: "#00838F",
    type: "third-party", typeLabel: "ضد الغير", price: 830, originalPrice: 1130, monthlyPrice: 69,
    rating: 4.0, reviewCount: 620,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["تغطية واسعة"],
    addOns: getAddOns("third-party", "tp8"),
  },
  {
    id: "tp9", company: "ملاذ للتأمين", companyEn: "Malath Insurance", logoInitials: "مل", logoColor: "#fff", logoBg: "#EF6C00",
    type: "third-party", typeLabel: "ضد الغير", price: 1030, originalPrice: 1380, monthlyPrice: 86,
    rating: 4.3, reviewCount: 980,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["خدمة مطالبات سريعة"],
    addOns: getAddOns("third-party", "tp9"),
  },
  {
    id: "tp10", company: "الدراية للتأمين", companyEn: "Al Drayah Insurance", logoInitials: "در", logoColor: "#fff", logoBg: "#1A237E",
    type: "third-party", typeLabel: "ضد الغير", price: 1430, originalPrice: 1830, monthlyPrice: 119,
    rating: 4.0, reviewCount: 440,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["تغطية متميزة"],
    addOns: getAddOns("third-party", "tp10"),
  },
  {
    id: "tp11", company: "المتحدة للتأمين", companyEn: "United Insurance", logoInitials: "مت", logoColor: "#fff", logoBg: "#546E7A",
    type: "third-party", typeLabel: "ضد الغير", price: 1430, originalPrice: 1930, monthlyPrice: 119,
    rating: 4.1, reviewCount: 530,
    features: [
      { label: "تغطية ضد الغير", included: true }, { label: "المسؤولية المدنية", included: true },
      { label: "المساعدة على الطريق", included: true }, { label: "حوادث شخصية", included: true },
      { label: "تغطية شاملة للمركبة", included: false }, { label: "سيارة بديلة", included: false },
    ],
    highlights: ["خبرة طويلة"],
    addOns: getAddOns("third-party", "tp11"),
  },
];

const InsuranceOffers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, dir, lang } = useLanguage();
  const of = t.offers;
  const customerData = useMemo(() => {
    const stateCustomer = location.state && Object.keys(location.state as Record<string, unknown>).length > 0 ? location.state : null;
    if (stateCustomer) return stateCustomer;
    try {
      return JSON.parse(sessionStorage.getItem("insurance_customer") || "{}");
    } catch {
      return {};
    }
  }, [location.state]);
  const [isSearching, setIsSearching] = useState(true);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStep, setSearchStep] = useState(0);
  const [filter, setFilter] = useState<"comprehensive" | "third-party">("comprehensive");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "discount">("price");
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, string[]>>({});
  const [showAddOns, setShowAddOns] = useState<string | null>(null);

  const searchSteps = [
    { icon: Search, text: of.searchSteps[0] },
    { icon: Building2, text: of.searchSteps[1] },
    { icon: Shield, text: of.searchSteps[2] },
    { icon: FileCheck, text: of.searchSteps[3] },
    { icon: Sparkles, text: of.searchSteps[4] },
  ];

  useEffect(() => {
    if (!isSearching) return;
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) { clearInterval(progressInterval); return 100; }
        return prev + 1;
      });
    }, 50);
    const stepInterval = setInterval(() => {
      setSearchStep(prev => {
        if (prev >= 4) { clearInterval(stepInterval); return 4; }
        return prev + 1;
      });
    }, 1100);
    const doneTimer = setTimeout(() => { setIsSearching(false); }, 5000);
    return () => { clearInterval(progressInterval); clearInterval(stepInterval); clearTimeout(doneTimer); };
  }, [isSearching]);

  const toggleAddOn = (offerId: string, addOnId: string) => {
    setSelectedAddOns(prev => {
      const current = prev[offerId] || [];
      return {
        ...prev,
        [offerId]: current.includes(addOnId) ? current.filter(id => id !== addOnId) : [...current, addOnId],
      };
    });
  };

  const BUNDLE_THRESHOLD = 3;
  const BUNDLE_DISCOUNT = 0.15; // 15% خصم

  const getAddOnsBreakdown = (offer: Offer) => {
    const addOnIds = selectedAddOns[offer.id] || [];
    const selected = offer.addOns.filter(a => addOnIds.includes(a.id));
    const subtotal = selected.reduce((sum, a) => sum + a.price, 0);
    const hasDiscount = selected.length >= BUNDLE_THRESHOLD;
    const discount = hasDiscount ? Math.round(subtotal * BUNDLE_DISCOUNT) : 0;
    return { subtotal, discount, total: subtotal - discount, count: selected.length, hasDiscount };
  };

  const getOfferTotal = (offer: Offer) => {
    const { total } = getAddOnsBreakdown(offer);
    return offer.price + total;
  };

  const filteredOffers = mockOffers
    .filter((o) => o.type === filter)
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice;
    });

  const handleSelectOffer = (offer: Offer) => {
    const addOnIds = selectedAddOns[offer.id] || [];
    const selectedAddOnsList = offer.addOns.filter(a => addOnIds.includes(a.id));
    const { total: addOnsTotal, discount } = getAddOnsBreakdown(offer);
    const persistedCustomer = customerData && Object.keys(customerData as Record<string, unknown>).length > 0
      ? customerData
      : (() => {
          try {
            return JSON.parse(sessionStorage.getItem("insurance_customer") || "{}");
          } catch {
            return {};
          }
        })();

    sessionStorage.setItem("insurance_customer", JSON.stringify(persistedCustomer));

    navigate("/insurance/checkout", {
      state: {
        offer: {
          id: offer.id,
          company: offer.company,
          type: offer.typeLabel,
          price: offer.price,
          originalPrice: offer.originalPrice,
          features: offer.features.filter((f) => f.included).map((f) => f.label),
          addOns: selectedAddOnsList,
          addOnsTotal,
          bundleDiscount: discount,
          totalPrice: offer.price + addOnsTotal,
        },
        customer: persistedCustomer,
      },
    });
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const discount = (offer: Offer) =>
    Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100);

  if (isSearching) {
    const CurrentIcon = searchSteps[searchStep].icon;
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center gradient-hero" dir={dir}>
        {/* Background */}
        <div className="absolute inset-0 bg-primary/20" />

        <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md mx-auto text-center">
          {/* Animated icon */}
          <motion.div
            className="w-24 h-24 rounded-3xl bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 flex items-center justify-center shadow-2xl"
            animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={searchStep}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 250, damping: 15 }}
              >
                <CurrentIcon className="w-10 h-10 text-cta" />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Step text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={searchStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-lg font-bold text-primary-foreground leading-relaxed"
            >
              {searchSteps[searchStep].text}
            </motion.p>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-full space-y-3">
            <div className="w-full h-2 rounded-full bg-primary-foreground/10 overflow-hidden backdrop-blur-sm border border-primary-foreground/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-l from-cta to-cta/70"
                style={{ width: `${searchProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-xs text-primary-foreground/50 font-medium">{searchProgress}%</p>
          </div>

          {/* Company dots */}
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-cta/60"
                animate={{
                  scale: searchStep >= i ? [1, 1.4, 1] : 1,
                  opacity: searchStep >= i ? 1 : 0.2,
                }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-primary-foreground/40 font-medium"
          >
            {of.searchingIn}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      <PremiumPageHeader
        title={of.title}
        subtitle={of.subtitle}
        badge={of.badge}
        badgeIcon={<Shield className="w-3.5 h-3.5 text-cta" />}
        compact
      />

      <div className="container mx-auto px-4 pb-16">

        {/* Filters + Sort */}
        <div className="max-w-5xl mx-auto mb-6 mt-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter tabs */}
            <div className="flex gap-2 flex-1">
              {[
                { id: "comprehensive", label: of.comprehensive, count: mockOffers.filter((o) => o.type === "comprehensive").length, icon: Shield },
                { id: "third-party", label: of.thirdParty, count: mockOffers.filter((o) => o.type === "third-party").length, icon: Car },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`relative px-5 py-3 text-sm font-bold transition-all duration-300 flex items-center gap-2.5 rounded-2xl flex-1 justify-center border-2 ${
                    filter === f.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <f.icon className="w-4 h-4" />
                  {f.label}
                  <span className={`text-[11px] min-w-[22px] text-center px-1.5 py-0.5 rounded-full font-bold ${
                    filter === f.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 bg-card rounded-2xl border border-border px-3 py-2.5">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm bg-transparent text-foreground border-none focus:outline-none font-medium cursor-pointer"
              >
                <option value="price">{of.sortByPrice}</option>
                <option value="rating">{of.sortByRating}</option>
                <option value="discount">{of.sortByDiscount}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-5xl mx-auto mb-5">
          <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3">
            <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-bold text-amber-600 dark:text-amber-400">{of.disclaimerLabel}</span> {of.disclaimerText}
            </p>
          </div>
        </div>

        {/* Offers List */}
        <div className="max-w-5xl mx-auto space-y-4">
          {filteredOffers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group"
            >
              <div
                className={`relative bg-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-0.5 border ${
                  offer.popular
                    ? "border-cta shadow-[0_4px_24px_-4px_hsl(var(--cta)/0.2)] ring-1 ring-cta/50"
                    : offer.bestValue
                    ? "border-primary/40 shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.15)] ring-1 ring-primary/30"
                    : "border-border shadow-sm hover:shadow-md hover:border-primary/30"
                }`}
              >
                {/* Badge */}
                {(offer.popular || offer.bestValue || offer.cheapest) && (
                  <div className={`w-full text-center py-1.5 text-xs font-bold ${
                    offer.popular
                      ? "bg-cta text-cta-foreground"
                      : offer.bestValue
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    {offer.popular && of.mostPopular}
                    {offer.bestValue && of.bestValue}
                    {offer.cheapest && of.cheapest}
                  </div>
                )}

                <div className="p-4">
                  {/* Company row */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-secondary/50 border border-border/60 shrink-0">
                      {companyLogos[offer.company] ? (
                        <img src={companyLogos[offer.company]} alt={offer.company} className="w-full h-full object-contain p-1" loading="lazy" />
                      ) : (
                        <span className="text-sm font-bold" style={{ color: offer.logoBg }}>{offer.logoInitials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm leading-tight">{offer.company}</h3>
                      <p className="text-[10px] text-muted-foreground">{offer.companyEn}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= Math.round(offer.rating) ? "text-amber-400 fill-amber-400" : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {offer.rating} ({offer.reviewCount.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      offer.type === "comprehensive"
                        ? "bg-primary/10 text-primary"
                        : "bg-cta/10 text-cta-foreground"
                    }`}>
                      {offer.typeLabel}
                    </span>
                    {offer.highlights.map((h, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] bg-secondary text-muted-foreground font-medium">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-end justify-between mt-4 pt-3 border-t border-border/40">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] text-muted-foreground line-through">
                          {offer.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-white bg-cta px-1.5 py-0.5 rounded-md">
                          -{discount(offer)}%
                        </span>
                      </div>
                      <p className="text-xl font-black text-primary leading-none">
                        {getOfferTotal(offer).toLocaleString()}
                        <span className="text-[11px] font-semibold text-muted-foreground mr-1">{of.perYear}</span>
                      </p>
                      {(selectedAddOns[offer.id]?.length || 0) > 0 && (
                        <p className="text-[10px] text-primary/70 mt-0.5">
                          {of.including} {selectedAddOns[offer.id].length} {of.addOn}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {of.or} <span className="font-bold text-foreground">{Math.round(getOfferTotal(offer) / 12)}</span> {of.perMonth}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSelectOffer(offer)}
                      className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl px-5 py-4 font-bold text-sm shadow-md shadow-cta/20"
                    >
                      {of.selectOffer}
                    </Button>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                    {offer.features
                      .filter((f) => f.included)
                      .slice(0, 3)
                      .map((f, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Check className="w-3 h-3 text-cta" />
                          {f.label}
                        </span>
                      ))}
                    <div className="flex items-center gap-1 mr-auto">
                      <button
                        onClick={() => setExpandedOffer(expandedOffer === offer.id ? null : offer.id)}
                        className="text-[11px] text-primary font-semibold hover:text-primary/80 transition-colors"
                      >
                        {expandedOffer === offer.id ? of.hide : of.details}
                      </button>
                      <span className="text-border">|</span>
                      <button
                        onClick={() => setShowAddOns(showAddOns === offer.id ? null : offer.id)}
                        className={`text-[11px] font-semibold transition-colors ${
                          showAddOns === offer.id ? "text-cta" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {of.addOns} {(selectedAddOns[offer.id]?.length || 0) > 0 && `(${selectedAddOns[offer.id].length})`}
                      </button>
                      <span className="text-border">|</span>
                      <button
                        onClick={() => toggleCompare(offer.id)}
                        className={`text-[11px] transition-colors ${
                          compareList.includes(offer.id)
                            ? "text-primary font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {compareList.includes(offer.id) ? of.compareSelected : of.compare}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded features */}
                <AnimatePresence>
                  {expandedOffer === offer.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0">
                        <div className="pt-3 border-t border-border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {offer.features.map((f, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-2 text-xs py-2 px-3 rounded-lg ${
                                  f.included ? "bg-cta/5" : "bg-secondary/50"
                                }`}
                              >
                                {f.included ? (
                                  <Check className="w-3.5 h-3.5 text-cta shrink-0" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                                )}
                                <span className={f.included ? "text-foreground" : "text-muted-foreground/50 line-through"}>
                                  {f.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add-ons section */}
                <AnimatePresence>
                  {showAddOns === offer.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0">
                        <div className="pt-3 border-t border-border">
                          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-primary" />
                            {of.additionalOptions}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {offer.addOns.map((addOn) => {
                              const isSelected = (selectedAddOns[offer.id] || []).includes(addOn.id);
                              return (
                                <motion.button
                                  key={addOn.id}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => toggleAddOn(offer.id, addOn.id)}
                                  className={`flex items-center gap-3 p-3 rounded-xl text-right transition-all border-2 ${
                                    isSelected
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-border/50 bg-secondary/30 hover:border-primary/30"
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                  }`}>
                                    {isSelected ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-foreground">{addOn.label}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{addOn.description}</p>
                                  </div>
                                  <span className={`text-xs font-bold shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                                    +{addOn.price} {of.sar || "ر.س"}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                          {(selectedAddOns[offer.id]?.length || 0) > 0 && (() => {
                            const breakdown = getAddOnsBreakdown(offer);
                            return (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-3 space-y-2"
                              >
                                {breakdown.hasDiscount && (
                                  <div className="p-2.5 bg-cta/10 border border-cta/20 rounded-xl flex items-center gap-2">
                                    <span className="text-cta text-lg">🎁</span>
                                    <div className="flex-1">
                                      <p className="text-[11px] font-bold text-cta">{of.bundleDiscount}</p>
                                      <p className="text-[10px] text-muted-foreground">{of.youSelected} {breakdown.count} {of.addOnsLabel} — {of.youSaved} {breakdown.discount} {of.sar || "ر.س"}</p>
                                    </div>
                                    <span className="text-xs font-bold text-cta line-through opacity-60">{breakdown.subtotal} {of.sar || "ر.س"}</span>
                                  </div>
                                )}
                                {!breakdown.hasDiscount && breakdown.count > 0 && breakdown.count < BUNDLE_THRESHOLD && (
                                  <div className="p-2 bg-muted/50 rounded-xl text-center">
                                    <p className="text-[10px] text-muted-foreground">{of.addMoreForDiscount.replace("{n}", String(BUNDLE_THRESHOLD - breakdown.count))} <span className="font-bold text-primary">{of.discountLabel}</span> {of.onAddOns}</p>
                                  </div>
                                )}
                                <div className="p-3 bg-primary/5 rounded-xl flex items-center justify-between">
                                  <span className="text-xs font-bold text-foreground">{of.totalWithAddOns}</span>
                                  <span className="text-sm font-bold text-primary">{getOfferTotal(offer).toLocaleString()} {of.perYear}</span>
                                </div>
                              </motion.div>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
            </motion.div>
          ))}
        </div>

        {/* Compare bar */}
        <AnimatePresence>
          {compareList.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary text-primary-foreground rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="text-sm font-bold">
                {compareList.length} {of.offersSelectedForCompare}
              </span>
              <Button
                size="sm"
                className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl"
                onClick={() => navigate("/insurance/compare", {
                  state: { offers: mockOffers.filter((o) => compareList.includes(o.id)) },
                })}
              >
                {of.compareNow}
              </Button>
              <button onClick={() => setCompareList([])} className="text-primary-foreground/60 hover:text-primary-foreground">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default InsuranceOffers;
