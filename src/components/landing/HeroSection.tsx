import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { KineticText } from './animations/KineticText';
import { ScrollReveal } from './animations/ScrollReveal';
import { Hero3DElement } from './Hero3DElement';
import { ArrowRight, Play, FileText, MessageSquare, Mail, FolderOpen, Sparkles, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

// Animated scattered documents icon - Large version
const ScatteredAnimation = () => {
  const items = [
    { Icon: FileText, x: -28, y: -20, rotate: -25, delay: 0 },
    { Icon: MessageSquare, x: 22, y: -24, rotate: 15, delay: 0.1 },
    { Icon: Mail, x: -20, y: 18, rotate: -10, delay: 0.2 },
    { Icon: FolderOpen, x: 26, y: 14, rotate: 20, delay: 0.15 },
  ];

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {items.map(({ Icon, x, y, rotate, delay }, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
          animate={{ 
            x: [0, x, x * 0.8, x],
            y: [0, y, y * 0.8, y],
            rotate: [0, rotate, rotate * 0.9, rotate],
            opacity: [0, 1, 1, 0.7]
          }}
          transition={{
            duration: 3,
            delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <Icon className="w-8 h-8 text-destructive/80" />
        </motion.div>
      ))}
    </div>
  );
};

// Animated organized/structured icon - Stacked cards design
const KnowsAnimation = () => {
  const cards = [
    { y: 16, scale: 0.85, opacity: 0.4, delay: 0.3 },
    { y: 8, scale: 0.92, opacity: 0.6, delay: 0.15 },
    { y: 0, scale: 1, opacity: 1, delay: 0 },
  ];

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Stacked cards with assembly animation */}
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ y: 30, opacity: 0, scale: 0.7 }}
          animate={{ 
            y: [30, card.y, card.y - 2, card.y],
            opacity: [0, card.opacity, card.opacity, card.opacity],
            scale: [0.7, card.scale, card.scale * 1.02, card.scale],
          }}
          transition={{
            duration: 2.5,
            delay: card.delay,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeOut"
          }}
        >
          <div 
            className="w-14 h-10 rounded-lg border-2 border-primary/60 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm shadow-lg"
            style={{ 
              boxShadow: i === 2 ? '0 0 20px hsl(var(--primary) / 0.4)' : 'none'
            }}
          >
            {/* Document lines */}
            <div className="p-2 space-y-1.5">
              <div className="h-1 w-8 bg-primary/50 rounded-full" />
              <div className="h-1 w-6 bg-primary/30 rounded-full" />
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Checkmark that appears after stacking */}
      <motion.div
        className="absolute -top-1 -right-1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2.5,
          delay: 0.8,
          repeat: Infinity,
          repeatDelay: 1,
          times: [0, 0.2, 0.4, 1],
        }}
      >
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>
      
      {/* Glow pulse behind */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/20 blur-xl"
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
    </div>
  );
};

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* 3D Element */}
      <Hero3DElement />
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      
      {/* Animated blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-landing-hero/20 blob blob-animate blur-3xl opacity-60" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-landing-hero-glow/20 blob blob-animate blur-3xl opacity-50" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm border border-border mb-8">
              <span className="w-2 h-2 rounded-full bg-landing-accent-1 animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                AI-powered knowledge management
              </span>
            </div>
          </ScrollReveal>

          {/* Main headline with kinetic typography */}
          <div className="mb-6">
            <KineticText
              text="Turn organizational chaos into searchable knowledge."
              as="h1"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              delay={200}
            />
          </div>

          {/* Subheadline */}
          <ScrollReveal delay={600}>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Unstructured information scattered everywhere? KnowSlope transforms it into{' '}
              <span className="text-foreground font-semibold">Knows</span>—clean, structured, 
              instantly searchable knowledge assets.
            </p>
          </ScrollReveal>

          {/* CTA buttons */}
          <ScrollReveal delay={800}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="btn-press glow text-base px-8 h-12 gap-2 group"
                >
                  Create a Know
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-press text-base px-8 h-12 gap-2 group"
                onClick={() => document.querySelector('#knows')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-4 h-4" />
                See how it works
              </Button>
            </div>
          </ScrollReveal>

          {/* Visual element - Knowledge transformation */}
          <ScrollReveal delay={1000}>
            <div className="mt-16 lg:mt-24 relative">
              {/* Floating cards showing transformation */}
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-4xl mx-auto">
                {/* Before: Chaos */}
                <motion.div 
                  className="relative group flex-1 max-w-sm"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 via-destructive/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-full bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border border-destructive/30 rounded-2xl p-6 shadow-lg overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                          backgroundSize: '10px 10px',
                        }}
                        animate={{ backgroundPosition: ['0px 0px', '10px 10px'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                    
                    <div className="relative flex flex-col items-center gap-4">
                      <div className="w-28 h-28 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0 border border-destructive/20">
                        <ScatteredAnimation />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-xl mb-1 text-destructive">Scattered</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Messages, docs, and transcripts lost across tools
                        </p>
                      </div>
                    </div>
                    
                    {/* Decorative scattered elements */}
                    <motion.div 
                      className="absolute -bottom-2 -right-2 w-16 h-16 text-destructive/10"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <FileText className="w-full h-full" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Arrow - centered vertically */}
                <div className="flex items-center justify-center py-4 md:py-0">
                  <motion.div 
                    className="flex md:flex-col items-center gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-12 md:w-0.5 h-0.5 md:h-12 bg-gradient-to-r md:bg-gradient-to-b from-destructive/50 via-muted-foreground/30 to-primary/80" />
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 text-primary rotate-0 md:rotate-0" />
                    </motion.div>
                    <div className="w-12 md:w-0.5 h-0.5 md:h-12 bg-gradient-to-r md:bg-gradient-to-b from-primary/80 to-primary" />
                  </motion.div>
                </div>

                {/* After: Structured */}
                <motion.div 
                  className="relative group flex-1 max-w-sm"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/15 to-transparent rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-full bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border border-primary/40 rounded-2xl p-6 shadow-lg ring-1 ring-primary/20 overflow-hidden">
                    {/* Animated glow effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    
                    <div className="relative flex flex-col items-center gap-4">
                      <div className="w-28 h-28 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/30">
                        <KnowsAnimation />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-xl mb-1 text-gradient">Knows</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Clean, structured, searchable knowledge
                        </p>
                      </div>
                    </div>
                    
                    {/* Decorative organized element */}
                    <motion.div 
                      className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/10"
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Layers className="w-full h-full" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
};
