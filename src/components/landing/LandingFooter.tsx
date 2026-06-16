import { Link } from 'react-router-dom';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Enterprise', 'Changelog'],
  Resources: ['Documentation', 'API Reference', 'Community', 'Blog'],
  Company: ['About', 'Careers', 'Contact', 'Press'],
  Legal: ['Privacy', 'Terms', 'Security'],
};

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border bg-muted/30 py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-landing-hero-glow flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">K</span>
              </div>
              <span className="font-bold text-xl">KnowSlope</span>
            </Link>
            <p className="text-sm text-muted-foreground">Transform organizational chaos into searchable knowledge.</p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2024 KnowSlope. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <a key={social} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{social}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
