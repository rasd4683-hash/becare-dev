import { Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const InsuranceStepper = ({ active }: { active: number }) => {
  const { t } = useLanguage();
  const steps = t.stepper.steps;

  return (
    <div className="mb-8">
      <div className="relative flex items-center justify-between max-w-md mx-auto px-2">
        <div className="absolute top-4 right-8 left-8 h-[3px] bg-muted rounded-full" />
        <div
          className="absolute top-4 right-8 h-[3px] bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(active / (steps.length - 1)) * (100 - 12)}%` }}
        />

        {steps.map((s, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                i < active
                  ? "bg-primary border-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  : i === active
                  ? "bg-cta border-cta text-cta-foreground shadow-[0_0_16px_hsl(var(--cta)/0.4)] scale-110"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              {i < active ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
            </div>
            <span
              className={`text-[10px] mt-2 whitespace-nowrap transition-colors ${
                i < active
                  ? "text-primary font-bold"
                  : i === active
                  ? "text-cta font-extrabold"
                  : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsuranceStepper;
