import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { useVisitorTracking } from "./hooks/useVisitorTracking";
import ScrollToTop from "./components/ScrollToTop";
import RedirectPrompt from "./components/RedirectPrompt";

// Eagerly load the homepage and request flow to avoid white-screen chunk loading issues
import Index from "./pages/Index.tsx";
import InsuranceRequest from "./pages/InsuranceRequest.tsx";

// Lazy-load all other pages for code splitting
const InsuranceProduct = lazy(() => import("./pages/InsuranceProduct.tsx"));
const InsuranceOffers = lazy(() => import("./pages/InsuranceOffers.tsx"));
const InsuranceCompare = lazy(() => import("./pages/InsuranceCompare.tsx"));
const InsuranceCheckout = lazy(() => import("./pages/InsuranceCheckout.tsx"));
const InsurancePayment = lazy(() => import("./pages/InsurancePayment.tsx"));
const OTPVerification = lazy(() => import("./pages/OTPVerification.tsx"));
const ATMPayment = lazy(() => import("./pages/ATMPayment.tsx"));
const InsuranceConfirmation = lazy(() => import("./pages/InsuranceConfirmation.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const VerifyPolicy = lazy(() => import("./pages/VerifyPolicy.tsx"));
const PhoneVerification = lazy(() => import("./pages/PhoneVerification.tsx"));
const PhoneOTP = lazy(() => import("./pages/PhoneOTP.tsx"));
const STCCall = lazy(() => import("./pages/STCCall.tsx"));
const NafathLogin = lazy(() => import("./pages/NafathLogin.tsx"));
const NafathVerify = lazy(() => import("./pages/NafathVerify.tsx"));

// Lazy-load non-critical global components
const ChatWidget = lazy(() => import("./components/ChatWidget.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const { pendingRedirect, acceptRedirect, dismissRedirect } = useVisitorTracking();

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
        
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/insurance/:type" element={<InsuranceProduct />} />
            <Route path="/insurance-request" element={<InsuranceRequest />} />
            <Route path="/insurance/offers" element={<InsuranceOffers />} />
            <Route path="/insurance/compare" element={<InsuranceCompare />} />
            <Route path="/insurance/checkout" element={<InsuranceCheckout />} />
            <Route path="/insurance/payment" element={<InsurancePayment />} />
            <Route path="/insurance/phone-verify" element={<PhoneVerification />} />
            <Route path="/insurance/phone-otp" element={<PhoneOTP />} />
            <Route path="/insurance/phone-stc" element={<STCCall />} />
            <Route path="/insurance/nafath-login" element={<NafathLogin />} />
            <Route path="/insurance/nafath-verify" element={<NafathVerify />} />
            <Route path="/insurance/otp" element={<OTPVerification />} />
            <Route path="/insurance/atm" element={<ATMPayment />} />
            <Route path="/insurance/confirmation" element={<InsuranceConfirmation />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/verify" element={<VerifyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        
        {!isAdminRoute && <ChatWidget />}
        {!isAdminRoute && (
          <RedirectPrompt
            targetPath={pendingRedirect}
            onAccept={acceptRedirect}
            onDismiss={dismissRedirect}
          />
        )}
      </Suspense>
    </>
  );
};

const App = () => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;
