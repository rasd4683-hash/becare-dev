import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Users, Shield, Building2, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const stats = [
  { icon: Users, value: 500000, suffix: "+", labelAr: "عميل يثق بنا", labelEn: "Trusted Clients" },
  { icon: Shield, value: 2000000, suffix: "+", labelAr: "وثيقة تأمين صادرة", labelEn: "Policies Issued" },
  { icon: Building2, value: 18, suffix: "", labelAr: "شركة تأمين شريكة", labelEn: "Insurance Partners" },
  { icon: Award, value: 10, suffix: "+", labelAr: "سنوات من الخبرة", labelEn: "Years of Experience" },
];

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{formatNumber(count)}{suffix}</span>;
};

const StatsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-8 md:py-10 bg-gradient-to-b from-primary/[0.03] to-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-cta blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl lg:text-2xl font-extrabold text-primary mb-2">
            {lang === "ar" ? "بي كير بالأرقام" : "BCare in Numbers"}
          </h2>
          <p className="text-muted-foreground text-xs max-w-md mx-auto">
            {lang === "ar"
              ? "أرقام تعكس ثقة عملائنا وخبرتنا الطويلة في سوق التأمين السعودي"
              : "Numbers reflecting our clients' trust and long experience in the Saudi insurance market"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.labelEn}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="group text-center"
            >
              <div className="bg-card border border-border/60 rounded-xl p-4 md:p-5 hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-primary/15 transition-colors">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-xl md:text-2xl font-extrabold text-primary mb-1 tabular-nums">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  {lang === "ar" ? stat.labelAr : stat.labelEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
