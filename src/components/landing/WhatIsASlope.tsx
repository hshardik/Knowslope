import { ScrollReveal } from './animations/ScrollReveal';
import { KineticText } from './animations/KineticText';
import { Compass, Layers, Shield, Settings2, Sparkles } from 'lucide-react';

const slopeFeatures = [
  {
    icon: Compass,
    title: 'Intent + Constraints',
    description: 'Define what you want and set boundaries for the AI output.',
  },
  {
    icon: Layers,
    title: 'Reusable Output Shape',
    description: 'Package your preferred formats so every output is consistent.',
  },
  {
    icon: Shield,
    title: 'You Stay in Control',
    description: 'AI drafts along the slope, but you review, tweak, and publish.',
  },
];

export const WhatIsASlope = () => {
  return (
    <section id="slopes" className="py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-landing-accent-1/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <ScrollReveal>
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                What's a Slope?
              </span>
            </ScrollReveal>

            <KineticText
              text="Slopes encode your rules."
              as="h2"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
              delay={200}
            />

            <ScrollReveal delay={400}>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                <strong className="text-foreground">Knows</strong> are what your team knows—threads, docs, screenshots, decisions.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                <strong className="text-foreground">Slopes</strong> are the direction you want that knowledge to take—your intent, rules, and style that guide how the AI turns knowledge into something useful.
              </p>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed border-l-2 border-primary/30 pl-4 italic">
                A Slope is not just a prompt. It's your intent + constraints + preferred output shape, packaged into something reusable.
              </p>
            </ScrollReveal>

            {/* Features */}
            <ScrollReveal delay={600} stagger>
              <div className="space-y-4">
                {slopeFeatures.map((feature) => (
                  <div 
                    key={feature.title}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-card transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Visual mockup */}
          <ScrollReveal delay={400}>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-landing-accent-1/20 rounded-3xl blur-2xl opacity-50" />
              
              {/* Mockup card - Slope Configuration */}
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold">Configure Slope</span>
                </div>

                {/* Slope configuration form */}
                <div className="p-4 space-y-4">
                  {/* Slope name */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slope Name</label>
                    <div className="px-3 py-2 bg-muted rounded-lg text-sm">Customer FAQ Generator</div>
                  </div>

                  {/* Intent */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Intent</label>
                    <div className="px-3 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
                      Transform support conversations into customer-facing FAQs
                    </div>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tone & Style</label>
                    <div className="flex flex-wrap gap-2">
                      {['Friendly', 'Professional', 'Concise'].map((tone) => (
                        <span 
                          key={tone}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {tone}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Output format */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Output Format</label>
                    <div className="px-3 py-2 bg-muted rounded-lg text-sm font-mono text-xs text-muted-foreground">
                      Q: [Question]<br/>
                      A: [Answer in 2-3 sentences]
                    </div>
                  </div>

                  {/* Rules */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rules & Constraints</label>
                    <div className="space-y-1.5">
                      {[
                        'No internal jargon',
                        'Max 100 words per answer',
                        'Include related links when relevant',
                      ].map((rule) => (
                        <div key={rule} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>AI will draft, you review & publish</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                    Save Slope
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
