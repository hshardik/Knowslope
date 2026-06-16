import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
const Index = () => {
  return <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-6">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mb-4 text-5xl font-semibold">Welcome to KnowSlope!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Transform your Slack conversations into searchable, organized documentation
        </p>
        <Link to="/knowslope">
          <Button size="lg" className="gap-2">
            Open KnowSlope
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-lg border bg-card p-6">
            <Sparkles className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Automatically generate documentation from Slack threads
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Organized</h3>
            <p className="text-sm text-muted-foreground">
              Searchable, categorized knowledge base for your team
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <ArrowRight className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Simple Workflow</h3>
            <p className="text-sm text-muted-foreground">
              Screenshot → Slack link → AI draft → Publish
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>;
};
export default Index;