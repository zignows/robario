"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export type Chain = 'SOL' | 'ETH' | 'BNB' | 'TRX' | 'BASE';

interface ChainInfo {
  id: Chain;
  name: string;
  color: string;
  logo: string;
  gradient: string;
}

const chains: ChainInfo[] = [
  { id: 'SOL', name: 'Solana', color: 'text-purple-400', logo: 'https://gmgn.ai/static/img/solana.webp', gradient: 'from-purple-500 to-purple-700' },
  { id: 'ETH', name: 'Ethereum', color: 'text-blue-400', logo: 'https://gmgn.ai/static/img/ether.webp', gradient: 'from-blue-500 to-blue-700' },
  { id: 'BNB', name: 'BNB', color: 'text-yellow-400', logo: 'https://gmgn.ai/static/img/bsc.svg', gradient: 'from-yellow-500 to-yellow-700' },
  { id: 'TRX', name: 'Tron', color: 'text-red-400', logo: 'https://gmgn.ai/static/img/tron.webp', gradient: 'from-red-500 to-red-700' },
  { id: 'BASE', name: 'Base', color: 'text-cyan-400', logo: 'https://gmgn.ai/static/img/base.webp', gradient: 'from-cyan-500 to-cyan-700' },
];

interface ChainSelectorProps {
  selectedChain: Chain;
  onChainChange: (chain: Chain) => void;
}

export function ChainSelector({ selectedChain, onChainChange }: ChainSelectorProps) {
  return (
    <div className="cyber-card animate-slide-up mb-6">
      <h3 className="text-lg font-semibold mb-4 glow-text text-center">Select Blockchain</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {chains.map((chain, i) => (
          <Button
            key={chain.id}
            onClick={() => onChainChange(chain.id)}
            className={`relative h-20 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
              selectedChain === chain.id
                ? `border-primary bg-gradient-to-br ${chain.gradient} text-white shadow-neon animate-glow`
                : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
            }`}
            variant="ghost"
          >
            {/* Animate only the logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.5, duration: 0.5 }}
            >
              <img
                src={chain.logo}
                alt={chain.name}
                width={24}
                height={24}
                loading="lazy"
                decoding="async"
                className={selectedChain === chain.id ? 'animate-float' : ''}
              />
            </motion.div>
            
            <span
              className={`text-xs font-medium mt-1 ${
                selectedChain === chain.id ? 'text-white' : chain.color
              }`}
            >
              {chain.name}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function getChainInfo(chainId: Chain): ChainInfo {
  return chains.find((chain) => chain.id === chainId) || chains[0];
}
