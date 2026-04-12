import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, CheckCircle2, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerifyPolicy = () => {
  const [searchParams] = useSearchParams();
  const policyNumber = searchParams.get("policy");

  const isDraft = policyNumber?.startsWith("DRAFT-");
  const isValid = !!policyNumber && policyNumber.length > 4;

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/5 border-b border-border px-5 py-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="font-bold text-sm text-foreground">التحقق من البوليصة</h1>
            </div>

            <div className="p-5">
              {!isValid ? (
                /* No policy number */
                <div className="text-center space-y-3 py-6">
                  <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                  <h2 className="font-bold text-foreground">رقم بوليصة غير صالح</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    لم يتم العثور على رقم بوليصة صالح. تأكد من مسح رمز QR بشكل صحيح.
                  </p>
                </div>
              ) : (
                /* Valid policy */
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="font-bold text-foreground">
                      {isDraft ? "بوليصة مسودة" : "بوليصة مؤكدة"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {isDraft
                        ? "هذه بوليصة مسودة لحين الانتهاء من الإجراءات"
                        : "تم التحقق من صحة البوليصة بنجاح"}
                    </p>
                  </div>

                  {/* Policy details */}
                  <div className="bg-secondary/50 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{policyNumber}</span>
                      <span className="text-[10px] text-muted-foreground">رقم البوليصة</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDraft ? "text-amber-600" : "text-primary"}`}>
                        {isDraft ? "مسودة" : "مؤكدة"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">الحالة</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground">
                        {new Date().toLocaleDateString("ar-SA")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">تاريخ التحقق</span>
                    </div>
                  </div>

                  {isDraft && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                        هذه البوليصة لا تزال في مرحلة المسودة ولن تكون سارية المفعول حتى يتم إتمام الدفع والموافقة النهائية.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5">
                <Link to="/">
                  <Button variant="outline" className="w-full rounded-xl py-4 text-xs gap-2">
                    <ArrowRight className="w-3.5 h-3.5" />
                    العودة للرئيسية
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyPolicy;
