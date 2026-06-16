import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { WhyNowSection } from '@/components/landing/WhyNowSection';
import { WhatIsAKnow } from '@/components/landing/WhatIsAKnow';
import { WhatIsASlope } from '@/components/landing/WhatIsASlope';
import { WhatIsAKnowSlope } from '@/components/landing/WhatIsAKnowSlope';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <WhyNowSection />
        <WhatIsAKnow />
        <WhatIsASlope />
        <WhatIsAKnowSlope />
        <PricingSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;
