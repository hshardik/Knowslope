import { ScrollReveal } from './animations/ScrollReveal';
import { KineticText } from './animations/KineticText';
import { AlertTriangle, Search, Clock, RefreshCcw } from 'lucide-react';

const problems = [
  {
    icon: AlertTriangle,
    title: 'Knowledge is scattered',
    description: 'Critical information lives in Slack threads, email chains, meeting recordings, and random docs—impossible to find when needed.',
  },
  {
    icon: Clock,
    title: 'Time wasted hunting',
    description: 'Teams spend hours searching for answers that already exist somewhere, asking the same questions repeatedly.',
  },
  {
    icon: RefreshCcw,
    title: 'Documentation fails',
    description: 'Traditional documentation requires writing from scratch, reviewing, and maintaining—it simply doesn\'t scale.',
  },
];

export const ProblemSection = () => {
  return (
    <section id="product" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <ScrollReveal>
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              The Problem
            </span>
          </ScrollReveal>
          
          <KineticText
            text="Knowledge is scattered and unsearchable."
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            delay={200}
          />
          
          <ScrollReveal delay={400}>
            <p className="text-lg text-muted-foreground">
              Your company's most valuable asset—institutional knowledge—is buried and fragmented.
            </p>
          </ScrollReveal>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <ScrollReveal key={problem.title} delay={200 + index * 150}>
              <div className="group h-full">
                <div className="relative h-full bg-card border border-border rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:border-destructive/30 hover:shadow-lg hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-6 group-hover:bg-destructive/20 transition-colors">
                    <problem.icon className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Before → After visual */}
        <ScrollReveal delay={800}>
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="relative bg-card border border-border rounded-2xl p-8 lg:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Before */}
                <div className="text-center md:text-left">
                  <span className="inline-block px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
                    Before
                  </span>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Search className="w-5 h-5 flex-shrink-0" />
                      <span className="line-through">"Where did we discuss that?"</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Search className="w-5 h-5 flex-shrink-0" />
                      <span className="line-through">"Check the old Slack thread..."</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Search className="w-5 h-5 flex-shrink-0" />
                      <span className="line-through">"I think someone wrote a doc..."</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-0.5 h-24 bg-gradient-to-b from-transparent via-border to-transparent" />
                </div>

                {/* After */}
                <div className="text-center md:text-left">
                  <span className="inline-block px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
                    After
                  </span>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-success/20 flex items-center justify-center">
                        <span className="text-success text-xs">✓</span>
                      </span>
                      <span className="font-medium">Search → Find the Know</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-success/20 flex items-center justify-center">
                        <span className="text-success text-xs">✓</span>
                      </span>
                      <span className="font-medium">Share the link → Done</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-success/20 flex items-center justify-center">
                        <span className="text-success text-xs">✓</span>
                      </span>
                      <span className="font-medium">Always current, always findable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
