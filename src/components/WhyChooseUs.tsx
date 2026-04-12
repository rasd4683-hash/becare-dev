import { motion } from "framer-motion";
import { Shield, SlidersHorizontal, Zap, CalendarClock, Clock, TrendingDown, Building2, BadgePercent, Stethoscope, FileCheck, Scale, Settings2, Gift, FileText } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const iconSet = [Clock, SlidersHorizontal, TrendingDown, CalendarClock, Zap, BadgePercent, Shield, Building2];

interface WhyChooseUsProps {
  activeTab?: string;
}

const WhyChooseUs = ({ activeTab = "vehicles" }: WhyChooseUsProps) => {
  const { t } = useLanguage();
  const tabKey = activeTab as keyof typeof t.whyChooseUs;
  const content = t.whyChooseUs[tabKey] || t.whyChooseUs.vehicles;

  return (
    <section className="py-6 lg:py-8 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="text-xl lg:text-2xl font-extrabold text-primary mb-2">
            {content.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {content.items.map((f, i) => {
            const Icon = iconSet[i % iconSet.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl p-3 lg:p-4 border border-border text-center group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-primary group-hover:shadow-md transition-all duration-300">
                  <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-xs">{f.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
