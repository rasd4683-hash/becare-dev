import { motion } from "framer-motion";
import { MapPin, CreditCard, Zap, Flame, TrendingDown, Headphones } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BCareWhySection = () => {
  const { t } = useLanguage();

  const reasons = [
    { icon: MapPin, title: t.whyBcare.reasons.local, color: "text-primary" },
    { icon: CreditCard, title: t.whyBcare.reasons.offers, color: "text-primary" },
    { icon: TrendingDown, title: t.whyBcare.reasons.price, color: "text-cta" },
    { icon: Zap, title: t.whyBcare.reasons.fast, color: "text-primary" },
    { icon: Flame, title: t.whyBcare.reasons.installments, color: "text-cta" },
    { icon: Headphones, title: t.whyBcare.reasons.support, color: "text-primary" },
  ];

  return (
    <section className="py-6 lg:py-8 bg-background">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl lg:text-2xl font-extrabold text-primary text-center mb-5"
          dir="auto"
        >
          {t.whyBcare.title}
        </motion.h2>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <r.icon className={`w-5 h-5 ${r.color} group-hover:text-primary-foreground transition-colors`} />
              </div>
              <h3 className="font-bold text-foreground text-xs">{r.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BCareWhySection;
