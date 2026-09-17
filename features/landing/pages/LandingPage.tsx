// LandingPage — superficie pública de la feature landing (features/landing/pages),
// la única que app/ puede importar (sección 5.4 / .eslintrc.cjs). Ensambla las
// secciones en el orden fijado para la landing pública: Navbar, Hero, Problema,
// Cómo funciona, Ecosistema, Coach IA, Evolución, CTA final, Footer.
import {
  LandingNavbar,
  HeroSection,
  ProblemSection,
  HowItWorksSection,
  EcosystemSection,
  CoachSection,
  EvolutionSection,
  FinalCtaSection,
  LandingFooter,
} from "../components";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-0">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <EcosystemSection />
        <CoachSection />
        <EvolutionSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
