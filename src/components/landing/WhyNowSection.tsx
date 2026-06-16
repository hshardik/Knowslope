import { ScrollReveal } from './animations/ScrollReveal';
import { KineticText } from './animations/KineticText';
import { Sparkles, Zap, Brain } from 'lucide-react';

export const WhyNowSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-landing-hero/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-landing-accent-1/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Why Now
            </span>
          </ScrollReveal>

          <KineticText
            text="AI finally makes it possible."
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 text-foreground"
            delay={200}
          />

          <ScrollReveal delay={400}>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              For the first time, AI can ingest unstructured information at scale—conversations, 
              documents, images, transcripts—and extract what matters. KnowSlope operationalizes 
              this breakthrough into a workflow teams actually adopt.
            </p>
          </ScrollReveal>

          {/* Key points */}
          <ScrollReveal delay={600} stagger>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Understands Context</h3>
                  <p className="text-sm text-muted-foreground">
                    AI comprehends meaning, not just keywords
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-landing-accent-1/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-landing-accent-1" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Instant Extraction</h3>
                  <p className="text-sm text-muted-foreground">
                    From raw input to structured Know in seconds
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-landing-accent-2/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-landing-accent-2" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Continuous Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Knowledge compounds, never goes stale
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
