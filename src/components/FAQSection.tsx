import { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";

const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState("buying");
  const { t, isRTL } = useLanguage();

  const categories = [
    { id: "buying", label: t.faq.categories.buying },
    { id: "terms", label: t.faq.categories.terms },
    { id: "claims", label: t.faq.categories.claims },
  ];

  const faqData: Record<string, { question: string; answer: string }[]> = {
    buying: t.faq.buying,
    terms: t.faq.terms,
    claims: t.faq.claims,
  };

  return (
    <section className="py-6 md:py-8 bg-background">
      <div className="section-container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {t.faq.title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-2 mb-4"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqData[activeCategory]?.map((faq, index) => (
              <AccordionItem
                key={`${activeCategory}-${index}`}
                value={`${activeCategory}-${index}`}
                className="border border-border rounded-xl px-4 data-[state=open]:bg-secondary/50"
              >
                <AccordionTrigger className={`${isRTL ? "text-right" : "text-left"} text-sm font-bold hover:no-underline py-3`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs leading-relaxed pb-3">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
