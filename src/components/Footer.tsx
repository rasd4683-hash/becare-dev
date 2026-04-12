import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import BcareLogo from "@/assets/Bcare-logo.svg";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground py-6 pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top: Logo + Phone + Payment + App stores */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-primary-foreground/15">
          <div className="flex items-center gap-4">
            <img src={BcareLogo} alt="BCare" className="h-7 brightness-0 invert" />
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cta" />
              <span className="text-sm font-extrabold" dir="ltr">{t.footer.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {["Apple Pay", "Visa", "Mastercard", "مدى", "tabby", "سداد"].map((m) => (
              <span key={m} className="text-[9px] bg-primary-foreground/10 px-2 py-1 rounded text-primary-foreground/70 font-medium">
                {m}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {["Google Play", "App Store", "AppGallery"].map((store) => (
              <span key={store} className="text-[9px] bg-primary-foreground/10 px-2 py-1.5 rounded-md text-primary-foreground/60 font-medium">
                {store}
              </span>
            ))}
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <h4 className="font-bold text-xs mb-2 text-cta">{t.footer.aboutBcare}</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.aboutLinks.privacy}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.aboutLinks.terms}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.aboutLinks.careers}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs mb-2 text-cta">{t.footer.products}</h4>
            <ul className="space-y-1.5">
              <li><Link to="/" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.vehicles}</Link></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.medical}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.travel}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.malpractice}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.domestic}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs mb-2 text-cta">{t.footer.support}</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.supportLinks.blog}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.supportLinks.cancelPolicy}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.supportLinks.ticket}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs mb-2 text-cta">{t.footer.importantLinks}</h4>
            <ul className="space-y-1.5">
              <li><a href="https://ia.gov.sa" target="_blank" rel="noopener" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.importantLinksItems.authority}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.importantLinksItems.complaint}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.importantLinksItems.rules}</a></li>
              <li><a href="#" className="text-[11px] text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.importantLinksItems.vat}</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/15 pt-3 text-center">
          <p className="text-[10px] text-primary-foreground/50">
            {new Date().getFullYear()} © {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
