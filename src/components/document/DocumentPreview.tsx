import { Badge } from "@/components/ui/badge";
import { Link2 } from "lucide-react";
import { DraftDocument } from "@/pages/NewDocWizard";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface DocumentPreviewProps {
  draftDoc: DraftDocument;
  isPreviewMode?: boolean;
}

const categoryLabels: Record<string, string> = {
  product: "Product",
  engineering: "Engineering",
  support: "Support",
  sales: "Sales",
  marketing: "Marketing",
  operations: "Operations",
};

const typeLabels: Record<string, string> = {
  bug: "Bug",
  feature: "Feature",
  how_to: "How To",
  troubleshooting: "Troubleshooting",
  faq: "FAQ",
  policy: "Policy",
};

export const DocumentPreview = ({ draftDoc, isPreviewMode = true }: DocumentPreviewProps) => {
  const hasAnySections = Object.values(draftDoc.sections).some((s) => s);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-muted-foreground">Live Preview</h3>
          {isPreviewMode && (
            <Badge variant="outline" className="text-xs">
              Read-only
            </Badge>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-semibold mb-3">
            {draftDoc.title || "Untitled Document"}
          </h1>
          
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="secondary">
              {categoryLabels[draftDoc.category] || draftDoc.category}
            </Badge>
            <Badge variant="outline">
              {typeLabels[draftDoc.type] || draftDoc.type}
            </Badge>
            <Badge 
              variant="outline" 
              className="bg-status-draft-bg text-status-draft border-status-draft/20"
            >
              Draft Preview
            </Badge>
          </div>
          
          {draftDoc.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draftDoc.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Screenshots */}
        {draftDoc.screenshots.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Screenshots</h2>
            <div className="grid grid-cols-2 gap-3">
              {draftDoc.screenshots.map((screenshot, idx) => (
                <img
                  key={idx}
                  src={screenshot}
                  alt={`Screenshot ${idx + 1}`}
                  className="rounded-lg border w-full object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {draftDoc.summary && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <MarkdownRenderer 
              content={draftDoc.summary} 
              className="text-muted-foreground prose-sm"
            />
          </div>
        )}

        {/* Content Sections */}
        {hasAnySections && (
          <div className="space-y-5">
            {draftDoc.sections.userProblem && (
              <section>
                <h2 className="text-lg font-semibold mb-2">User Problem / Question</h2>
                <MarkdownRenderer content={draftDoc.sections.userProblem} className="text-sm" />
              </section>
            )}

            {draftDoc.sections.currentBehavior && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Current Behavior</h2>
                <MarkdownRenderer content={draftDoc.sections.currentBehavior} className="text-sm" />
              </section>
            )}

            {draftDoc.sections.expectedBehavior && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Expected Behavior / Intended Design</h2>
                <MarkdownRenderer content={draftDoc.sections.expectedBehavior} className="text-sm" />
              </section>
            )}

            {draftDoc.sections.stepsToReproduce && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Steps to Reproduce or Use</h2>
                <MarkdownRenderer content={draftDoc.sections.stepsToReproduce} className="text-sm" />
              </section>
            )}

            {draftDoc.sections.knownLimitations && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Known Limitations / Edge Cases</h2>
                <MarkdownRenderer content={draftDoc.sections.knownLimitations} className="text-sm" />
              </section>
            )}

            {draftDoc.sections.customerQuotes && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Customer Quotes</h2>
                <div className="border-l-4 border-primary bg-muted/50 rounded-r-lg p-3">
                  <MarkdownRenderer content={draftDoc.sections.customerQuotes} className="text-sm italic" />
                </div>
              </section>
            )}
          </div>
        )}

        {/* Empty State */}
        {!draftDoc.title && !draftDoc.summary && !hasAnySections && draftDoc.screenshots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Start editing to see your document preview</p>
          </div>
        )}

        {/* Source Thread */}
        {draftDoc.slackUrl && (
          <section className="border-t pt-5">
            <h3 className="font-semibold mb-2 text-sm">Original Slack Discussion</h3>
            <div className="rounded-lg border bg-muted/30 p-3">
              <a
                href={draftDoc.slackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Link2 className="h-4 w-4" />
                Open full thread in Slack
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
