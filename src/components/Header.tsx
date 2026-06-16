import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, LogOut, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    data: role
  } = useUserRole();
  const navigate = useNavigate();
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email[0].toUpperCase();
  };
  const getRoleBadgeVariant = () => {
    if (role === 'admin') return 'default';
    if (role === 'publisher') return 'secondary';
    return 'outline';
  };
  return <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold hover:text-primary transition-colors">
            KnowSlope
          </Link>
        </div>

        {user && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                  {role && <Badge variant={getRoleBadgeVariant()} className="w-fit mt-1">
                      {role}
                    </Badge>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>}
      </div>
    </header>;
};