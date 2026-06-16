import { Link } from 'react-router-dom';
import { ScrollReveal } from './animations/ScrollReveal';
import { KineticText } from './animations/KineticText';
import { Button } from '@/components/ui/button';
import { RequestDemoDialog } from './RequestDemoDialog';
import { ArrowRight, Shield, Lock, Server } from 'lucide-react';

export const FinalCTA = () => {
  return (
    <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <KineticText text="Ready to transform chaos into clarity?" as="h2" className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" />
          
          <ScrollReveal delay={400}>
            <p className="text-lg text-muted-foreground mb-10">
              Join teams who've stopped searching and started knowing.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/auth">
                <Button size="lg" className="btn-press glow text-base px-8 h-12 gap-2 group">
                  Create a Know
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <RequestDemoDialog
                trigger={
                  <Button size="lg" variant="outline" className="btn-press text-base px-8 h-12">
                    Request Demo
                  </Button>
                }
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={800}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span>Security-first</span></div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4" /><span>Private by default</span></div>
              <div className="flex items-center gap-2"><Server className="w-4 h-4" /><span>Enterprise-ready</span></div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
