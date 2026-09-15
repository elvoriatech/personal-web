import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { SelectedWork } from "@/components/site/SelectedWork";
import { WhyMe } from "@/components/site/WhyMe";
import { Process } from "@/components/site/Process";
import { Testimonials } from "@/components/site/Testimonials";
import { Audiences } from "@/components/site/Audiences";
import { Packages } from "@/components/site/Packages";
import { Faq } from "@/components/site/Faq";
import { Experience } from "@/components/site/Experience";
import { Expertise } from "@/components/site/Expertise";
import { ContactCTA } from "@/components/site/ContactCTA";
import { Footer } from "@/components/site/Footer";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";

/**
 * Ordered for a prospective client: what I solve, proof, why me, how it
 * works, what it costs, then the career detail and stack for the engineers
 * and recruiters who read that far.
 */
export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <SelectedWork />
        <WhyMe />
        <Process />
        <Testimonials />
        <Audiences />
        <Packages />
        <Faq />
        <Experience />
        <Expertise />
        <ContactCTA />
      </main>
      <Footer />
      <HomeJsonLd />
    </>
  );
}
