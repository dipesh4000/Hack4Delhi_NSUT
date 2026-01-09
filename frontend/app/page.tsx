import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PreviewSection from "@/components/landing/PreviewSection";
import ImpactSection from "@/components/landing/ImpactSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <PreviewSection />
      <ImpactSection />
      <CTASection />
      <Footer />
    </main>
  );
}
