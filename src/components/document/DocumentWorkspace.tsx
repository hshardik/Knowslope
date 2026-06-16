import { useState, useRef } from "react";
import { 
  ChevronDown, 
  Upload, 
  Link2, 
  Loader2, 
  Check, 
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  Settings2,
  FileText,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DraftDocument } from "@/pages/NewDocWizard";
import type { DocVisibility } from "@/hooks/useDocuments";

interface DocumentWorkspaceProps {
  draftDoc: DraftDocument;
  setDraftDoc: (doc: DraftDocument | ((prev: DraftDocument) => DraftDocument)) => void;
  screenshots: string[];
  setScreenshots: (screenshots: string[]) => void;
  slackUrl: string;
  setSlackUrl: (url: string) => void;
  slackData: any;
  isFetchingSlack: boolean;
  notes: string;
  setNotes: (notes: string) => void;
  onFetchSlack: () => void;
  slackRequired?: boolean;
  isGenerating?: boolean;
  onGenerateDraft?: () => void;
}

type SectionKey = keyof DraftDocument["sections"];

const sections: { key: SectionKey; label: string; rows: number; className?: string }[] = [
  { key: "userProblem", label: "User Problem / Question", rows: 3 },
  { key: "currentBehavior", label: "Current Behavior", rows: 3 },
  { key: "expectedBehavior", label: "Expected Behavior / Intended Design", rows: 3 },
  { key: "stepsToReproduce", label: "Steps to Reproduce or Use", rows: 4, className: "font-mono text-sm" },
  { key: "knownLimitations", label: "Known Limitations / Edge Cases", rows: 2 },
  { key: "customerQuotes", label: "Customer Quotes (optional)", rows: 2, className: "italic" },
];

const suggestedTags = ["qa", "field-crew", "mobile-app", "approval-flow"];

