import { motion } from "framer-motion";
import { companyLogos } from "@/lib/companyLogos";

const partners = [
  "التعاونية", "ملاذ للتأمين", "العربية للتأمين", "ولاء للتأمين", "الدرع العربي",
  "سلامة", "المتكاملة (أسيج)", "الخليجية العامة", "الاتحاد التجاري", "ميدغلف",
  "التكافل العربي", "الصقر للتأمين", "GIG", "ليفا للتأمين", "ACI للتأمين",
  "الراجحي تكافل", "أليانز السعودية", "بوبا العربية",
];

const PartnersStrip = () => {
  return (
    <section className="py-4 bg-background border-b border-border overflow-hidden">
      <div className="section-container">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground font-medium mb-3"
        >
          نتعاون مع أفضل شركات التأمين في المملكة
        </motion.p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />

        <div className="flex animate-marquee gap-5 items-center">
          {[...partners, ...partners].map((name, i) => {
            const logo = companyLogos[name];
            return (
              <div
                key={`${name}-${i}`}
                className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shrink-0 hover:shadow-sm hover:border-primary/30 transition-all group"
              >
                {logo ? (
                  <img src={logo} alt={name} className="w-6 h-6 object-contain rounded" loading="lazy" />
                ) : (
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {name.slice(0, 2)}
                  </div>
                )}
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;
