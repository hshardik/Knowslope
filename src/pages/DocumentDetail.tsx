import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Edit, MoreVertical, Link2, ThumbsUp, ThumbsDown, MessageSquare, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDocument, usePublishDocument, useUnpublishDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { useIsWhitelisted } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import ImageLightbox from "@/components/ImageLightbox";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

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

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: document, isLoading, error } = useDocument(id || "");
  const { data: isWhitelisted } = useIsWhitelisted();
  const publishDocument = usePublishDocument();
  const unpublishDocument = useUnpublishDocument();
  const deleteDocument = useDeleteDocument();
  
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Document not found</h1>
        <p className="text-muted-foreground">The document you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate("/knowslope")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to KnowSlope
        </Button>
      </div>
    );
  }

  // Extract sections from content JSONB field
  const sections = {
    userProblem: document.content?.sections?.userProblem || "",
    currentBehavior: document.content?.sections?.currentBehavior || "",
    expectedBehavior: document.content?.sections?.expectedBehavior || "",
    stepsToReproduce: document.content?.sections?.stepsToReproduce || "",
    knownLimitations: document.content?.sections?.knownLimitations || "",
    customerQuotes: document.content?.sections?.customerQuotes || "",
  };

  const hasAnySections = Object.values(sections).some((s) => s);
  const ownerName = document.creator?.full_name || document.creator?.email || "Unknown";
  const tags = document.tags || [];
  const screenshots = document.screenshots || [];
  
  const screenshotImages = screenshots.map((src, idx) => ({
    src,
    alt: `Screenshot ${idx + 1}`,
  }));
  
  
  const canEdit = document.status === "draft" && 
    (document.creator_id === user?.id || document.visibility === "team");
  
  const canPublish = document.status === "draft";
  const canUnpublish = document.status === "published" && isWhitelisted;

  const handlePublishClick = () => {
    if (!isWhitelisted) {
      setShowUnauthorizedDialog(true);
    } else {
      setShowPublishDialog(true);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    await publishDocument.mutateAsync(id);
    setShowPublishDialog(false);
  };

  const handleUnpublish = async () => {
    if (!id) return;
    await unpublishDocument.mutateAsync(id);
    setShowUnpublishDialog(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteDocument.mutateAsync(id);
    setShowDeleteDialog(false);
    navigate("/knowslope");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/knowslope")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Hub
            </Button>

            <div className="flex items-center gap-2">
              {canEdit && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => navigate(`/knowslope/${id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              
              {canPublish && (
                <Button 
                  className="gap-2"
                  onClick={handlePublishClick}
                  disabled={publishDocument.isPending}
                >
                  {publishDocument.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Publish
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem>Create new version from this doc</DropdownMenuItem>
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                  {canUnpublish && (
                    <DropdownMenuItem onClick={() => setShowUnpublishDialog(true)}>
                      Unpublish (return to draft)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Title & Metadata */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-4">{document.title}</h1>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge variant="secondary">{categoryLabels[document.category] || document.category}</Badge>
            <Badge variant="outline">{typeLabels[document.type] || document.type}</Badge>
            <Badge 
              className={document.status === "published" 
                ? "bg-status-published-bg text-status-published border-status-published/20" 
                : "bg-status-draft-bg text-status-draft border-status-draft/20"
              }
            >
              {document.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span>Last updated {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}</span>
            <span>·</span>
            <span>Created by {ownerName}</span>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Screenshots - Displayed prominently at the top */}
        {screenshots.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Screenshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screenshots.map((screenshot, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="relative group overflow-hidden rounded-lg border w-full focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <img
                    src={screenshot}
                    alt={`Screenshot ${idx + 1}`}
                    className="w-full hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium text-foreground bg-background/80 px-3 py-1.5 rounded-full">
                      Click to expand
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Image Lightbox */}
        <ImageLightbox
          images={screenshotImages}
          currentIndex={lightboxIndex ?? 0}
          open={lightboxIndex !== null}
          onOpenChange={(open) => !open && setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />

        {/* Summary */}
        {document.summary && (
          <div className="rounded-lg border bg-card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-3">Summary</h2>
            <MarkdownRenderer 
              content={document.summary} 
              className="text-muted-foreground"
            />
          </div>
        )}

        {/* Content Sections */}
        {hasAnySections && (
          <div className="space-y-8">
            {sections.userProblem && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">User Problem / Question</h2>
                <MarkdownRenderer content={sections.userProblem} />
              </section>
            )}

            {sections.currentBehavior && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Current Behavior</h2>
                <MarkdownRenderer content={sections.currentBehavior} />
              </section>
            )}

            {sections.expectedBehavior && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  Expected Behavior / Intended Design
                </h2>
                <MarkdownRenderer content={sections.expectedBehavior} />
              </section>
            )}

            {sections.stepsToReproduce && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Steps to Reproduce or Use</h2>
                <MarkdownRenderer content={sections.stepsToReproduce} />
              </section>
            )}

            {sections.knownLimitations && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  Known Limitations / Edge Cases
                </h2>
                <MarkdownRenderer content={sections.knownLimitations} />
              </section>
            )}

            {sections.customerQuotes && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Customer Quotes</h2>
                <div className="border-l-4 border-primary bg-muted/50 rounded-r-lg p-4">
                  <MarkdownRenderer content={sections.customerQuotes} className="italic" />
                </div>
              </section>
            )}
          </div>
        )}

        {/* Source Thread */}
        {document.slack_url && (
          <section className="border-t pt-8 mt-8">
            <h3 className="text-lg font-semibold mb-3">Original Slack Discussion</h3>
            <div className="rounded-lg border bg-card p-4">
              {document.slack_channel_name && (
                <p className="text-sm text-muted-foreground mb-3">
                  This documentation was created from a conversation in #{document.slack_channel_name}
                </p>
              )}
              <a
                href={document.slack_url}
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

        {/* Feedback Section */}
        <div className="border-t mt-12 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Was this helpful?</h3>
              <p className="text-sm text-muted-foreground">
                Let us know if this documentation helped you
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                Yes
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsDown className="h-4 w-4" />
                No
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="ghost" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Suggest an update
            </Button>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the document visible to everyone. Once published, you won't be able to edit it directly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublish}
              disabled={publishDocument.isPending}
            >
              {publishDocument.isPending ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will return the document to draft status. It will no longer be visible to everyone until it's published again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnpublish}
              disabled={unpublishDocument.isPending}
            >
              {unpublishDocument.isPending ? "Unpublishing..." : "Unpublish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unauthorized Dialog */}
      <AlertDialog open={showUnauthorizedDialog} onOpenChange={setShowUnauthorizedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unable to Publish</AlertDialogTitle>
            <AlertDialogDescription>
              You can't publish yet. Please ask a KnowSlope publisher to review this document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowUnauthorizedDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteDocument.isPending}
            >
              {deleteDocument.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentDetail;
