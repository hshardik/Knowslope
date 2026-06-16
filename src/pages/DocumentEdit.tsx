import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, Loader2, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentWorkspace } from "@/components/document/DocumentWorkspace";
import { DocumentPreview } from "@/components/document/DocumentPreview";
import { useDocument, useUpdateDocument, usePublishDocument } from "@/hooks/useDocuments";
import { useIsWhitelisted } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { DraftDocument } from "@/pages/NewDocWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: document, isLoading, error } = useDocument(id || "");
  const { data: isWhitelisted } = useIsWhitelisted();
  const updateDocument = useUpdateDocument();
  const publishDocument = usePublishDocument();
  
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);
  const [mobileTab, setMobileTab] = useState<"workspace" | "preview">("workspace");
  
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [slackUrl, setSlackUrl] = useState("");
  const [slackData, setSlackData] = useState<any>(null);
  const [isFetchingSlack, setIsFetchingSlack] = useState(false);
  const [notes, setNotes] = useState("");
  
  const [draftDoc, setDraftDoc] = useState<DraftDocument>({
    title: "",
    summary: "",
    category: "product",
    type: "bug",
    visibility: "private",
    tags: [],
    screenshots: [],
    slackUrl: "",
    sections: {
      userProblem: "",
      currentBehavior: "",
      expectedBehavior: "",
      stepsToReproduce: "",
      knownLimitations: "",
      customerQuotes: "",
    },
  });

  // Populate form when document loads
  useEffect(() => {
    if (document) {
      const docScreenshots = document.screenshots || [];
      const docSlackUrl = document.slack_url || "";
      
      setScreenshots(docScreenshots);
      setSlackUrl(docSlackUrl);
      
      setDraftDoc({
        title: document.title,
        summary: document.summary || "",
        category: document.category,
        type: document.type,
        visibility: document.visibility,
        tags: document.tags || [],
        screenshots: docScreenshots,
        slackUrl: docSlackUrl,
        sections: {
          userProblem: document.content?.sections?.userProblem || "",
          currentBehavior: document.content?.sections?.currentBehavior || "",
          expectedBehavior: document.content?.sections?.expectedBehavior || "",
          stepsToReproduce: document.content?.sections?.stepsToReproduce || "",
          knownLimitations: document.content?.sections?.knownLimitations || "",
          customerQuotes: document.content?.sections?.customerQuotes || "",
        },
      });
      
      // Set slack data if we have a slack url
      if (docSlackUrl && document.slack_channel_name) {
        setSlackData({
          channel: `#${document.slack_channel_name}`,
          messageSnippet: "Original thread",
          replyCount: 0,
          dateRange: "Previously fetched",
        });
      }
    }
  }, [document]);

  const handleFetchSlack = async () => {
    if (!slackUrl) return;
    setIsFetchingSlack(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-slack-thread', {
        body: { slackUrl, notes }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const analysis = data.data;
        setSlackData(analysis.slackData);
        
        setDraftDoc(prev => ({
          ...prev,
          title: analysis.title || prev.title,
          summary: analysis.summary || prev.summary,
          category: analysis.category || prev.category,
          type: analysis.type || prev.type,
          tags: analysis.tags || prev.tags,
          sections: {
            userProblem: analysis.sections?.userProblem || prev.sections.userProblem,
            currentBehavior: analysis.sections?.currentBehavior || prev.sections.currentBehavior,
            expectedBehavior: analysis.sections?.expectedBehavior || prev.sections.expectedBehavior,
            stepsToReproduce: analysis.sections?.stepsToReproduce || prev.sections.stepsToReproduce,
            knownLimitations: analysis.sections?.knownLimitations || prev.sections.knownLimitations,
            customerQuotes: analysis.sections?.customerQuotes || prev.sections.customerQuotes,
          },
          screenshots,
          slackUrl,
        }));
        
        toast.success("Slack thread analyzed successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze Slack thread");
    } finally {
      setIsFetchingSlack(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    await updateDocument.mutateAsync({
      id,
      title: draftDoc.title,
      summary: draftDoc.summary || null,
      category: draftDoc.category,
      type: draftDoc.type,
      visibility: draftDoc.visibility,
      tags: draftDoc.tags.length > 0 ? draftDoc.tags : null,
      screenshots: screenshots.length > 0 ? screenshots : null,
      slack_url: slackUrl || null,
      content: {
        sections: draftDoc.sections,
      },
    });
    
      navigate(`/knowslope/${id}`);
  };

  const handlePublishClick = () => {
    if (!isWhitelisted) {
      setShowUnauthorizedDialog(true);
    } else {
      setShowPublishDialog(true);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    
    // First save the document
    await updateDocument.mutateAsync({
      id,
      title: draftDoc.title,
      summary: draftDoc.summary || null,
      category: draftDoc.category,
      type: draftDoc.type,
      visibility: draftDoc.visibility,
      tags: draftDoc.tags.length > 0 ? draftDoc.tags : null,
      screenshots: screenshots.length > 0 ? screenshots : null,
      slack_url: slackUrl || null,
      content: {
        sections: draftDoc.sections,
      },
    });
    
    // Then publish
    await publishDocument.mutateAsync(id);
    setShowPublishDialog(false);
    navigate(`/knowslope/${id}`);
  };

  const canEdit = document && (
    document.status === "draft" && 
    (document.creator_id === user?.id || document.visibility === "team")
  );

  // Sync screenshots to draftDoc for preview
  const syncedDraftDoc = {
    ...draftDoc,
    screenshots: screenshots.length > 0 ? screenshots : draftDoc.screenshots,
    slackUrl: slackUrl || draftDoc.slackUrl,
  };

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

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Cannot edit this document</h1>
        <p className="text-muted-foreground">
          {document.status === "published" 
            ? "Published documents cannot be edited."
            : "You don't have permission to edit this document."
          }
        </p>
        <Button onClick={() => navigate(`/knowslope/${id}`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Document
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(`/knowslope/${id}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleSave}
                disabled={updateDocument.isPending}
              >
                {updateDocument.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Save Draft</span>
              </Button>
              <Button 
                className="gap-2"
                onClick={handlePublishClick}
                disabled={updateDocument.isPending || publishDocument.isPending}
              >
                {publishDocument.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Publish</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Mobile Tabs */}
        <div className="lg:hidden mb-4">
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "workspace" | "preview")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="workspace" className="gap-2">
                <Edit className="h-4 w-4" />
                Workspace
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="workspace" className="mt-4">
              <DocumentWorkspace
                draftDoc={draftDoc}
                setDraftDoc={setDraftDoc}
                screenshots={screenshots}
                setScreenshots={setScreenshots}
                slackUrl={slackUrl}
                setSlackUrl={setSlackUrl}
                slackData={slackData}
                isFetchingSlack={isFetchingSlack}
                notes={notes}
                setNotes={setNotes}
                onFetchSlack={handleFetchSlack}
                slackRequired={false}
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <DocumentPreview draftDoc={syncedDraftDoc} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop 2-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          <DocumentWorkspace
            draftDoc={draftDoc}
            setDraftDoc={setDraftDoc}
            screenshots={screenshots}
            setScreenshots={setScreenshots}
            slackUrl={slackUrl}
            setSlackUrl={setSlackUrl}
            slackData={slackData}
            isFetchingSlack={isFetchingSlack}
            notes={notes}
            setNotes={setNotes}
            onFetchSlack={handleFetchSlack}
            slackRequired={false}
          />
          
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <DocumentPreview draftDoc={syncedDraftDoc} />
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
    </div>
  );
};

export default DocumentEdit;
