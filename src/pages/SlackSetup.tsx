import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Copy, Check, Slack, Bot, Key, Shield, Hash, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SlackSetup = () => {
  const navigate = useNavigate();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // These would come from your actual edge function URLs
  const webhookUrl = `${window.location.origin}/functions/v1/slack-webhook`;
  const oauthUrl = `${window.location.origin}/functions/v1/slack-oauth`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const steps = [
    {
      number: 0,
      title: "Get Your KnowSlope URLs",
      icon: Key,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Copy these URLs – you'll need them when configuring your Slack app:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
              <code className="flex-1 text-sm break-all">{oauthUrl}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(oauthUrl, "OAuth URL")}
              >
                {copiedUrl === "OAuth URL" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">OAuth Redirect URL</p>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
              <code className="flex-1 text-sm break-all">{webhookUrl}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
              >
                {copiedUrl === "Webhook URL" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Slack Webhook URL (for slash commands)</p>
          </div>
        </div>
      ),
    },
    {
      number: 1,
      title: "Create Your Slack App",
      icon: Slack,
      content: (
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Go to the Slack API portal</li>
            <li>Click <strong>"Create New App"</strong> → <strong>"From scratch"</strong></li>
            <li>App name: <code className="px-2 py-0.5 rounded bg-muted">KnowSlope</code> or <code className="px-2 py-0.5 rounded bg-muted">KnowSlope Knowledge Hub</code></li>
            <li>Choose your Slack workspace</li>
            <li>Click <strong>Create App</strong></li>
          </ol>
          <Button variant="outline" className="gap-2" asChild>
            <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open Slack API Portal
            </a>
          </Button>
        </div>
      ),
    },
    {
      number: 2,
      title: "Add a Bot User & Basic Info",
      icon: Bot,
      content: (
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>In your new app, go to <strong>Basic Information</strong></li>
            <li>Add a short description: <em>"Send Slack threads to KnowSlope and turn them into documentation."</em></li>
            <li>In the sidebar, go to <strong>App Home</strong></li>
            <li>Ensure your app has a <strong>Bot User</strong> enabled</li>
            <li>Give it a display name (e.g., <code className="px-2 py-0.5 rounded bg-muted">KnowSlope Bot</code>)</li>
          </ol>
        </div>
      ),
    },
    {
      number: 3,
      title: "Configure OAuth & Redirect URL",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>In the sidebar, go to <strong>OAuth & Permissions</strong></li>
            <li>Under <strong>Redirect URLs</strong>, click <strong>Add New Redirect URL</strong></li>
            <li>Paste the OAuth Redirect URL from Step 0</li>
            <li>Click <strong>Save URLs</strong></li>
          </ol>
        </div>
      ),
    },
    {
      number: 4,
      title: "Add Required Bot Scopes",
      icon: Key,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            In <strong>OAuth & Permissions → Scopes → Bot Token Scopes</strong>, add:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { scope: "commands", desc: "Use slash commands" },
              { scope: "chat:write", desc: "Send confirmations" },
              { scope: "channels:history", desc: "Read public channels" },
              { scope: "groups:history", desc: "Read private channels" },
              { scope: "users:read", desc: "Get user names" },
              { scope: "users:read.email", desc: "Map Slack users" },
              { scope: "files:read", desc: "Read attachments" },
            ].map((item) => (
              <div key={item.scope} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50">
                <Badge variant="secondary" className="font-mono text-xs">{item.scope}</Badge>
                <span className="text-xs text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground italic">
            Optional: Add <code>im:history</code> and <code>mpim:history</code> for DMs
          </p>
        </div>
      ),
    },
    {
      number: 5,
      title: "Add the Slash Command",
      icon: Hash,
      content: (
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>In the sidebar, go to <strong>Slash Commands</strong></li>
            <li>Click <strong>Create New Command</strong></li>
            <li>Configure it:</li>
          </ol>
          <div className="space-y-2 pl-6">
            <div className="p-2 rounded bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground">Command:</span>
              <code className="block font-mono">/knowslope</code>
            </div>
            <div className="p-2 rounded bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground">Request URL:</span>
              <code className="block font-mono text-sm break-all">{webhookUrl}</code>
            </div>
            <div className="p-2 rounded bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground">Short description:</span>
              <span className="block text-sm">Send this Slack thread to KnowSlope</span>
            </div>
          </div>
          <p className="text-muted-foreground">Click <strong>Save</strong></p>
        </div>
      ),
    },
    {
      number: 6,
      title: "Install the App to Your Workspace",
      icon: Slack,
      content: (
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Go to <strong>OAuth & Permissions</strong></li>
            <li>Click <strong>Install App to Workspace</strong></li>
            <li>Review permissions and click <strong>Allow</strong></li>
            <li>Copy the <strong>Bot User OAuth Token</strong> (starts with <code>xoxb-</code>)</li>
          </ol>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ The Bot User OAuth Token is sensitive. Treat it like a password!
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 7,
      title: "Grab the Signing Secret & Credentials",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Go to <strong>Basic Information</strong></li>
            <li>Under <strong>App Credentials</strong>, copy:</li>
          </ol>
          <div className="grid gap-2 pl-6">
            <Badge variant="outline" className="w-fit">Client ID</Badge>
            <Badge variant="outline" className="w-fit">Client Secret</Badge>
            <Badge variant="outline" className="w-fit">Signing Secret</Badge>
          </div>
          <p className="text-muted-foreground">
            You'll need these plus the Bot Token for KnowSlope.
          </p>
        </div>
      ),
    },
    {
      number: 8,
      title: "Add Credentials to KnowSlope",
      icon: Key,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Go to <strong>Settings → KnowSlope → Slack Integration</strong> and enter:
          </p>
          <div className="space-y-2">
            {[
              "Slack Client ID",
              "Slack Client Secret", 
              "Slack Signing Secret",
              "Slack Bot Token (xoxb-...)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/settings')}>
            Go to Settings
          </Button>
        </div>
      ),
    },
    {
      number: 9,
      title: "Invite the Bot to Channels",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">In Slack:</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Go to a channel where you want to use KnowSlope</li>
            <li>Run: <code className="px-2 py-0.5 rounded bg-muted">/invite @KnowSlope Bot</code></li>
            <li>Repeat for other channels</li>
          </ol>
        </div>
      ),
    },
    {
      number: 10,
      title: "Test the Integration",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">In Slack:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Go to any test channel</li>
              <li>Start a thread (a message with a reply)</li>
              <li>In that thread, run: <code className="px-2 py-0.5 rounded bg-muted">/knowslope</code></li>
              <li>You should see a confirmation message</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="font-medium">In KnowSlope:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Go to your Dashboard</li>
              <li>Check the Incoming Items queue</li>
              <li>You should see the new item from Slack</li>
              <li>Choose: Create Doc, Log Bug, or Create How-To</li>
            </ol>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✅ If this works, your Slack → KnowSlope connection is correctly set up!
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-landing-hero/20 blob blob-animate blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-landing-hero-glow/20 blob blob-animate blur-3xl opacity-50" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="container py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/knowslope")}
              className="mb-4 -ml-2 gap-2 text-muted-foreground hover:text-foreground group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Slack className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Slack Setup Guide</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Connect your own Slack workspace to KnowSlope in 10 easy steps
            </p>
          </motion.div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              >
                <Card className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {step.number}
                      </div>
                      <step.icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-14">
                    {step.content}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground mb-4">
              Need help? Check your Settings or contact support.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Go to Settings
              </Button>
              <Button onClick={() => navigate('/knowslope')}>
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SlackSetup;
