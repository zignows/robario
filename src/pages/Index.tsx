import { HeroSection } from "@/components/HeroSection";
import { WalletFinder } from "@/components/WalletFinder";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            {/* Novo Logo SVG com gradiente cyber */}
            <div className="w-8 h-8 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
              >
                <defs>
                  <linearGradient id="cyberGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF00FF"/>
                    <stop offset="100%" stopColor="#00FFFF"/>
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" ry="8" fill="url(#cyberGradient)"/>
                <g transform="translate(4,4) scale(1.0)">
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
                        fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"
                        fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
            </div>

            {/* Texto */}
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Wallet Finder
            </span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <WalletFinder />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Wallet Finder. Advanced multi-chain wallet analytics platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