export const DocumentWorkspace = ({
  draftDoc,
  setDraftDoc,
  screenshots,
  setScreenshots,
  slackUrl,
  setSlackUrl,
  slackData,
  isFetchingSlack,
  notes,
  setNotes,
  onFetchSlack,
  slackRequired = true,
  isGenerating = false,
  onGenerateDraft,
}: DocumentWorkspaceProps) => {
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isContentOpen, setIsContentOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<SectionKey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setScreenshots([...screenshots, event.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      toast.success(`${imageFiles.length} screenshot(s) added`);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      imageItems.forEach(item => {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setScreenshots([...screenshots, event.target.result as string]);
              toast.success("Screenshot pasted");
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshots([...screenshots, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addTag = (tag: string) => {
    if (!draftDoc.tags.includes(tag)) {
      setDraftDoc((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setDraftDoc((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleRegenerateSection = async (sectionKey: SectionKey) => {
    setRegeneratingSection(sectionKey);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-slack-thread', {
        body: {
          regenerateSection: sectionKey,
          currentDocument: {
            title: draftDoc.title,
            summary: draftDoc.summary,
            slackUrl: draftDoc.slackUrl,
            sections: draftDoc.sections,
          },
        },
      });

      if (error) {
        toast.error('Failed to regenerate section');
        return;
      }

      if (data?.success && data?.content) {
        setDraftDoc((prev) => ({
          ...prev,
          sections: {
            ...prev.sections,
            [sectionKey]: data.content,
          },
        }));
        toast.success('Section regenerated');
      } else {
        toast.error('Failed to regenerate section');
      }
    } catch (err) {
      toast.error('Failed to regenerate section');
    } finally {
      setRegeneratingSection(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Document Setup */}
      <Collapsible open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <div className="rounded-lg border bg-card">
          <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Document Setup</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isSetupOpen && "rotate-180"
              )} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={draftDoc.title}
                  onChange={(e) => setDraftDoc((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title..."
                  className="font-medium"
                />
              </div>

              {/* Category & Type Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={draftDoc.category}
                    onValueChange={(value) => setDraftDoc((prev) => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <RadioGroup 
                    value={draftDoc.visibility} 
                    onValueChange={(v) => setDraftDoc((prev) => ({ ...prev, visibility: v as DocVisibility }))}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="text-sm cursor-pointer">Private</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="team" id="team" />
                      <Label htmlFor="team" className="text-sm cursor-pointer">Team</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "bug", label: "Bug" },
                    { value: "feature", label: "Feature" },
                    { value: "how_to", label: "How-to" },
                    { value: "faq", label: "FAQ" },
                    { value: "troubleshooting", label: "Troubleshooting" },
                    { value: "policy", label: "Policy" }
                  ].map(({ value, label }) => (
                    <Badge
                      key={value}
                      variant={draftDoc.type === value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setDraftDoc((prev) => ({ ...prev, type: value as any }))}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {draftDoc.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.filter(t => !draftDoc.tags.includes(t)).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => addTag(tag)}
                    >
                      + {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Context Section */}
      <Collapsible open={isContextOpen} onOpenChange={setIsContextOpen}>
        <div className="rounded-lg border bg-card">
          <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Context</span>
                {(screenshots.length > 0 || slackData || notes) && (
                  <Badge variant="secondary" className="text-xs">
                    {[
                      screenshots.length > 0 && `${screenshots.length} img`,
                      slackData && "slack",
                      notes && "notes"
                    ].filter(Boolean).join(", ")}
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isContextOpen && "rotate-180"
              )} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Screenshots */}
              <div className="space-y-2">
                <Label>Screenshots</Label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onPaste={handlePaste}
                  className={cn(
                    "relative rounded-lg border-2 border-dashed p-4 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {screenshots.length === 0 ? (
                    <div className="py-4">
                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Drop, paste, or browse</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Browse files
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {screenshots.map((screenshot, idx) => (
                          <div key={idx} className="relative group">
                            <img src={screenshot} alt={`Screenshot ${idx + 1}`} className="h-16 w-16 object-cover rounded border" />
                            <button
                              onClick={() => setScreenshots(screenshots.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground p-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Add more
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Slack URL */}
              <div className="space-y-2">
                <Label>Slack Thread {!slackRequired && <span className="text-muted-foreground font-normal">(optional)</span>}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={slackUrl}
                      onChange={(e) => setSlackUrl(e.target.value)}
                      placeholder="https://workspace.slack.com/archives/..."
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={onFetchSlack} disabled={!slackUrl || isFetchingSlack} variant="outline" size="sm">
                    {isFetchingSlack ? <Loader2 className="h-4 w-4 animate-spin" /> : slackData ? <Check className="h-4 w-4" /> : "Fetch"}
                  </Button>
                </div>
                {slackData && (
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="font-medium">{slackData.channel}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{slackData.messageSnippet}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add context for AI generation..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Generate Button */}
              {onGenerateDraft && (
                <Button 
                  onClick={onGenerateDraft} 
                  className="w-full gap-2" 
                  disabled={isGenerating || (slackRequired && !slackUrl) || (screenshots.length === 0 && !slackUrl && !notes)}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate Draft with AI
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Content Editor */}
      <Collapsible open={isContentOpen} onOpenChange={setIsContentOpen}>
        <div className="rounded-lg border bg-card">
          <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <span className="font-semibold">Content</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isContentOpen && "rotate-180"
              )} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  value={draftDoc.summary}
                  onChange={(e) => setDraftDoc((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the document..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Content Sections */}
              {sections.map(({ key, label, rows, className }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{label}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => handleRegenerateSection(key)}
                      disabled={regeneratingSection !== null}
                    >
                      {regeneratingSection === key ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Regenerate
                    </Button>
                  </div>
                  <Textarea
                    value={draftDoc.sections[key]}
                    onChange={(e) =>
                      setDraftDoc((prev) => ({
                        ...prev,
                        sections: { ...prev.sections, [key]: e.target.value },
                      }))
                    }
                    rows={rows}
                    className={cn("resize-none", className)}
                    disabled={regeneratingSection === key}
                  />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};
