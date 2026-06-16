import { ScrollReveal } from './animations/ScrollReveal';
import { KineticText } from './animations/KineticText';
import { Search, Grid3X3, BookOpen, Users, Globe } from 'lucide-react';

const useCases = [
  { icon: BookOpen, label: 'Internal Wikis', description: 'Team knowledge that stays current' },
  { icon: Users, label: 'Client Portals', description: 'Shared spaces for stakeholders' },
  { icon: Globe, label: 'Public Knowledge Bases', description: 'Help centers that update themselves' },
];

export const WhatIsAKnowSlope = () => {
  return (
    <section id="knowslopes" className="py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-landing-hero/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <ScrollReveal>
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                What's a KnowSlope?
              </span>
            </ScrollReveal>

            <KineticText
              text="Your knowledge hub."
              as="h2"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
              delay={200}
            />

            <ScrollReveal delay={400}>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                A KnowSlope is a private or public hub where your Knows live—searchable, 
                organized, and always up to date. It's your team's single source of truth.
              </p>
            </ScrollReveal>

            {/* Use cases */}
            <ScrollReveal delay={600} stagger>
              <div className="space-y-4">
                {useCases.map((useCase) => (
                  <div 
                    key={useCase.label}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-card transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <useCase.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{useCase.label}</h3>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
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
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-landing-hero-glow/20 rounded-3xl blur-2xl opacity-50" />
              
              {/* Mockup card */}
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Grid3X3 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold">Engineering KnowSlope</span>
                </div>

                {/* Search bar */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-lg">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Search all Knows...</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="p-4 border-b border-border">
                  <div className="flex flex-wrap gap-2">
                    {['All', 'How-To', 'Troubleshooting', 'FAQs', 'Features'].map((cat, i) => (
                      <span 
                        key={cat}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          i === 0 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Know items */}
                <div className="p-4 space-y-3">
                  {[
                    { title: 'API Rate Limiting Guide', tag: 'How-To', views: '234' },
                    { title: 'Database Migration Steps', tag: 'How-To', views: '189' },
                    { title: 'Auth Token Troubleshooting', tag: 'Troubleshooting', views: '156' },
                  ].map((know) => (
                    <div 
                      key={know.title}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <span className="text-sm">📄</span>
                        </div>
                        <div>
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">
                            {know.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {know.tag}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{know.views} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
