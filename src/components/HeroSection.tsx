"use client";

import { Search, TrendingUp, Shield } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { BackgroundPaths } from "@/components/ui/BackgroundPaths";
import { motion } from "framer-motion";
import { Suspense } from "react";

// Skeleton ou fallback para carregamento progressivo
function HeroSkeleton() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center bg-black/30 animate-pulse" />
  );
}

export function HeroSection() {
  const features = [
    {
      icon: Search,
      title: 'Multi-Chain Analysis',
      text: 'Analyze wallets across Solana, Ethereum, BNB Chain, Base, and Tron networks',
    },
    {
      icon: TrendingUp,
      title: 'PnL Tracking',
      text: 'Monitor profit and loss with detailed breakdowns across multiple timeframes',
    },
    {
      icon: Shield,
      title: 'Risk Assessment',
      text: 'Advanced risk metrics to identify potential threats and trading patterns',
    },
  ];

  return (
    <Suspense fallback={<HeroSkeleton />}>
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-visible">

        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        {/* Background Paths */}
        <div className="absolute inset-0 z-5 w-full h-full pointer-events-none">
          <BackgroundPaths title="" />
        </div>

        {/* Main Content */}
        <div className="relative z-20 text-center max-w-4xl mx-auto px-6 flex flex-col items-center gap-8">
          {/* Toda a seção principal aparece com animação */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-glow">
                Multi-Chain Wallet
              </span>
              <br />
              <span className="glow-text">Analytics</span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Discover deep insights into wallets across all major blockchains. 
              Track performance, analyze risks, and uncover trading patterns on SOL, ETH, BNB, Base & TRX.
            </motion.p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="cyber-card text-center animate-float"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.3, duration: 0.8 }}
                >
                  <div className="flex justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-primary animate-glow" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-xl blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/10 rounded-full blur-lg animate-float" />
      </div>
    </Suspense>
  );
}
