import { motion } from "framer-motion";
import { Shield, Users, Award, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import BcareLogo from "@/assets/Bcare-logo.svg";

const stats = [
  { value: "+500K", label: "عميل مؤمّن" },
  { value: "+50", label: "شريك تأمين" },
  { value: "24/7", label: "دعم فني" },
  { value: "+10", label: "سنوات خبرة" },
];

const values = [
  { icon: Shield, title: "الأمان", description: "نضع أمانك في المقام الأول ونوفر لك أفضل التغطيات التأمينية" },
  { icon: Users, title: "الشفافية", description: "نؤمن بالوضوح التام في جميع تعاملاتنا مع عملائنا" },
  { icon: Award, title: "الجودة", description: "نسعى دائماً لتقديم أعلى مستويات الخدمة والجودة" },
  { icon: Target, title: "الابتكار", description: "نستخدم أحدث التقنيات لتسهيل تجربتك التأمينية" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PremiumPageHeader
        title="عن بي كير"
        subtitle="المنصة الأذكى لمقارنة عروض التأمين في المملكة العربية السعودية"
        badge="تعرّف علينا"
        badgeIcon={<Shield className="w-3.5 h-3.5 text-cta" />}
      />

      {/* Stats */}
      <section className="py-16 bg-background -mt-8 relative z-10">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all"
              >
                <span className="text-4xl md:text-5xl font-bold text-primary block mb-2">{stat.value}</span>
                <span className="text-muted-foreground font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-secondary">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">قصتنا</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              تأسست بي كير كمنصة رقمية مبتكرة تهدف إلى تبسيط عملية التأمين في المملكة العربية السعودية.
              نؤمن بأن الحصول على التأمين المناسب يجب أن يكون سهلاً وسريعاً وبأسعار تنافسية.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              بصفتنا تابعين لشركة التعاونية للتأمين، نجمع بين الخبرة العريقة والتكنولوجيا الحديثة
              لنقدم لك تجربة تأمينية فريدة من نوعها.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-3xl bg-card border border-border hover:shadow-lg hover:border-cta/20 transition-all">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission - uses premium header bg */}
      <PremiumPageHeader title="رؤيتنا ورسالتنا" compact>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10 text-right">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10">
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">رؤيتنا</h3>
            <p className="text-primary-foreground/80 leading-relaxed">
              أن نكون المنصة الرقمية الرائدة في تقديم حلول التأمين في المملكة العربية السعودية والمنطقة.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10">
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">رسالتنا</h3>
            <p className="text-primary-foreground/80 leading-relaxed">
              تمكين الأفراد والشركات من الحصول على التأمين المناسب بسهولة وشفافية من خلال التكنولوجيا المتقدمة.
            </p>
          </motion.div>
        </div>
      </PremiumPageHeader>

      <Footer />
    </div>
  );
};

export default About;
