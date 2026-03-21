import Hero from "@/components/hero";
import Features from "@/components/features";
import Stats from "@/components/stats";
import Villages from "@/components/villages";
import TechShowcase from "@/components/tech-showcase";
import Showcase from "@/components/showcase";
import BusinessSolutions from "@/components/business-solutions";
import Testimonials from "@/components/testimonials";
import Faq from "@/components/faq";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-dvh">
      <Hero />
      <Features />
      <Stats />
      <TechShowcase />
      <Showcase />
      <BusinessSolutions />
      <Villages />
      <Testimonials />
      <Faq />
      <Footer />
    </main>
  );
}
