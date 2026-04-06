import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import VoiceSection from "@/components/VoiceSection";
import AdaptiveEngine from "@/components/AdaptiveEngine";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <VoiceSection />
      <AdaptiveEngine />
      <Testimonials />
      <CTASection />
      <Footer />
    </>
  );
}
