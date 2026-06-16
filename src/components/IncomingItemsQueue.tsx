import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Hash, 
  FileText, 
  Bug, 
  Lightbulb, 
  BookOpen, 
  RefreshCw,
  X,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIncomingItems, useProcessIncomingItem, useDismissIncomingItem } from "@/hooks/useIncomingItems";
import { formatDistanceToNow } from "date-fns";

const IncomingItemsQueue = () => {
  const { data: items, isLoading } = useIncomingItems();
  const processItem = useProcessIncomingItem();
  const dismissItem = useDismissIncomingItem();
  const [isOpen, setIsOpen] = useState(true);
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  const pendingItems = items?.filter(item => item.status === 'pending') || [];
  const processingItems = items?.filter(item => item.status === 'processing') || [];

  const handleProcess = async (
    itemId: string, 
    action: 'create_doc' | 'log_bug' | 'create_how_to' | 'log_feature'
  ) => {
    setProcessingItemId(itemId);
    try {
      await processItem.mutateAsync({ incomingItemId: itemId, action });
    } finally {
      setProcessingItemId(null);
    }
  };

  const handleDismiss = async (itemId: string) => {
    await dismissItem.mutateAsync(itemId);
  };

  if (isLoading) {
    return null;
  }

  const totalItems = pendingItems.length + processingItems.length;

  if (totalItems === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Incoming from Slack
                    <Badge variant="secondary" className="ml-1">
                      {totalItems}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose how to process each item
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* Processing items */}
            {processingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.message_preview || 'Processing Slack thread...'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {item.slack_channel_name && (
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {item.slack_channel_name}
                        </span>
                      )}
                      <span>Processing with AI...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pending items */}
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">
                    {item.message_preview || 'Slack thread'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                    {item.slack_channel_name && (
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {item.slack_channel_name}
                      </span>
                    )}
                    {item.sent_by_slack_user_name && (
                      <span>from @{item.sent_by_slack_user_name}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                    <a 
                      href={item.slack_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View in Slack
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {processingItemId === item.id ? (
                    <Button disabled size="sm" className="gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processing...
                    </Button>
                  ) : (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <FileText className="h-3 w-3" />
                            Create Doc
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleProcess(item.id, 'create_doc')}
                            className="gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Create Doc
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleProcess(item.id, 'log_bug')}
                            className="gap-2"
                          >
                            <Bug className="h-4 w-4" />
                            Log Bug
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleProcess(item.id, 'create_how_to')}
                            className="gap-2"
                          >
                            <BookOpen className="h-4 w-4" />
                            Create How-To
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleProcess(item.id, 'log_feature')}
                            className="gap-2"
                          >
                            <Lightbulb className="h-4 w-4" />
                            Log Feature Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDismiss(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default IncomingItemsQueue;
