import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Home, FileText, Share2, Shield } from "lucide-react";
import InsuranceStepper from "@/components/InsuranceStepper";
import { useLanguage } from "@/i18n/LanguageContext";

const InsuranceConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const offer = location.state?.offer;
  const policyNumber = location.state?.policyNumber || "POL-00000000";
  const c = t.confirmation;

  return (
    <div className="min-h-[100dvh] bg-secondary/30">
      <div className="container mx-auto px-3 md:px-4 pt-8 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <InsuranceStepper active={3} />

          <div className="max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-card rounded-2xl border border-border shadow-sm p-5 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 rounded-xl bg-cta/10 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-cta" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-xl font-bold text-foreground mb-1">{c.success}</h2>
                  <p className="text-xs text-muted-foreground mb-2">{c.successSubtitle}</p>
                  <p className="text-[11px] text-muted-foreground mb-4">{c.successNote}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-primary/5 rounded-lg p-3.5 mb-4 text-right space-y-2">
                  {[
                    { label: c.policyNumber, value: policyNumber, mono: true, highlight: true },
                    ...(offer ? [
                      { label: c.insuranceCompany, value: offer.company },
                      { label: c.insuranceType, value: offer.type },
                      { label: c.amountPaid, value: `${offer.price?.toLocaleString()} ${c.sar}`, highlight: true },
                    ] : []),
                    {
                      label: c.coveragePeriod,
                      value: `${new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")} - ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}`,
                    },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5">
                      <span className={`font-bold text-xs ${row.highlight ? "text-primary" : "text-foreground"} ${row.mono ? "font-mono" : ""}`} dir={row.mono ? "ltr" : undefined}>
                        {row.value}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{row.label}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-4 font-bold text-sm gap-2">
                    <Download className="w-3.5 h-3.5" />
                    {c.downloadPDF}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-xl gap-1.5 text-xs py-3">
                      <Share2 className="w-3.5 h-3.5" />
                      {c.share}
                    </Button>
                    <Button variant="outline" className="rounded-xl gap-1.5 text-xs py-3">
                      <FileText className="w-3.5 h-3.5" />
                      {c.print}
                    </Button>
                  </div>

                  <Button variant="ghost" onClick={() => navigate("/")} className="w-full rounded-xl text-muted-foreground gap-1.5 text-xs">
                    <Home className="w-3.5 h-3.5" />
                    {c.backToHome}
                  </Button>
                </motion.div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary/60" />
                  <p className="text-[10px] text-muted-foreground">{c.emailSent}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceConfirmation;
