import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    nameAr: "عبدالله المطيري",
    nameEn: "Abdullah Al-Mutairi",
    roleAr: "صاحب أعمال",
    roleEn: "Business Owner",
    textAr: "أفضل تجربة تأمين مريتها! قارنت بين أكثر من 10 شركات واخترت الأنسب لي بكل سهولة. الأسعار منافسة والخدمة ممتازة.",
    textEn: "Best insurance experience I've had! Compared over 10 companies and chose the best one easily. Competitive prices and excellent service.",
    rating: 5,
    avatar: "ع",
  },
  {
    nameAr: "سارة القحطاني",
    nameEn: "Sarah Al-Qahtani",
    roleAr: "موظفة حكومية",
    roleEn: "Government Employee",
    textAr: "سهولة في الاستخدام وسرعة في الإجراءات. أمنت سيارتي بأقل من 5 دقائق والوثيقة وصلتني فوراً. أنصح الجميع يجربون بي كير.",
    textEn: "Easy to use and fast process. Insured my car in less than 5 minutes and received the policy instantly. Highly recommend BCare.",
    rating: 5,
    avatar: "س",
  },
  {
    nameAr: "فهد العتيبي",
    nameEn: "Fahd Al-Otaibi",
    roleAr: "مهندس",
    roleEn: "Engineer",
    textAr: "الشفافية في الأسعار والعروض هي اللي خلتني أختار بي كير. ما في رسوم خفية وكل شي واضح من البداية. تجربة رائعة فعلاً.",
    textEn: "Price transparency made me choose BCare. No hidden fees and everything is clear from the start. Truly a great experience.",
    rating: 5,
    avatar: "ف",
  },
  {
    nameAr: "نورة الشمري",
    nameEn: "Noura Al-Shammari",
    roleAr: "معلمة",
    roleEn: "Teacher",
    textAr: "خدمة عملاء متميزة ومتعاونة. ساعدوني أختار التأمين المناسب لعائلتي بكل احترافية. شكراً بي كير!",
    textEn: "Outstanding and cooperative customer service. They helped me choose the right insurance for my family professionally. Thank you BCare!",
    rating: 5,
    avatar: "ن",
  },
  {
    nameAr: "محمد الدوسري",
    nameEn: "Mohammed Al-Dosari",
    roleAr: "رجل أعمال",
    roleEn: "Businessman",
    textAr: "أمنت جميع سيارات شركتي عن طريق بي كير ووفرت أكثر من 30% مقارنة بالتأمين المباشر. خدمة احترافية من الدرجة الأولى.",
    textEn: "Insured all my company cars through BCare and saved over 30% compared to direct insurance. First-class professional service.",
    rating: 5,
    avatar: "م",
  },
  {
    nameAr: "ريم الحربي",
    nameEn: "Reem Al-Harbi",
    roleAr: "طبيبة",
    roleEn: "Doctor",
    textAr: "تجربة تأمين طبي ممتازة! الشبكة الطبية واسعة والتغطية شاملة. أفضل قرار اتخذته هو التأمين عبر بي كير.",
    textEn: "Excellent health insurance experience! Wide medical network and comprehensive coverage. Best decision I made was insuring through BCare.",
    rating: 5,
    avatar: "ر",
  },
];

const TestimonialsSection = () => {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Show 3 testimonials at a time on desktop, 1 on mobile
  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(testimonials[(activeIndex + i) % testimonials.length]);
    }
    return result;
  };

  return (
    <section className="py-8 md:py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-[hsl(193,72%,28%)]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-cta blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-white blur-[80px]" />
      </div>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-semibold mb-3 backdrop-blur-sm border border-white/10">
            ⭐ {lang === "ar" ? "تقييم 4.9 من 5" : "Rated 4.9 out of 5"}
          </span>
          <h2 className="text-xl lg:text-2xl font-extrabold text-white mb-2">
            {lang === "ar" ? "آراء عملائنا" : "What Our Clients Say"}
          </h2>
          <p className="text-white/70 text-xs max-w-md mx-auto">
            {lang === "ar"
              ? "اكتشف لماذا يختار أكثر من نصف مليون عميل بي كير لتأمينهم"
              : "Discover why over half a million clients choose BCare for their insurance"}
          </p>
        </motion.div>

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {getVisibleTestimonials().map((t, i) => (
            <motion.div
              key={`${t.nameEn}-${activeIndex}-${i}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 flex flex-col"
            >
              <Quote className="w-6 h-6 text-cta/40 mb-2" />
              <p className="text-xs text-white/85 leading-relaxed flex-1 mb-3">
                "{lang === "ar" ? t.textAr : t.textEn}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-cta text-cta" />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-cta/20 flex items-center justify-center text-cta font-bold text-xs">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {lang === "ar" ? t.nameAr : t.nameEn}
                  </p>
                  <p className="text-[10px] text-white/50">
                    {lang === "ar" ? t.roleAr : t.roleEn}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: 1 card */}
        <div className="md:hidden">
          <motion.div
            key={`mobile-${activeIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4"
          >
            <Quote className="w-5 h-5 text-cta/40 mb-2" />
            <p className="text-xs text-white/85 leading-relaxed mb-3">
              "{lang === "ar" ? testimonials[activeIndex].textAr : testimonials[activeIndex].textEn}"
            </p>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: testimonials[activeIndex].rating }).map((_, j) => (
                <Star key={j} className="w-3 h-3 fill-cta text-cta" />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-cta/20 flex items-center justify-center text-cta font-bold text-xs">
                {testimonials[activeIndex].avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {lang === "ar" ? testimonials[activeIndex].nameAr : testimonials[activeIndex].nameEn}
                </p>
                <p className="text-[10px] text-white/50">
                  {lang === "ar" ? testimonials[activeIndex].roleAr : testimonials[activeIndex].roleEn}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center gap-1.5 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "bg-cta w-5" : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
