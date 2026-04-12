import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { companyLogos } from "@/lib/companyLogos";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import { Check, X, Star, ArrowRight, ShieldCheck, Car } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Feature { label: string; included: boolean; }
interface Offer {
  id: string; company: string; companyEn: string; logoInitials: string;
  logoColor: string; logoBg: string; type: string; typeLabel: string;
  price: number; originalPrice: number; monthlyPrice: number;
  rating: number; reviewCount: number; features: Feature[]; highlights: string[];
}

const getAllFeatures = (offers: Offer[]): string[] => {
  const set = new Set<string>();
  offers.forEach((o) => o.features.forEach((f) => set.add(f.label)));
  return Array.from(set);
};

const InsuranceCompare = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, dir } = useLanguage();
  const c = t.compare;
  const offers: Offer[] = location.state?.offers ?? [];

  if (offers.length < 2) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Car className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{c.selectAtLeast2}</p>
            <Button onClick={() => navigate("/insurance/offers")} className="rounded-xl">{c.showOffers}</Button>
          </div>
        </div>
      </div>
    );
  }

  const allFeatures = getAllFeatures(offers);
  const cheapest = offers.reduce((a, b) => (a.price < b.price ? a : b));
  const bestRated = offers.reduce((a, b) => (a.rating > b.rating ? a : b));

  const handleSelect = (offer: Offer) => {
    navigate("/insurance/payment", {
      state: {
        offer: {
          id: offer.id, company: offer.company, type: offer.typeLabel,
          price: offer.price, originalPrice: offer.originalPrice,
          logoInitials: offer.logoInitials,
          features: offer.features.filter((f) => f.included).map((f) => f.label),
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />
      <PremiumPageHeader
        title={c.title}
        subtitle={c.subtitleTemplate.replace("{n}", String(offers.length))}
        badge={c.badge}
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5 text-cta" />}
        compact
      />

      <div className="container mx-auto px-4 -mt-8 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <button
            onClick={() => navigate("/insurance/offers")}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-6 font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            {c.backToOffers}
          </button>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 text-right text-sm font-bold text-muted-foreground bg-secondary/50 w-[180px] sticky right-0 z-10">
                    {c.comparison}
                  </th>
                  {offers.map((offer) => (
                    <th key={offer.id} className="p-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-card border border-border shadow-sm">
                          {companyLogos[offer.company] ? (
                            <img src={companyLogos[offer.company]} alt={offer.company} className="w-full h-full object-contain p-1" loading="lazy" />
                          ) : (
                            <span className="text-sm font-bold" style={{ color: offer.logoBg }}>{offer.logoInitials}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{offer.company}</p>
                          <p className="text-[11px] text-muted-foreground">{offer.companyEn}</p>
                        </div>
                        <div className="flex gap-1.5">
                          {offer.id === cheapest.id && (
                            <span className="text-[10px] bg-cta/10 text-cta px-2 py-0.5 rounded-full font-bold">{c.lowestPrice}</span>
                          )}
                          {offer.id === bestRated.id && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{c.highestRated}</span>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompareRow label={c.insuranceType} icon="🛡️">
                  {offers.map((o) => (
                    <td key={o.id} className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        o.type === "comprehensive" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>{o.typeLabel}</span>
                    </td>
                  ))}
                </CompareRow>

                <CompareRow label={c.annualPrice} icon="💰" highlight>
                  {offers.map((o) => (
                    <td key={o.id} className="p-4 text-center">
                      <p className="text-xl font-bold text-primary">{o.price.toLocaleString()} <span className="text-xs">{c.sar}</span></p>
                      <p className="text-xs text-muted-foreground line-through">{o.originalPrice.toLocaleString()} {c.sar}</p>
                    </td>
                  ))}
                </CompareRow>

                <CompareRow label={c.monthlyPremium} icon="📅">
                  {offers.map((o) => (
                    <td key={o.id} className="p-4 text-center">
                      <p className="font-bold text-foreground">{o.monthlyPrice} <span className="text-xs text-muted-foreground">{c.sarPerMonth}</span></p>
                    </td>
                  ))}
                </CompareRow>

                <CompareRow label={c.discountRate} icon="🏷️">
                  {offers.map((o) => {
                    const d = Math.round(((o.originalPrice - o.price) / o.originalPrice) * 100);
                    return (
                      <td key={o.id} className="p-4 text-center">
                        <span className="text-cta font-bold text-lg">{d}%</span>
                      </td>
                    );
                  })}
                </CompareRow>

                <CompareRow label={c.rating} icon="⭐">
                  {offers.map((o) => (
                    <td key={o.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-foreground">{o.rating}</span>
                        <span className="text-[10px] text-muted-foreground">({o.reviewCount.toLocaleString()})</span>
                      </div>
                    </td>
                  ))}
                </CompareRow>

                <tr>
                  <td colSpan={offers.length + 1} className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{c.coverageAndBenefits}</span>
                    </div>
                  </td>
                </tr>

                {allFeatures.map((feat, idx) => (
                  <CompareRow key={feat} label={feat} alt={idx % 2 === 0}>
                    {offers.map((o) => {
                      const f = o.features.find((x) => x.label === feat);
                      const included = f?.included ?? false;
                      return (
                        <td key={o.id} className="p-4 text-center">
                          {included ? (
                            <div className="w-7 h-7 rounded-full bg-cta/10 flex items-center justify-center mx-auto">
                              <Check className="w-4 h-4 text-cta" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-muted-foreground/30" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </CompareRow>
                ))}

                <tr>
                  <td className="p-4 bg-secondary/50 sticky right-0 z-10" />
                  {offers.map((o) => (
                    <td key={o.id} className="p-4 text-center">
                      <Button
                        onClick={() => handleSelect(o)}
                        className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl px-6 py-5 font-bold text-sm w-full max-w-[180px]"
                      >
                        {c.selectThisOffer}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

const CompareRow = ({
  label, icon, highlight, alt, children,
}: {
  label: string; icon?: string; highlight?: boolean; alt?: boolean; children: React.ReactNode;
}) => (
  <tr className={highlight ? "bg-primary/[0.03]" : alt ? "bg-secondary/30" : ""}>
    <td className={`p-4 text-right text-sm font-medium text-foreground sticky right-0 z-10 ${highlight ? "bg-primary/[0.03]" : alt ? "bg-secondary/30" : "bg-card"}`}>
      <span className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        {label}
      </span>
    </td>
    {children}
  </tr>
);

export default InsuranceCompare;
