import { useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PartnersStrip from "@/components/PartnersStrip";
import WhyChooseUs from "@/components/WhyChooseUs";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";

import BCareWhySection from "@/components/BCareWhySection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import PullToRefresh from "@/components/PullToRefresh";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("vehicles");

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("تم تحديث الصفحة", { icon: "🔄", duration: 1500 });
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroSection onTabChange={setActiveTab} />
        <PartnersStrip />
        <WhyChooseUs activeTab={activeTab} />
        
        <StatsSection />
        <TestimonialsSection />
        
        <BCareWhySection />
        <FAQSection />
        <Footer />
      </div>
    </PullToRefresh>
  );
};

export default Index;
