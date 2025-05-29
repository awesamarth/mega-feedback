import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="w-full mx-auto px-2 py-5">
        <div className="flex flex-col md:flex-row justify-around items-center gap-4">
          
          {/* Left side - Branding */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-mono text-muted-foreground">
              MEGAETH ANONYMOUS FEEDBACK
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-6 text-sm font-mono">
            <Link 
              href="https://megaeth.com" 
              target="_blank"
              className="hover:text-primary transition-colors duration-200"
            >
              MAIN SITE
            </Link>
            <Link 
              href="https://docs.megaeth.com" 
              target="_blank"
              className="hover:text-primary transition-colors duration-200"
            >
              DOCS
            </Link>
            <Link 
              href="/view-feedback"
              className="hover:text-primary transition-colors duration-200"
            >
              VIEW FEEDBACK
            </Link>
          </div>

          {/* Right side - Privacy note */}
          <div className="text-xs text-muted-foreground font-mono">
            FULLY ANONYMOUS • ENCRYPTED
          </div>
          
        </div>

      </div>
    </footer>
  );
}