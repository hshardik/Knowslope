import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Filter, FileText, Bug, Lightbulb, MessageSquare, FileCheck, Megaphone, Lock, CheckCircle, ArrowLeft, Hash, MoreVertical, Trash2, Eye, Sparkles, Slack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { useDocuments, useDeleteDocument, Document } from "@/hooks/useDocuments";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import IncomingItemsQueue from "@/components/IncomingItemsQueue";
import { toast } from "sonner";
import { motion } from "framer-motion";
const typeIcons: Record<string, any> = {
  bug: Bug,
  feature: Lightbulb,
  how_to: FileText,
  troubleshooting: FileText,
  faq: MessageSquare,
  policy: Megaphone
};
const typeLabels: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature',
  how_to: 'How-to',
  troubleshooting: 'Troubleshooting',
  faq: 'FAQ',
  policy: 'Policy'
};
const categoryLabels: Record<string, string> = {
  product: 'Product',
  engineering: 'Engineering',
  support: 'Support',
  sales: 'Sales',
  marketing: 'Marketing',
  operations: 'Operations'
};
const KnowSlope = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    data: documents,
    isLoading
  } = useDocuments();
  const deleteDocument = useDeleteDocument();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocument.mutateAsync(documentToDelete.id);
      toast.success("Document deleted successfully");
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };
  const filteredDocs = documents?.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.category.toLowerCase().includes(searchQuery.toLowerCase()) || doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesType = selectedType === "all" || doc.type === selectedType;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  }) || [];
  const TypeIcon = ({
    type
  }: {
    type: string;
  }) => {
    const Icon = typeIcons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements - matching landing page exactly */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Radial gradient - same as landing hero */}
        <div className="absolute inset-0 bg-gradient-radial" />
        
        {/* Animated blobs - using landing page colors */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-landing-hero/20 blob blob-animate blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-landing-hero-glow/20 blob blob-animate blur-3xl opacity-50" style={{
        animationDelay: '-4s'
      }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Page Header - glassmorphism style */}
        <div className="border-b border-border/50 backdrop-blur-sm bg-background/60">
          <div className="container mx-auto px-6 py-8">
            <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }}>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 -ml-2 gap-2 text-muted-foreground hover:text-foreground group">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </Button>
            </motion.div>
            
            <div className="flex items-center justify-between">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.1
            }}>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                    Dashboard
                  </h1>
                  <motion.div animate={{
                  rotate: [0, 15, -15, 0]
                }} transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}>
                    <Sparkles className="h-6 w-6 text-primary" />
                  </motion.div>
                </div>
                <p className="text-muted-foreground">
                  Manage and organize your knowledge base
                </p>
              </motion.div>
              
              <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} className="flex items-center gap-3">
                <Link to="/slack-setup">
                  <Button variant="outline" size="lg" className="gap-2 bg-background/60 border-border/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all">
                    <Slack className="h-4 w-4" />
                    <span className="hidden sm:inline">Slack Setup</span>
                  </Button>
                </Link>
                <Link to="/knowslope/new">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                    <Plus className="h-4 w-4" />
                    Create Know      
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Filters - glassmorphism card */}
        <div className="border-b border-border/50 backdrop-blur-sm bg-background/40">
          <div className="container mx-auto px-6 py-4">
            <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.3
          }} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input placeholder="Search by title, tags, or content..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-background/60 border-border/50 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px] bg-background/60 border-border/50 backdrop-blur-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[140px] bg-background/60 border-border/50 backdrop-blur-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(typeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="draft">Drafts</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Incoming Items Queue */}
        <div className="container mx-auto px-6 pt-6">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }}>
            <IncomingItemsQueue />
          </motion.div>
        </div>

        {/* Documents List */}
        <div className="container mx-auto px-6 py-8">
          {isLoading ? <div className="flex flex-col items-center justify-center py-16">
              <motion.div animate={{
            rotate: 360
          }} transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}>
                <Loader2 className="h-10 w-10 text-primary" />
              </motion.div>
              <p className="mt-4 text-muted-foreground">Loading your knowledge...</p>
            </div> : filteredDocs.length === 0 ? <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5
        }} className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative">
                <motion.div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.3, 0.5]
            }} transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }} />
                <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-8 mb-6 border border-border/50 backdrop-blur-sm">
                  <FileCheck className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                No docs yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Get started by creating your first documentation from a Slack conversation.
              </p>
              <Link to="/knowslope/new">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
                  <Plus className="h-4 w-4" />
                  Create your first doc from Slack
                </Button>
              </Link>
            </motion.div> : <div className="space-y-3">
              {filteredDocs.map((doc, index) => <motion.div key={doc.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: index * 0.05
          }} className="group">
                  <div className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:bg-background/80">
                    <div className="flex items-start justify-between gap-4">
                      <Link to={`/knowslope/${doc.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {doc.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="gap-1.5 bg-background/60 border-border/50">
                            <TypeIcon type={doc.type} />
                            {typeLabels[doc.type]}
                          </Badge>
                          <Badge variant="secondary" className="bg-secondary/50">
                            {categoryLabels[doc.category]}
                          </Badge>
                          {doc.created_from_slack && !doc.creator && <Badge variant="outline" className="gap-1.5 bg-purple-500/10 text-purple-700 border-purple-500/20">
                              <Hash className="h-3 w-3" />
                              Created from Slack
                            </Badge>}
                          {doc.status === 'published' ? <Badge variant="default" className="gap-1.5 bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
                              <CheckCircle className="h-3 w-3" />
                              Published by {doc.publisher?.full_name || doc.publisher?.email}
                            </Badge> : <Badge variant="outline" className="gap-1.5 bg-background/60">
                              {doc.visibility === 'private' && <Lock className="h-3 w-3" />}
                              {doc.creator ? `Draft by ${doc.creator?.full_name || doc.creator?.email}` : 'Draft'}
                            </Badge>}
                        </div>
                      </Link>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                          <div>{formatDistanceToNow(new Date(doc.updated_at), {
                        addSuffix: true
                      })}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80" onClick={e => e.preventDefault()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="backdrop-blur-sm bg-background/95">
                            <DropdownMenuItem onClick={() => navigate(`/knowslope/${doc.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                        setDocumentToDelete(doc);
                        setShowDeleteDialog(true);
                      }}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </motion.div>)}
            </div>}

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent className="backdrop-blur-sm bg-background/95 border-border/50">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>;
};
export default KnowSlope;