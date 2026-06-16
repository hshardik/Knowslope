import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useKnowledgeHubSettings, useUpdateKnowledgeHubSettings, type QuickPublishMode } from '@/hooks/useKnowledgeHubSettings';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, AtSign, Trash2, Plus, Shield, Slack, AlertCircle, CheckCircle2, Settings2, FileDown, ArrowLeft, ExternalLink, UserCheck, UserX, Eye, EyeOff, Key, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: role } = useUserRole();
  const queryClient = useQueryClient();
  const isAdmin = role === 'admin';

  const [newEntryType, setNewEntryType] = useState<'email' | 'domain'>('email');
  const [newEntryValue, setNewEntryValue] = useState('');

  // Slack credentials state
  const [slackBotToken, setSlackBotToken] = useState('');
  const [slackSigningSecret, setSlackSigningSecret] = useState('');
  const [showBotToken, setShowBotToken] = useState(false);
  const [showSigningSecret, setShowSigningSecret] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);
  const [credentialsSaved, setCredentialsSaved] = useState(false);

  // Knowledge Hub settings
  const { data: khSettings, isLoading: khSettingsLoading } = useKnowledgeHubSettings();
  const updateKhSettings = useUpdateKnowledgeHubSettings();

  const exportFormatOptions = [
    { id: 'pdf', label: 'PDF' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'html', label: 'HTML' },
    { id: 'json', label: 'JSON' },
  ];

  const handleExportFormatToggle = (format: string, checked: boolean) => {
    if (!khSettings) return;
    const currentFormats = khSettings.export_formats || [];
    const newFormats = checked
      ? [...currentFormats, format]
      : currentFormats.filter(f => f !== format);
    updateKhSettings.mutate({ export_formats: newFormats });
  };

  // Fetch whitelist
  const { data: whitelist, isLoading: whitelistLoading } = useQuery({
    queryKey: ['whitelist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publishing_whitelist')
        .select('*')
        .order('added_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch all users with their roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;

      return profiles.map(profile => ({
        ...profile,
        roles: roles
          .filter(r => r.user_id === profile.id)
          .map(r => r.role),
      }));
    },
    enabled: isAdmin,
  });

  // Add whitelist entry mutation
  const addWhitelistMutation = useMutation({
    mutationFn: async () => {
      const entry = newEntryType === 'domain' ? `@${newEntryValue}` : newEntryValue;
      
      const { error } = await supabase
        .from('publishing_whitelist')
        .insert({
          entry,
          entry_type: newEntryType,
          added_by: user!.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Whitelist entry added');
      setNewEntryValue('');
      queryClient.invalidateQueries({ queryKey: ['whitelist'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add entry');
    },
  });

  // Delete whitelist entry mutation
  const deleteWhitelistMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('publishing_whitelist')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Whitelist entry removed');
      queryClient.invalidateQueries({ queryKey: ['whitelist'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove entry');
    },
  });

  // Toggle role mutation (works for admin and publisher)
  const toggleRoleMutation = useMutation({
    mutationFn: async ({ userId, role, hasRole }: { userId: string; role: 'admin' | 'publisher'; hasRole: boolean }) => {
      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      const action = variables.hasRole ? 'removed' : 'granted';
      toast.success(`${variables.role.charAt(0).toUpperCase() + variables.role.slice(1)} role ${action}`);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update role');
    },
  });

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEntryValue.trim()) {
      toast.error('Please enter a value');
      return;
    }

    if (newEntryType === 'email' && !newEntryValue.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    addWhitelistMutation.mutate();
  };

  const handleSaveSlackCredentials = async () => {
    if (!slackBotToken.trim() && !slackSigningSecret.trim()) {
      toast.error('Please enter at least one credential');
      return;
    }

    if (slackBotToken && !slackBotToken.startsWith('xoxb-')) {
      toast.error('Bot token should start with "xoxb-"');
      return;
    }

    setIsSavingCredentials(true);
    try {
      // Call edge function to store credentials securely
      const { error } = await supabase.functions.invoke('store-slack-credentials', {
        body: {
          bot_token: slackBotToken.trim() || undefined,
          signing_secret: slackSigningSecret.trim() || undefined,
        },
      });

      if (error) throw error;

      toast.success('Slack credentials saved securely');
      setSlackBotToken('');
      setSlackSigningSecret('');
      setCredentialsSaved(true);
      
      // Update connection status
      updateKhSettings.mutate({ 
        slack_connected: true,
        slack_workspace_name: 'Connected via credentials'
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save credentials');
    } finally {
      setIsSavingCredentials(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements - matching landing page */}
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
        
        <div className="container py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2 gap-2 text-muted-foreground hover:text-foreground group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Button>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">Settings</h1>
            <p className="text-muted-foreground">Manage your account and publishing preferences</p>
          </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="account">Account</TabsTrigger>
            {isAdmin && <TabsTrigger value="knowledge-hub">KnowSlope</TabsTrigger>}
            {isAdmin && <TabsTrigger value="whitelist">Publishing Whitelist</TabsTrigger>}
            {isAdmin && <TabsTrigger value="team">Team</TabsTrigger>}
          </TabsList>

          <TabsContent value="account">
            <Card className="bg-background/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="mt-2">
                    <Badge variant={role === 'admin' ? 'default' : role === 'publisher' ? 'secondary' : 'outline'}>
                      {role || 'member'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="knowledge-hub">
              <div className="space-y-6">
                {/* Slack Integration Card */}
                <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Slack className="h-5 w-5" />
                      Slack Integration
                    </CardTitle>
                    <CardDescription>
                      Configure how Slack integrates with KnowSlope
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {khSettingsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="slack-required">Require Slack thread for new docs</Label>
                            <p className="text-sm text-muted-foreground">
                              {khSettings?.slack_required
                                ? 'Slack thread URL is required when creating new docs'
                                : 'Slack thread URL is optional. Docs can be created from screenshots + notes'}
                            </p>
                          </div>
                          <Switch
                            id="slack-required"
                            checked={khSettings?.slack_required ?? true}
                            onCheckedChange={(checked) => updateKhSettings.mutate({ slack_required: checked })}
                            disabled={updateKhSettings.isPending}
                          />
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Slack Connection Status</Label>
                              <div className="flex items-center gap-2 mt-1">
                                {khSettings?.slack_connected ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-muted-foreground">
                                      Connected to {khSettings.slack_workspace_name || 'workspace'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm text-muted-foreground">Not connected</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {khSettings?.slack_connected ? (
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  updateKhSettings.mutate({ 
                                    slack_connected: false, 
                                    slack_workspace_name: null 
                                  });
                                  setCredentialsSaved(false);
                                }}
                              >
                                Disconnect
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  // TODO: Implement OAuth flow in Phase 3
                                  toast.info('Slack OAuth will be available after edge function setup. For now, configure your Slack App manually.');
                                  window.open('https://api.slack.com/apps', '_blank');
                                }}
                              >
                                <Slack className="h-4 w-4 mr-2" />
                                Connect Slack Workspace
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Slack Credentials Card */}
                <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Slack Credentials
                    </CardTitle>
                    <CardDescription>
                      Store your Slack app credentials securely. These are required for the integration to work.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(khSettings?.slack_connected && credentialsSaved) ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-400">Credentials configured</p>
                          <p className="text-sm text-muted-foreground">
                            Your Slack credentials are securely stored. You can update them below if needed.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-yellow-700 dark:text-yellow-400">Credentials required</p>
                          <p className="text-sm text-muted-foreground">
                            Enter your Slack app credentials to enable the integration.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="slack-bot-token">Bot User OAuth Token</Label>
                        <div className="relative">
                          <Input
                            id="slack-bot-token"
                            type={showBotToken ? 'text' : 'password'}
                            value={slackBotToken}
                            onChange={(e) => setSlackBotToken(e.target.value)}
                            placeholder="xoxb-..."
                            className="pr-10 font-mono text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowBotToken(!showBotToken)}
                          >
                            {showBotToken ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Found in your Slack app under OAuth & Permissions → Bot User OAuth Token
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slack-signing-secret">Signing Secret</Label>
                        <div className="relative">
                          <Input
                            id="slack-signing-secret"
                            type={showSigningSecret ? 'text' : 'password'}
                            value={slackSigningSecret}
                            onChange={(e) => setSlackSigningSecret(e.target.value)}
                            placeholder="Enter signing secret..."
                            className="pr-10 font-mono text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowSigningSecret(!showSigningSecret)}
                          >
                            {showSigningSecret ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Found in your Slack app under Basic Information → App Credentials → Signing Secret
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://api.slack.com/apps', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Open Slack Apps
                      </Button>
                      <Button
                        onClick={handleSaveSlackCredentials}
                        disabled={isSavingCredentials || (!slackBotToken.trim() && !slackSigningSecret.trim())}
                      >
                        {isSavingCredentials ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Credentials
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Publishing Controls Card */}
                <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      Publishing Controls
                    </CardTitle>
                    <CardDescription>
                      Configure publishing behavior and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {khSettingsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="quick-publish">Enable Quick Publish from Slack</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow Slack shortcuts to create KnowSlope docs directly
                            </p>
                          </div>
                          <Switch
                            id="quick-publish"
                            checked={khSettings?.quick_publish_enabled ?? false}
                            onCheckedChange={(checked) => updateKhSettings.mutate({ quick_publish_enabled: checked })}
                            disabled={updateKhSettings.isPending}
                          />
                        </div>

                        {khSettings?.quick_publish_enabled && (
                          <div className="border-t pt-4">
                            <Label className="mb-3 block">Quick Publish Mode</Label>
                            <RadioGroup
                              value={khSettings?.quick_publish_mode ?? 'draft_only'}
                              onValueChange={(value: QuickPublishMode) => updateKhSettings.mutate({ quick_publish_mode: value })}
                              disabled={updateKhSettings.isPending}
                            >
                              <div className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/30">
                                <RadioGroupItem value="draft_only" id="mode-draft" className="mt-0.5" />
                                <div>
                                  <Label htmlFor="mode-draft" className="font-medium cursor-pointer">Draft Only</Label>
                                  <p className="text-sm text-muted-foreground">
                                    All Slack imports create drafts requiring human review before publishing
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/30">
                                <RadioGroupItem value="auto_publish" id="mode-auto" className="mt-0.5" />
                                <div>
                                  <Label htmlFor="mode-auto" className="font-medium cursor-pointer">Auto-publish for Whitelisted Users</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Whitelisted users can choose to auto-publish directly from Slack
                                  </p>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto" 
                            onClick={() => {
                              const tabsElement = document.querySelector('[data-state="active"][value="knowledge-hub"]')?.closest('[role="tablist"]');
                              const whitelistTrigger = tabsElement?.querySelector('[value="whitelist"]') as HTMLElement;
                              whitelistTrigger?.click();
                            }}
                          >
                            → Manage Publishing Whitelist
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Export Options Card */}
                <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileDown className="h-5 w-5" />
                      Export Options
                    </CardTitle>
                    <CardDescription>
                      Control which export formats appear when exporting documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {khSettingsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {exportFormatOptions.map((format) => (
                          <div key={format.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`export-${format.id}`}
                              checked={khSettings?.export_formats?.includes(format.id) ?? false}
                              onCheckedChange={(checked) => handleExportFormatToggle(format.id, checked as boolean)}
                              disabled={updateKhSettings.isPending}
                            />
                            <Label htmlFor={`export-${format.id}`} className="cursor-pointer">
                              {format.label}
                            </Label>
                          </div>
                        ))}
                        <p className="text-sm text-muted-foreground pt-2">
                          These options appear when exporting documents from KnowSlope
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="whitelist">
              <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Publishing Whitelist</CardTitle>
                  <CardDescription>
                    Manage who can publish documents to KnowSlope
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleAddWhitelist} className="space-y-4">
                    <RadioGroup value={newEntryType} onValueChange={(v) => setNewEntryType(v as 'email' | 'domain')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="domain" id="domain" />
                        <Label htmlFor="domain" className="flex items-center gap-2 cursor-pointer">
                          <AtSign className="h-4 w-4" />
                          Email Domain
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="flex gap-2">
                      <Input
                        placeholder={newEntryType === 'email' ? 'jane@company.com' : 'company.com'}
                        value={newEntryValue}
                        onChange={(e) => setNewEntryValue(e.target.value)}
                      />
                      <Button type="submit" disabled={addWhitelistMutation.isPending}>
                        {addWhitelistMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  <div>
                    <h3 className="font-semibold mb-3">Current Whitelist</h3>
                    {whitelistLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : whitelist && whitelist.length > 0 ? (
                      <div className="space-y-2">
                        {whitelist.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <div className="flex items-center gap-3">
                              {entry.entry_type === 'email' ? (
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <AtSign className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-mono">{entry.entry}</span>
                              <Badge variant="outline">{entry.entry_type}</Badge>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove whitelist entry?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Users matching "{entry.entry}" will no longer be able to publish documents.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteWhitelistMutation.mutate(entry.id)}
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No whitelist entries yet. Add emails or domains to allow publishing.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="team">
              <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage team roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : users && users.length > 0 ? (
                    <div className="space-y-3">
                      {users.map((u) => {
                        const userIsAdmin = u.roles.includes('admin');
                        const userIsPublisher = u.roles.includes('publisher');
                        const userDomain = u.email ? `@${u.email.split('@')[1]}` : '';
                        const isWhitelisted = whitelist?.some(
                          (entry) =>
                            (entry.entry_type === 'email' && entry.entry === u.email) ||
                            (entry.entry_type === 'domain' && entry.entry === userDomain)
                        );
                        return (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{u.full_name || u.email}</span>
                                {isWhitelisted && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Can Publish
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{u.email}</div>
                              <div className="mt-2 flex gap-2">
                                {u.roles.map((r: string) => (
                                  <Badge
                                    key={r}
                                    variant={r === 'admin' ? 'default' : r === 'publisher' ? 'secondary' : 'outline'}
                                  >
                                    {r}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {u.id !== user?.id && (
                              <div className="flex gap-2">
                                <Button
                                  variant={userIsPublisher ? 'outline' : 'secondary'}
                                  size="sm"
                                  onClick={() => toggleRoleMutation.mutate({ userId: u.id, role: 'publisher', hasRole: userIsPublisher })}
                                  disabled={toggleRoleMutation.isPending}
                                >
                                  {userIsPublisher ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Remove Publisher
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Make Publisher
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant={userIsAdmin ? 'destructive' : 'default'}
                                  size="sm"
                                  onClick={() => toggleRoleMutation.mutate({ userId: u.id, role: 'admin', hasRole: userIsAdmin })}
                                  disabled={toggleRoleMutation.isPending}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  {userIsAdmin ? 'Remove Admin' : 'Make Admin'}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No team members yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
