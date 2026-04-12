import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Check, Zap, ArrowRight, Star, Phone, Clock, Award, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumPageHeader from "@/components/PremiumPageHeader";

const productsData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Shield;
  features: { text: string; free?: boolean }[];
  benefits: { title: string; desc: string; icon: typeof Shield }[];
  stats: { value: string; label: string }[];
  testimonials: { name: string; text: string; rating: number }[];
}> = {
  comprehensive: {
    title: "التأمين الشامل",
    subtitle: "أعلى مستوى من الحماية لقيادة آمنة",
    description: "التأمين الشامل يغطي الأضرار التي تلحق بسيارتك وسيارة الطرف الآخر، بالإضافة إلى الحريق والسرقة والكوارث الطبيعية. احصل على راحة البال الكاملة مع تغطية شاملة لكل المخاطر.",
    icon: Shield,
    features: [
      { text: "خدمات الحل الشامل للمطالبات" },
      { text: "المساعدة على الطريق", free: true },
      { text: "تغطية ضد الكوارث الطبيعية (البرد والفيضانات)" },
      { text: "تغطية ضد الحريق" },
      { text: "شبكة واسعة النطاق" },
      { text: "جميع الخدمات في التأمين ضد الغير" },
      { text: "تغطية الاصطدام" },
      { text: "تغطية الإيذاء المتعمد والسرقة" },
    ],
    benefits: [
      { title: "تغطية 360°", desc: "حماية كاملة لسيارتك من جميع الأخطار", icon: Shield },
      { title: "ورش معتمدة", desc: "إصلاح في أفضل الورش المعتمدة والمضمونة", icon: Award },
      { title: "سيارة بديلة", desc: "سيارة بديلة أثناء فترة الإصلاح", icon: Star },
      { title: "تغطية خليجية", desc: "تأمينك يغطيك في جميع دول الخليج", icon: Clock },
    ],
    stats: [
      { value: "+50K", label: "عميل يثق بنا" },
      { value: "24/7", label: "دعم متواصل" },
      { value: "98%", label: "رضا العملاء" },
    ],
    testimonials: [
      { name: "عبدالله المطيري", text: "تأمين شامل ممتاز! غطّى لي كل شيء بعد الحادث، من إصلاح السيارة للسيارة البديلة. أنصح فيه بقوة.", rating: 5 },
      { name: "سارة الحربي", text: "خدمة المطالبات كانت سريعة جداً، ما توقعت إنها تخلص بهالسرعة. شكراً بي كير!", rating: 5 },
      { name: "محمد العتيبي", text: "المساعدة على الطريق المجانية أنقذتني أكثر من مرة. تأمين يستاهل كل ريال.", rating: 4 },
    ],
  },
  "third-party": {
    title: "ضد الغير",
    subtitle: "تأمين طرف ثالث يحميك ويحمي الغير",
    description: "تأمين ضد الغير يوفر لك الحماية الأساسية المطلوبة قانونياً، ويغطي الأضرار التي قد تلحقها بالغير أثناء القيادة. حل اقتصادي وفعّال.",
    icon: Zap,
    features: [
      { text: "ضد الغير" },
      { text: "الحوادث الشخصية", free: true },
      { text: "تغطية الاصطدام" },
      { text: "تغطية الإيذاء المتعمد والسرقة" },
      { text: "المساعدة على الطريق" },
      { text: "تغطية الزجاج والمحرك" },
      { text: "التغطية الخليجية" },
      { text: "سيارة بديلة" },
    ],
    benefits: [
      { title: "أسعار تنافسية", desc: "أفضل الأسعار مقارنة بالسوق", icon: Star },
      { title: "تغطية قانونية", desc: "تغطية كاملة تتوافق مع المتطلبات القانونية", icon: Shield },
      { title: "حماية مالية", desc: "حمايتك من مطالبات الطرف الآخر", icon: Award },
      { title: "إجراءات سريعة", desc: "معالجة المطالبات بسرعة وسهولة", icon: Clock },
    ],
    stats: [
      { value: "+30K", label: "وثيقة نشطة" },
      { value: "5 دقائق", label: "لإصدار الوثيقة" },
      { value: "95%", label: "رضا العملاء" },
    ],
    testimonials: [
      { name: "خالد الشمري", text: "تأمين ضد الغير بسعر ممتاز وتغطية ممتازة. الإجراءات كانت سهلة وسريعة.", rating: 5 },
      { name: "نورة القحطاني", text: "أفضل سعر لقيته بالسوق لتأمين ضد الغير، والخدمة بعد ممتازة.", rating: 5 },
      { name: "فهد الدوسري", text: "تعاملهم راقي وسريع، قدّمت مطالبة وانحلت بأسبوع. ما راح أغيّر.", rating: 4 },
    ],
  },
};

