import { Header } from "@/components/marketing/header";
import {
  BridgeAnalogy,
  Hero,
  HowItWorks,
  Problem,
} from "@/components/marketing/sections";
import {
  Benefits,
  Chats,
  Demo,
  FinalCTA,
  Footer,
  Industries,
} from "@/components/marketing/sections-more";
import { FAQ } from "@/components/marketing/faq";

export default function Home() {
  return (
    <div className="marketing" id="top">
      <Header />
      <main>
        <Hero />
        <Problem />
        <BridgeAnalogy />
        <HowItWorks />
        <Chats />
        <Benefits />
        <Demo />
        <Industries />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
