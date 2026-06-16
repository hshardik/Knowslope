import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    signIn,
    signUp,
    signInWithGoogle,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/knowslope');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(loginEmail, loginPassword);
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(signupEmail, signupPassword, signupFullName);
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      
      {/* Animated blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-landing-hero/20 blob blob-animate blur-3xl opacity-60" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-landing-hero-glow/20 blob blob-animate blur-3xl opacity-50" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Additional decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-landing-accent-1/10 rounded-full blur-2xl opacity-60" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-landing-accent-2/10 rounded-full blur-2xl opacity-50" />

      {/* Back to home link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to home</span>
      </Link>

      {/* Card with glassmorphism effect */}
      <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-gradient">K</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center">Welcome to KnowSlope</CardTitle>
          <CardDescription className="text-center">Your team's knowledge—organized instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="you@company.com" 
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)} 
                    required 
                    disabled={isLoading}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    required 
                    disabled={isLoading}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <Button type="submit" className="w-full glow" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input 
                    id="signup-name" 
                    type="text" 
                    placeholder="Jane Doe" 
                    value={signupFullName} 
                    onChange={e => setSignupFullName(e.target.value)} 
                    disabled={isLoading}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="you@company.com" 
                    value={signupEmail} 
                    onChange={e => setSignupEmail(e.target.value)} 
                    required 
                    disabled={isLoading}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={signupPassword} 
                    onChange={e => setSignupPassword(e.target.value)} 
                    required 
                    disabled={isLoading} 
                    minLength={6}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <Button type="submit" className="w-full glow" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 backdrop-blur-sm px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80" 
            onClick={handleGoogleSignIn} 
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
