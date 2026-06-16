import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RequestDemoDialog } from './RequestDemoDialog';
import { Menu, X } from 'lucide-react';
const navItems = [{
  label: 'Product',
  href: '#product'
}, {
  label: 'Knows',
  href: '#knows'
}, {
  label: 'KnowSlopes',
  href: '#knowslopes'
}, {
  label: 'Pricing',
  href: '#pricing'
}, {
  label: 'Enterprise',
  href: '#enterprise'
}, {
  label: 'Security',
  href: '#security'
}];
export const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-landing-hero-glow flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors">
              KnowSlope
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => <button key={item.label} onClick={() => scrollToSection(item.href)} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover-underline transition-colors">
                {item.label}
              </button>)}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <RequestDemoDialog
              trigger={
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Request Demo
                </Button>
              }
            />
            <Link to="/auth">
              <Button size="sm" className="btn-press glow">
                ​Sign In  
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 -mr-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && <div className="lg:hidden bg-background border-b border-border animate-slide-up">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map(item => <button key={item.label} onClick={() => scrollToSection(item.href)} className="block w-full text-left px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                {item.label}
              </button>)}
            <div className="pt-4 space-y-2">
              <RequestDemoDialog
                trigger={
                  <Button variant="outline" className="w-full">
                    Request Demo
                  </Button>
                }
              />
              <Link to="/auth" className="block">
                <Button className="w-full btn-press">
                  Create a Know
                </Button>
              </Link>
            </div>
          </nav>
        </div>}
    </header>;
};