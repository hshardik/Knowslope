import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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

interface KnowPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: KnowPreview | null;
}

const categoryLabels: Record<string, string> = {
  product: 'Product',
  engineering: 'Engineering',
  support: 'Support',
  sales: 'Sales',
  marketing: 'Marketing',
  operations: 'Operations',
};

const typeLabels: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature',
  how_to: 'How To',
  troubleshooting: 'Troubleshooting',
  faq: 'FAQ',
  policy: 'Policy',
};

export const KnowPreviewModal = ({ open, onOpenChange, preview }: KnowPreviewModalProps) => {
  if (!preview) return null;

  const hasAnySections = Object.values(preview.sections).some((s) => s);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <DialogTitle className="text-lg font-semibold">Your Know Preview</DialogTitle>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              AI Generated
            </Badge>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Title */}
            <h1 className="text-2xl font-semibold mb-3">{preview.title}</h1>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge variant="secondary">
                {categoryLabels[preview.category] || preview.category}
              </Badge>
              <Badge variant="outline">
                {typeLabels[preview.type] || preview.type}
              </Badge>
            </div>

            {/* Tags */}
            {preview.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {preview.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Summary */}
            {preview.summary && (
              <div className="rounded-lg border bg-muted/30 p-4 mb-6">
                <h2 className="text-lg font-semibold mb-2">Summary</h2>
                <MarkdownRenderer
                  content={preview.summary}
                  className="text-muted-foreground prose-sm"
                />
              </div>
            )}

            {/* Content Sections */}
            {hasAnySections && (
              <div className="space-y-5">
                {preview.sections.userProblem && (
                  <section>
                    <h2 className="text-lg font-semibold mb-2">User Problem / Question</h2>
                    <MarkdownRenderer content={preview.sections.userProblem} className="text-sm" />
                  </section>
                )}

                {preview.sections.currentBehavior && (
                  <section>
                    <h2 className="text-lg font-semibold mb-2">Current Behavior</h2>
                    <MarkdownRenderer content={preview.sections.currentBehavior} className="text-sm" />
                  </section>
                )}

                {preview.sections.expectedBehavior && (
                  <section>
                    <h2 className="text-lg font-semibold mb-2">Expected Behavior</h2>
                    <MarkdownRenderer content={preview.sections.expectedBehavior} className="text-sm" />
                  </section>
                )}

                {preview.sections.stepsToReproduce && (
                  <section>
                    <h2 className="text-lg font-semibold mb-2">Steps to Reproduce</h2>
                    <MarkdownRenderer content={preview.sections.stepsToReproduce} className="text-sm" />
                  </section>
                )}

                {preview.sections.knownLimitations && (
                  <section>
                    <h2 className="text-lg font-semibold mb-2">Known Limitations</h2>
                    <MarkdownRenderer content={preview.sections.knownLimitations} className="text-sm" />
                  </section>
                )}

                {preview.sections.customerQuotes && (
                  <section>
                    <h2 className="text-lg font-semibold mb-2">Notable Quotes</h2>
                    <div className="border-l-4 border-primary bg-muted/50 rounded-r-lg p-3">
                      <MarkdownRenderer
                        content={preview.sections.customerQuotes}
                        className="text-sm italic"
                      />
                    </div>
                  </section>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Want to save and share your Knows? Sign up for free!
            </p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Link to="/auth">
                <Button size="sm" className="gap-2 group">
                  Sign up free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
