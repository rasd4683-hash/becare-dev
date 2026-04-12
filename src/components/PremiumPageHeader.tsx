import { motion } from "framer-motion";
import heroInsuranceBg from "@/assets/hero-insurance-bg.jpg";

interface PremiumPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  children?: React.ReactNode;
  compact?: boolean;
}

const PremiumPageHeader = ({ title, subtitle, badge, badgeIcon, children, compact }: PremiumPageHeaderProps) => {
  return (
    <section className={`relative overflow-hidden ${compact ? "pt-20 pb-10 md:pt-24 md:pb-14" : "pt-20 pb-14 md:pt-24 md:pb-20"}`}>
      {/* Background image */}
      <img
        src={heroInsuranceBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />

      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="absolute top-6 right-6 w-48 h-48 text-primary-foreground" viewBox="0 0 200 200" fill="currentColor">
          <circle cx="100" cy="100" r="80" fillOpacity="0.15" />
          <circle cx="100" cy="100" r="55" fillOpacity="0.1" />
        </svg>
        <svg className="absolute bottom-6 left-6 w-36 h-36 text-primary-foreground" viewBox="0 0 200 200" fill="currentColor">
          <circle cx="100" cy="100" r="70" fillOpacity="0.12" />
        </svg>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {badge && (
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-5 py-2 mb-4 border border-primary-foreground/10">
              {badgeIcon}
              <span className="text-xs text-primary-foreground font-bold">{badge}</span>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary-foreground mb-3 leading-tight max-w-3xl mx-auto">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-base text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumPageHeader;
