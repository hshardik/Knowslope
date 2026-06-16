import { useState } from 'react';
import { ScrollReveal } from './animations/ScrollReveal';
import { KineticText } from './animations/KineticText';
import { Button } from '@/components/ui/button';
import { FileText, Search, Share2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { KnowPreviewModal } from './KnowPreviewModal';
import { toast } from 'sonner';

interface KnowPreview {
  title: string;
  summary: string;
  category: string;
  type: string;
  tags: string[];
  sections: {
    userProblem: string;
    currentBehavior: string;
    expectedBehavior: string;
    stepsToReproduce: string;
    knownLimitations: string;
    customerQuotes: string;
  };
}

const knowFeatures = [
  {
    icon: FileText,
    title: 'Structured Knowledge Asset',
    description: 'Generated from conversations, documents, images, video transcripts, and more. Any input becomes a clean, organized Know.',
    color: 'primary',
  },
  {
    icon: Search,
    title: 'Instantly Discoverable',
    description: 'Automatically tagged, categorized, and optimized for search. Find any Know in seconds, not hours.',
    color: 'landing-accent-1',
  },
  {
    icon: Share2,
    title: 'Built to Share',
    description: 'Link-shareable with granular access controls. Share with your team, specific users, or make it public.',
    color: 'landing-accent-2',
  },
];

export const WhatIsAKnow = () => {
  const [demoInput, setDemoInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<KnowPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemo = async () => {
    if (!demoInput.trim() || demoInput.trim().length < 20) {
      setError('Please enter at least 20 characters');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-know-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ content: demoInput }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw new Error(data.error || 'Failed to generate preview');
      }

      if (data.success && data.data) {
        setPreview(data.data);
        setShowPreview(true);
        setDemoInput(''); // Clear input after successful generation
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="knows" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <ScrollReveal>
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              What's a Know?
            </span>
          </ScrollReveal>

          <KineticText
            text="A Know is your atomic unit of knowledge."
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            delay={200}
          />

          <ScrollReveal delay={400}>
            <p className="text-lg text-muted-foreground">
              Think of it as a clean, searchable answer or document—generated automatically 
              from any source you throw at it.
            </p>
          </ScrollReveal>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-16">
          {knowFeatures.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={200 + index * 150}>
              <div className="group h-full">
                <div className={`relative h-full bg-card border border-border rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:border-${feature.color}/30 hover:shadow-lg hover:-translate-y-1`}>
                  <div className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Mini demo panel */}
        <ScrollReveal delay={800}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold">Try it: Paste anything → Generate a Know</span>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={demoInput}
                    onChange={(e) => {
                      setDemoInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="Paste a Slack thread, meeting notes, email, conversation, or any text you want to transform into structured knowledge..."
                    className={`w-full h-32 px-4 py-3 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      error ? 'border-destructive' : 'border-input'
                    }`}
                    disabled={isGenerating}
                  />
                  {error && (
                    <div className="flex items-center gap-1.5 mt-2 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {isGenerating 
                      ? 'AI is analyzing your content...' 
                      : `${demoInput.length}/5000 characters`
                    }
                  </span>
                  <Button 
                    onClick={handleDemo}
                    disabled={!demoInput.trim() || demoInput.trim().length < 20 || isGenerating}
                    className="btn-press gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Know
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Preview Modal */}
      <KnowPreviewModal 
        open={showPreview} 
        onOpenChange={setShowPreview} 
        preview={preview} 
      />
    </section>
  );
};
