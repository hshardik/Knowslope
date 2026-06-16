import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, Loader2, Edit, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { DocumentWorkspace } from "@/components/document/DocumentWorkspace";
import { DocumentPreview } from "@/components/document/DocumentPreview";
import { useCreateDocument, usePublishDocument } from "@/hooks/useDocuments";
import { useKnowledgeHubSettings } from "@/hooks/useKnowledgeHubSettings";
import { useIsWhitelisted } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
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
import type { DocCategory, DocType, DocVisibility } from "@/hooks/useDocuments";

export interface DraftDocument {
  title: string;
  summary: string;
  sections: {
    userProblem: string;
    currentBehavior: string;
    expectedBehavior: string;
    stepsToReproduce: string;
    knownLimitations: string;
    customerQuotes: string;
  };
  category: DocCategory;
  type: DocType;
  tags: string[];
  screenshots: string[];
  slackUrl: string;
  visibility: DocVisibility;
}

const NewDocWizard = () => {
  const navigate = useNavigate();
  const createDocument = useCreateDocument();
  const publishDocument = usePublishDocument();
  const { data: khSettings } = useKnowledgeHubSettings();
  const { data: isWhitelisted } = useIsWhitelisted();
  const slackRequired = khSettings?.slack_required ?? true;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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
    sections: {
      userProblem: "",
      currentBehavior: "",
      expectedBehavior: "",
      stepsToReproduce: "",
      knownLimitations: "",
      customerQuotes: "",
    },
    category: "product",
    type: "bug",
    tags: [],
    screenshots: [],
    slackUrl: "",
    visibility: "private",
  });

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
            userProblem: analysis.sections?.userProblem || '',
            currentBehavior: analysis.sections?.currentBehavior || '',
            expectedBehavior: analysis.sections?.expectedBehavior || '',
            stepsToReproduce: analysis.sections?.stepsToReproduce || '',
            knownLimitations: analysis.sections?.knownLimitations || '',
            customerQuotes: analysis.sections?.customerQuotes || '',
          },
          screenshots,
          slackUrl,
        }));
        
        toast.success("Slack thread analyzed successfully");
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Error fetching Slack thread:', error);
      const msg =
        error?.message?.includes('xoxb-') || error?.message?.includes('bot token')
          ? 'Slack token is misconfigured. Please set a Bot User OAuth Token (xoxb-).' 
          : (error.message || 'Failed to analyze Slack thread');
      toast.error(msg);
      setSlackData(null);
    } finally {
      setIsFetchingSlack(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (slackRequired && !slackUrl) {
      toast.error("Please add a Slack URL");
      return;
    }
    if (screenshots.length === 0 && !slackUrl && !notes) {
      toast.error("Please add at least one screenshot, Slack URL, or notes");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      if (slackUrl && !slackData) {
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
              userProblem: analysis.sections?.userProblem || '',
              currentBehavior: analysis.sections?.currentBehavior || '',
              expectedBehavior: analysis.sections?.expectedBehavior || '',
              stepsToReproduce: analysis.sections?.stepsToReproduce || '',
              knownLimitations: analysis.sections?.knownLimitations || '',
              customerQuotes: analysis.sections?.customerQuotes || '',
            },
            screenshots,
            slackUrl,
          }));
        }
      } else if (!slackUrl && notes) {
        const { data, error } = await supabase.functions.invoke('analyze-slack-thread', {
          body: { slackUrl: '', notes }
        });

        if (!error && data?.success && data?.data) {
          const analysis = data.data;
          setDraftDoc(prev => ({
            ...prev,
            title: analysis.title || prev.title,
            summary: analysis.summary || prev.summary,
            category: analysis.category || prev.category,
            type: analysis.type || prev.type,
            tags: analysis.tags || prev.tags,
            sections: {
              userProblem: analysis.sections?.userProblem || '',
              currentBehavior: analysis.sections?.currentBehavior || '',
              expectedBehavior: analysis.sections?.expectedBehavior || '',
              stepsToReproduce: analysis.sections?.stepsToReproduce || '',
              knownLimitations: analysis.sections?.knownLimitations || '',
              customerQuotes: analysis.sections?.customerQuotes || '',
            },
            screenshots,
            slackUrl,
          }));
        }
      } else {
        setDraftDoc(prev => ({
          ...prev,
          screenshots,
          slackUrl,
        }));
      }
      
      toast.success("Draft generated successfully");
    } catch (error: any) {
      console.error('Error generating draft:', error);
      toast.error(error.message || "Failed to generate draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await createDocument.mutateAsync({
        title: draftDoc.title || "Untitled Document",
        summary: draftDoc.summary,
        content: { sections: draftDoc.sections },
        category: draftDoc.category,
        type: draftDoc.type,
        tags: draftDoc.tags,
        screenshots: draftDoc.screenshots.length > 0 ? draftDoc.screenshots : screenshots,
        slack_url: draftDoc.slackUrl || slackUrl,
        visibility: draftDoc.visibility,
        status: 'draft',
      });
      toast.success("Draft saved successfully");
      navigate('/knowslope');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishClick = () => {
    if (!isWhitelisted) {
      setShowUnauthorizedDialog(true);
    } else {
      setShowPublishDialog(true);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const newDoc = await createDocument.mutateAsync({
        title: draftDoc.title || "Untitled Document",
        summary: draftDoc.summary,
        content: { sections: draftDoc.sections },
        category: draftDoc.category,
        type: draftDoc.type,
        tags: draftDoc.tags,
        screenshots: draftDoc.screenshots.length > 0 ? draftDoc.screenshots : screenshots,
        slack_url: draftDoc.slackUrl || slackUrl,
        visibility: draftDoc.visibility,
        status: 'draft',
      });
      
      await publishDocument.mutateAsync(newDoc.id);
      toast.success("Document published to KnowSlope");
      navigate('/knowslope');
    } catch (error: any) {
      console.error('Failed to publish:', error);
      if (error.message?.includes('not authorized')) {
        toast.error("You're not authorized to publish. Please ask a publisher to review your document.");
      } else {
        toast.error("Failed to publish document");
      }
    } finally {
      setIsPublishing(false);
      setShowPublishDialog(false);
    }
  };

  // Sync screenshots to draftDoc
  const syncedDraftDoc = {
    ...draftDoc,
    screenshots: screenshots.length > 0 ? screenshots : draftDoc.screenshots,
    slackUrl: slackUrl || draftDoc.slackUrl,
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements - matching landing page exactly */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Radial gradient - same as landing hero */}
        <div className="absolute inset-0 bg-gradient-radial" />
        
        {/* Animated blobs - using landing page colors */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-landing-hero/20 blob blob-animate blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-landing-hero-glow/20 blob blob-animate blur-3xl opacity-50" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10">
        <Header />
        
        {/* Header Bar - glassmorphism style */}
        <div className="border-b border-border/50 backdrop-blur-sm bg-background/60 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between"
            >
              <Button 
                variant="ghost" 
                onClick={() => navigate("/knowslope")} 
                className="gap-2 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Hub
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2 bg-background/60 border-border/50 backdrop-blur-sm hover:bg-background/80"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isPublishing}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span className="hidden sm:inline">Save Draft</span>
                </Button>
                <Button 
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                  onClick={handlePublishClick}
                  disabled={isSaving || isPublishing || !draftDoc.title}
                >
                  {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="hidden sm:inline">Publish</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          {/* Mobile Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:hidden mb-4"
          >
            <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "workspace" | "preview")}>
              <TabsList className="grid w-full grid-cols-2 bg-background/60 backdrop-blur-sm border border-border/50">
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
                  slackRequired={slackRequired}
                  isGenerating={isGenerating}
                  onGenerateDraft={handleGenerateDraft}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                <DocumentPreview draftDoc={syncedDraftDoc} />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Desktop 2-Column Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:grid lg:grid-cols-2 gap-6"
          >
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
              slackRequired={slackRequired}
              isGenerating={isGenerating}
              onGenerateDraft={handleGenerateDraft}
            />
            
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <DocumentPreview draftDoc={syncedDraftDoc} />
            </div>
          </motion.div>
        </div>

        {/* Generating Overlay - enhanced design */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl" />
              
              <div className="relative bg-background/90 backdrop-blur-sm border border-border/50 p-8 rounded-2xl shadow-2xl text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="relative mx-auto w-16 h-16 mb-6"
                >
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Generating your draft...
                </h3>
                <p className="text-muted-foreground">AI is analyzing the content</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Publish Confirmation Dialog */}
        <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <AlertDialogContent className="backdrop-blur-sm bg-background/95 border-border/50">
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
                disabled={isPublishing}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Unauthorized Dialog */}
        <AlertDialog open={showUnauthorizedDialog} onOpenChange={setShowUnauthorizedDialog}>
          <AlertDialogContent className="backdrop-blur-sm bg-background/95 border-border/50">
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
    </div>
  );
};

export default NewDocWizard;
