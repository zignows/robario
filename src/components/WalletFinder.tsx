import { useState } from "react";
import { Search, Wallet, TrendingUp, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { type Chain, type Period } from "@/lib/api";
import { ChainSelector, getChainInfo } from "@/components/ChainSelector";

// ==========================================
// Função para puxar wallet para todos os períodos
// ==========================================
const PERIODS: Period[] = ["1d", "7d", "30d", "all"];

export async function fetchWalletAllPeriods(walletAddress: string, chain: Chain) {
  const results: Record<Period, any> = {} as Record<Period, any>;
  for (const period of PERIODS) {
    try {
      const res = await fetch(`https://api-billowing-tree-2140.fly.dev/api/${chain.toLowerCase()}/wallet/${walletAddress}?period=${period}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      results[period] = data.data || {};
    } catch (error) {
      console.error(`[API ${period}] Error fetching wallet:`, error);
      results[period] = {}; // fallback vazio
    }
  }
  return results;
}

// ==========================================
// Formatação utilitária
// ==========================================
const formatMoney = (value: number | string | undefined) => {
  if (value == null || isNaN(Number(value))) return "N/A";
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatBalance = (balance: string | number | undefined, chain: Chain) => {
  const num = Number(balance);
  if (isNaN(num)) return "0.000000";
  switch (chain) {
    case "SOL":
    case "TRX": return num.toFixed(6);
    case "BTC": return num.toFixed(8);
    default: return num.toFixed(4);
  }
};

const getWalletBalance = (data: any, chain: Chain) => {
  if (!data) return 0;
  return chain === "SOL" || chain === "TRX" ? Number(data.native_balance ?? 0) : Number(data.balance ?? 0);
};

const getRiskColor = (ratio: number | string | undefined) => {
  const value = Number(ratio);
  if (isNaN(value) || value === 0) return "text-green-400";
  if (value < 0.1) return "text-yellow-400";
  return "text-red-400";
};

const getWinRateColor = (winrate: number | undefined) => {
  if (winrate == null || isNaN(winrate)) return "text-gray-400";
  return winrate * 100 < 51 ? "text-red-400" : "text-green-400";
};

const formatWinRate = (winrate: number | undefined) => {
  if (winrate == null || isNaN(winrate)) return "N/A";
  return (winrate * 100).toFixed(2) + "%";
};

const getChainSymbol = (chain: Chain) => ({ SOL: "SOL", ETH: "ETH", BNB: "BNB", BTC: "BTC", TRX: "TRX" }[chain]);

// ==========================================
// WalletFinder Component
// ==========================================
export function WalletFinder() {
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState<Chain>("SOL");
  const [walletData, setWalletData] = useState<Record<Period, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const chainInfo = getChainInfo(selectedChain);

  const handleSearch = async () => {
    if (!walletAddress.trim()) {
      toast({ title: "Invalid Input", description: "Please enter a valid wallet address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const allData = await fetchWalletAllPeriods(walletAddress, selectedChain);
      setWalletData(allData);
      toast({ title: "Wallet Found", description: `Successfully retrieved ${selectedChain} wallet data` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to fetch wallet data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Chain Selector */}
      <ChainSelector selectedChain={selectedChain} onChainChange={setSelectedChain} />

      {/* Search Section */}
      <div className="cyber-card animate-slide-up">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Wallet className="h-6 w-6 text-primary animate-glow" />
            <h2 className="text-2xl font-bold glow-text">{chainInfo.name} Wallet Analytics</h2>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Input
              placeholder={`Enter ${chainInfo.name} wallet address...`}
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="cyber-input flex-1 text-lg"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading} className="btn-neon px-8 py-3 text-lg">
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" /> : <Search className="h-5 w-5 mr-2" />}
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {walletData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">

          {/* Balance */}
          <Card className="cyber-card hover:neon-glow transition-all duration-300">
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{getChainSymbol(selectedChain)} Balance</CardTitle>
              <div className={`text-2xl ${chainInfo.color} animate-float`}>{chainInfo.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary glow-text">
                {formatBalance(getWalletBalance(walletData.all, selectedChain), selectedChain)} {getChainSymbol(selectedChain)}
              </div>
            </CardContent>
          </Card>

         {/* Profit & Loss */}
<Card className="cyber-card hover:neon-glow transition-all duration-300">
  <CardHeader className="flex justify-between items-center pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">Profit & Loss</CardTitle>
    <TrendingUp className="h-4 w-4 text-primary" />
  </CardHeader>
  <CardContent>
    <div className="space-y-2 text-sm">
      {PERIODS.map((period) => {
        const data = walletData[period] || {};
        const pnl = data.pnl ?? null;
        const realized = period === "all" ? data.realized_profit : data[`realized_profit_${period}`];

        return (
          <div key={period} className="flex justify-between w-full">
            <span className="font-medium text-muted-foreground min-w-[80px]">{period.toUpperCase()} PnL:</span>
            <span className={`font-bold ${pnl >= 0 ? "text-green-400" : "text-red-400"} whitespace-nowrap`}>
              {pnl != null ? (pnl >= 0 ? "+" : "") + pnl.toFixed(2) + "%" : "N/A"}
            </span>
            <span className="font-medium text-muted-foreground min-w-[120px] ml-4">{period.toUpperCase()} Realized PnL:</span>
            <span className={`font-bold ${realized >= 0 ? "text-green-400" : "text-red-400"} whitespace-nowrap`}>
              {realized != null ? formatMoney(realized) : "N/A"}
            </span>
          </div>
        );
      })}
    </div>
  </CardContent>
</Card>


          {/* Trading Activity */}
          <Card className="cyber-card hover:neon-glow transition-all duration-300">
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trading Activity</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-2">
              {PERIODS.map((period) => {
                const data = walletData[period] || {};
                const buy = data.buy ?? 0;
                const sell = data.sell ?? 0;
                const winRateValue = data.winrate ?? data.pnl_detail?.winrate;
                const winRate = formatWinRate(winRateValue);
                const winRateColor = getWinRateColor(winRateValue);

                return (
                  <div key={period} className="flex justify-between text-sm">
                    <span>Buys ({period.toUpperCase()}):</span>
                    <span className="text-green-400 font-medium">{buy}</span>
                    <span>Sells ({period.toUpperCase()}):</span>
                    <span className="text-red-400 font-medium">{sell}</span>
                    <span>Win Rate:</span>
                    <span className={`font-medium ${winRateColor}`}>{winRate}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="cyber-card hover:neon-glow transition-all duration-300 md:col-span-2">
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk Analysis</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Honeypot Risk:</span>
                <span className={getRiskColor(walletData.all?.risk?.token_honeypot_ratio)}>
                  {(Number(walletData.all?.risk?.token_honeypot_ratio ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fast TX Risk:</span>
                <span className={getRiskColor(walletData.all?.risk?.fast_tx_ratio)}>
                  {(Number(walletData.all?.risk?.fast_tx_ratio ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>No Buy Hold:</span>
                <span className={getRiskColor(walletData.all?.risk?.no_buy_hold_ratio)}>
                  {(Number(walletData.all?.risk?.no_buy_hold_ratio ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sell &gt; Buy:</span>
                <span className={getRiskColor(walletData.all?.risk?.sell_pass_buy_ratio)}>
                  {(Number(walletData.all?.risk?.sell_pass_buy_ratio ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Tags */}
          <Card className="cyber-card hover:neon-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {walletData.all?.tags?.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 animate-glow">{tag}</Badge>
                ))}
              </div>
              {walletData.all?.followers_count > 0 && (
                <p className="text-sm text-muted-foreground mt-2">{walletData.all.followers_count} followers</p>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
