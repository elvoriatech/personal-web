import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { SelectedWork } from "@/components/site/SelectedWork";
import { Services } from "@/components/site/Services";
import { PullQuote } from "@/components/site/PullQuote";
import { Expertise } from "@/components/site/Expertise";
import { Experience } from "@/components/site/Experience";
import { Process } from "@/components/site/Process";
import { ContactCTA } from "@/components/site/ContactCTA";
import { Footer } from "@/components/site/Footer";

export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <SelectedWork />
        <Services />
        <PullQuote />
        <Expertise />
        <Experience />
        <Process />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