const InsuranceProduct = () => {
  const { type } = useParams<{ type: string }>();
  const product = type ? productsData[type] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PremiumPageHeader title="المنتج غير موجود" subtitle="الصفحة التي تبحث عنها غير متوفرة" compact />
        <div className="section-container py-12 text-center">
          <Link to="/">
            <Button className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-2xl px-8 py-5 font-bold">العودة للرئيسية</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = product.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <PremiumPageHeader
        title={product.title}
        subtitle={product.subtitle}
        badge="منتجات التأمين"
        badgeIcon={<Icon className="w-3.5 h-3.5 text-cta" />}
      >
        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {product.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-cta">{stat.value}</p>
              <p className="text-xs md:text-sm text-primary-foreground/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link to="/#hero">
            <Button className="bg-cta text-cta-foreground hover:bg-cta-hover text-lg px-10 py-6 rounded-2xl font-bold w-full sm:w-auto btn-glow">
              احصل على عرض سعر
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            </Button>
          </Link>
          <Button variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-10 py-6 rounded-2xl font-bold">
            <Phone className="w-5 h-5 ml-2" />
            تواصل معنا
          </Button>
        </div>
      </PremiumPageHeader>

      {/* Description */}
      <section className="py-16 bg-background">
        <div className="section-container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <span className="inline-block bg-cta/10 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-6">نبذة عن المنتج</span>
            <p className="text-lg text-muted-foreground leading-loose">{product.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block bg-cta/10 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">التغطيات</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">مميزات التغطية</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {product.features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group flex items-center gap-3 bg-card p-4 rounded-2xl border border-border hover:border-cta/30 hover:shadow-lg transition-all duration-300">
                <div className="w-8 h-8 rounded-xl bg-cta/15 flex items-center justify-center shrink-0 group-hover:bg-cta/25 transition-colors">
                  <Check className="w-4 h-4 text-cta" />
                </div>
                <span className="text-foreground font-medium text-sm">{feature.text}</span>
                {feature.free && (
                  <span className="bg-cta/15 text-cta text-[10px] font-bold px-2.5 py-1 rounded-full mr-auto whitespace-nowrap">مجاناً</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block bg-cta/10 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">المزايا</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">لماذا تختار {product.title}؟</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {product.benefits.map((benefit, i) => {
              const BenefitIcon = benefit.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group bg-card border border-border rounded-3xl p-6 text-center hover:shadow-xl hover:border-cta/20 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-cta/15 transition-colors">
                    <BenefitIcon className="w-7 h-7 text-primary group-hover:text-cta transition-colors" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-secondary">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block bg-cta/10 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">آراء العملاء</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">ماذا يقول عملاؤنا؟</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {product.testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-3xl p-6 relative group hover:shadow-xl hover:border-cta/20 transition-all duration-300">
                <Quote className="w-8 h-8 text-cta/20 absolute top-4 left-4" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-4 h-4 ${si < t.rating ? "text-cta fill-cta" : "text-border"}`} />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{t.name.charAt(0)}</span>
                  </div>
                  <span className="font-bold text-foreground text-sm">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - now uses hero bg */}
      <PremiumPageHeader
        title="جاهز تأمّن سيارتك؟"
        subtitle="احصل على عرض سعر فوري في أقل من دقيقة"
        compact
      >
        <Link to="/" className="inline-block mt-8">
          <Button className="bg-cta text-cta-foreground hover:bg-cta-hover text-lg px-12 py-6 rounded-2xl font-bold shadow-lg shadow-cta/25 btn-glow">
            أمّن الحين
            <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
          </Button>
        </Link>
      </PremiumPageHeader>

      <Footer />
    </div>
  );
};

export default InsuranceProduct;
