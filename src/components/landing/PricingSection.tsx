import { ScrollReveal } from './animations/ScrollReveal';
import { KineticText } from './animations/KineticText';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with KnowSlope',
    features: ['Up to 50 Knows', '1 KnowSlope', 'Basic search', 'Community support'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Team',
    price: '$29',
    period: '/user/mo',
    description: 'For growing teams',
    features: ['Unlimited Knows', '10 KnowSlopes', 'Advanced search & filters', 'Collaboration tools', 'Priority support'],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations at scale',
    features: ['Everything in Team', 'Custom domains', 'SSO & governance', 'API access', 'Dedicated support'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">Pricing</span>
          </ScrollReveal>
          <KineticText text="Simple, transparent pricing." as="h2" className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" delay={200} />
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <ScrollReveal key={tier.name} delay={200 + index * 100}>
              <div className={`relative h-full bg-card border rounded-2xl p-6 lg:p-8 transition-all hover:shadow-lg ${tier.popular ? 'border-primary glow' : 'border-border'}`}>
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">Most Popular</span>
                )}
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground text-sm">{tier.period}</span>}
                </div>
                <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full btn-press ${tier.popular ? '' : 'variant-outline'}`} variant={tier.popular ? 'default' : 'outline'}>
                  {tier.cta}
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
