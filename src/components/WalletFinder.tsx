"use client";

import { useState } from "react";
import { Search, Wallet, TrendingUp, Shield, Activity, Twitter, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { type Chain, type Period } from "@/lib/api";
import { ChainSelector, getChainInfo } from "@/components/ChainSelector";

// ==========================================
// Periodos
// ==========================================
const PERIODS: Period[] = ["1d", "7d", "30d", "all"];

// ==========================================
// Normalização Distribution
// ==========================================
function normalizeDistributionData(chain: Chain, raw: any) {
  if (!raw || typeof raw !== "object") {
    return {
      token_num: 0,
      pnl_gt_5x_num: 0,
      pnl_2x_5x_num: 0,
      pnl_0x_2x_num: 0,
      pnl_nd5_0x_num: 0,
      pnl_lt_nd5_num: 0,
      winrate: 0,
    };
  }

  const r = (k: string) => (raw && raw[k] != null ? raw[k] : undefined);

  if (chain === "SOL") {
    return {
      token_num: Number(r("token_num") ?? 0),
      pnl_gt_5x_num: Number(r("pnl_gt_5x_num") ?? 0),
      pnl_2x_5x_num: Number(r("pnl_2x_5x_num") ?? 0),
      pnl_0x_2x_num: Number(r("pnl_0x_2x_num") ?? 0),
      pnl_nd5_0x_num: Number(r("pnl_nd5_0x_num") ?? 0),
      pnl_lt_nd5_num: Number(r("pnl_lt_nd5_num") ?? 0),
      winrate: Number(r("winrate") ?? 0),
    };
  }

  if (["ETH", "BNB", "TRX", "BASE"].includes(chain)) {
    return {
      token_num: Number(r("token_num") ?? 0),
      pnl_gt_5x_num: Number(r("pnl_gt_5x_num") ?? 0),
      pnl_2x_5x_num: Number(r("pnl_2x_5x_num") ?? 0),
      pnl_0x_2x_num: Number(r("pnl_lt_2x_num") ?? r("pnl_0x_2x_num") ?? 0),
      pnl_nd5_0x_num: Number(r("pnl_minus_dot5_0x_num") ?? r("pnl_nd5_0x_num") ?? 0),
      pnl_lt_nd5_num: Number(r("pnl_lt_minus_dot5_num") ?? r("pnl_lt_nd5_num") ?? 0),
      winrate: Number(r("winrate") ?? 0),
    };
  }

  return {
    token_num: Number(r("token_num") ?? 0),
    pnl_gt_5x_num: Number(r("pnl_gt_5x_num") ?? 0),
    pnl_2x_5x_num: Number(r("pnl_2x_5x_num") ?? 0),
    pnl_0x_2x_num: Number(r("pnl_0x_2x_num") ?? 0),
    pnl_nd5_0x_num: Number(r("pnl_nd5_0x_num") ?? 0),
    pnl_lt_nd5_num: Number(r("pnl_lt_nd5_num") ?? 0),
    winrate: Number(r("winrate") ?? 0),
  };
}

// ==========================================
// Fetch wallet por período
// ==========================================
export async function fetchWallet(chain: Chain, walletAddress: string) {
  const results: Record<Period, any> = {} as Record<Period, any>;

  for (const period of PERIODS) {
    try {
      const res = await fetch(
        `https://api-cripto-nova.fly.dev/api/${chain.toLowerCase()}/wallet/${walletAddress}/${period}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const rawData = await res.json();
      results[period] = rawData?.data ?? {};
    } catch (error) {
      console.error(`[API ${period}] Error fetching wallet:`, error);
      results[period] = {};
    }
  }

  if (chain === "ETH" && (!results.all || Object.keys(results.all).length === 0)) {
    results.all = results["30d"] || {};
  }

  return normalizeWalletData(results, chain);
}

// ==========================================
// Normaliza os dados dependendo da chain
// ==========================================
function normalizeWalletData(rawData: Record<Period, any>, chain: Chain): Record<Period, any> {
  const normalized: Record<Period, any> = {} as Record<Period, any>;

  PERIODS.forEach((period) => {
    const data = rawData[period] || {};
    const rawPnlDetail = data?.pnl_detail && Object.keys(data.pnl_detail).length > 0 ? data.pnl_detail : data;
    const pnlDetail = normalizeDistributionData(chain, rawPnlDetail);

    if (chain === "SOL") {
      normalized[period] = {
        ...data,
        pnl_detail: pnlDetail,
        realized_profit: data.realized_profit ?? 0,
        realized_profit_pnl: data.realized_profit_pnl ?? data.total_profit_pnl ?? 0,
        buy: data.buy ?? 0,
        sell: data.sell ?? 0,
        winrate: pnlDetail.winrate, // <<< CORREÇÃO SOLANA
      };
} else {
  if (period === "all") {
    normalized[period] = {
      ...data,
      pnl_detail: pnlDetail,
      realized_profit: data.realized_profit_all ?? data.realized_profit ?? 0,
      realized_profit_pnl: data.all_pnl ?? data.pnl_all ?? 0,
      buy: data.buy ?? 0,
      sell: data.sell ?? 0,
      winrate: data.winrate ?? 0, // <<<<<< aqui corrigido
    };
  } else {
    normalized[period] = {
      ...data,
      pnl_detail: pnlDetail,
      realized_profit: data[`realized_profit_${period}`] ?? 0,
      realized_profit_pnl: data[`pnl_${period}`] ?? 0,
      buy: data[`buy_${period}`] ?? 0,
      sell: data[`sell_${period}`] ?? 0,
      winrate: data.winrate ?? 0, // <<<<<< aqui corrigido
    };
  }
}

  });

  return normalized;
}

// ==========================================
// Utilitários de formatação
// ==========================================
const formatMoney = (value: number | string | undefined) =>
  value == null || isNaN(Number(value))
    ? "N/A"
    : `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatBalance = (balance: string | number | undefined, chain: Chain) => {
  const num = Number(balance);
  if (isNaN(num)) return "0.0000";
  switch (chain) {
    case "SOL":
    case "TRX":
      return num.toFixed(6);
    case "BTC":
      return num.toFixed(8);
    default:
      return num.toFixed(4);
  }
};

const getWalletBalance = (data: any, chain: Chain) =>
  chain === "SOL" || chain === "TRX" ? Number(data?.native_balance ?? 0) : Number(data?.balance ?? 0);

const getWinRateColor = (winrate: number | string | undefined) =>
  winrate == null || isNaN(Number(winrate)) ? "text-gray-400" : Number(winrate) * 100 < 51 ? "text-red-400" : "text-green-400";

const formatWinRate = (winrate: number | string | undefined) =>
  winrate == null || isNaN(Number(winrate)) ? "N/A" : (Number(winrate) * 100).toFixed(2) + "%";

const getChainSymbol = (chain: Chain) => ({ SOL: "SOL", ETH: "ETH", BNB: "BNB", BTC: "BTC", TRX: "TRX", BASE: "BASE" }[chain]);

// ==========================================
// Helpers para múltiplas wallets
// ==========================================
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function fetchMultipleWallets(chain: Chain, wallets: string[]) {
  const allResults: Record<string, Record<Period, any>> = {};
  const chunks = chunkArray(wallets, 10);

  for (const chunk of chunks) {
    const promises = chunk.map((wallet) =>
      fetchWallet(chain, wallet).then((data) => ({ wallet, data }))
    );
    const results = await Promise.all(promises);
    results.forEach(({ wallet, data }) => {
      allResults[wallet] = data;
    });
  }

  return allResults;
}

// ==========================================
// WalletFinder Component
// ==========================================
export function WalletFinder() {
  const [walletAddresses, setWalletAddresses] = useState("");
  const [selectedChain, setSelectedChain] = useState<Chain>("SOL");
  const [walletDataMap, setWalletDataMap] = useState<Record<string, Record<Period, any>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const chainInfo = getChainInfo(selectedChain);

  const handleSearch = async () => {
    const wallets = walletAddresses.split(",").map((w) => w.trim()).filter(Boolean);
    if (wallets.length === 0) {
      toast({ title: "Invalid Input", description: "Enter at least one wallet address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const allData = await fetchMultipleWallets(selectedChain, wallets);
      setWalletDataMap(allData);
      toast({ title: "Wallets Found", description: `Successfully retrieved data for ${wallets.length} wallets` });
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

      {/* Search */}
      <div className="cyber-card animate-slide-up">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="h-6 w-6 text-primary animate-glow" />
            <h2 className="text-2xl font-bold glow-text">{chainInfo.name} Wallet Analytics</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Enter up to 10 wallet addresses separated by commas. Example: wallet1,wallet2,wallet3
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-2">
            <Input
              placeholder={`Enter wallet addresses separated by commas...`}
              value={walletAddresses}
              onChange={(e) => setWalletAddresses(e.target.value)}
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

      {/* Results */}
      {walletDataMap &&
        Object.entries(walletDataMap).map(([wallet, walletData]) => {
          const lastActive = walletData?.all?.last_active_timestamp
            ? new Date(walletData.all.last_active_timestamp * 1000).toLocaleString()
            : "N/A";

          return (
            <div key={wallet} className="space-y-6">
              {/* Wallet Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">{wallet}</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(wallet);
                    toast({ title: "Copied", description: `Wallet ${wallet} copied to clipboard` });
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>

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
                    <div className="text-sm text-muted-foreground mt-1">Last Active: {lastActive}</div>
                  </CardContent>
                </Card>

                {/* Profit & Loss */}
                <Card className="cyber-card hover:neon-glow transition-all duration-300">
                  <CardHeader className="flex justify-between items-center pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Profit & Loss</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {PERIODS.map((period) => {
                      const data = walletData[period] || {};
                      const pnl = data.realized_profit_pnl ?? 0;
                      const realized = data.realized_profit ?? 0;
                      return (
                        <div key={period} className="flex justify-between w-full">
                          <span className="font-medium text-muted-foreground min-w-[80px]">{period.toUpperCase()} PnL:</span>
                          <span className={`font-bold ${pnl >= 0 ? "text-green-400" : "text-red-400"} whitespace-nowrap`}>
                            {pnl != null ? (pnl * 100).toFixed(2) + "%" : "N/A"}
                          </span>
                          <span className="font-medium text-muted-foreground min-w-[120px] ml-4">{period.toUpperCase()} Realized PnL:</span>
                          <span className={`font-bold ${realized >= 0 ? "text-green-400" : "text-red-400"} whitespace-nowrap`}>
                            {realized != null ? formatMoney(realized) : "N/A"}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Trading Activity */}
                <Card className="cyber-card hover:neon-glow transition-all duration-300">
                  <CardHeader className="flex justify-between items-center pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Trading Activity</CardTitle>
                    <Activity className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {PERIODS.map((period) => {
                      const data = walletData[period] || {};
                      return (
                        <div key={period} className="flex justify-between w-full">
                          <span>Buys ({period.toUpperCase()}):</span>
                          <span className="text-green-400 font-medium">{data.buy ?? 0}</span>
                          <span>Sells ({period.toUpperCase()}):</span>
                          <span className="text-red-400 font-medium">{data.sell ?? 0}</span>
                          <span>Win Rate:</span>
                          <span className={`font-medium ${getWinRateColor(data.winrate ?? data.pnl_detail?.winrate)}`}>
                            {formatWinRate(data.winrate ?? data.pnl_detail?.winrate)}
                          </span>
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
                      <span className="text-red-500 font-bold">
                        {walletData.all?.risk?.token_honeypot_ratio != null
                          ? `${(walletData.all.risk.token_honeypot_ratio * 100).toFixed(0)} (${(walletData.all.risk.token_honeypot_ratio * 100).toFixed(2)}%)`
                          : "0 (0%)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Buy/Sell within 5 secs:</span>
                      <span className="text-red-500 font-bold">
                        {walletData.all?.risk?.fast_tx ?? 0} ({((walletData.all?.risk?.fast_tx_ratio ?? 0) * 100).toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>No Buy Hold:</span>
                      <span className="text-red-500 font-bold">
                        {walletData.all?.risk?.no_buy_hold_ratio != null
                          ? `${(walletData.all.risk.no_buy_hold_ratio * 100).toFixed(0)} (${(walletData.all.risk.no_buy_hold_ratio * 100).toFixed(2)}%)`
                          : "0 (0%)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sell &gt; Buy:</span>
                      <span className="text-red-500 font-bold">
                        {walletData.all?.risk?.sell_pass_buy_ratio != null
                          ? `${(walletData.all.risk.sell_pass_buy_ratio * 100).toFixed(0)} (${(walletData.all.risk.sell_pass_buy_ratio * 100).toFixed(2)}%)`
                          : "0 (0%)"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Distribution */}
                <Card className="cyber-card hover:neon-glow transition-all duration-300 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Distribution (Tokens {walletData.all?.pnl_detail?.token_num ?? walletData.all?.token_num ?? 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(() => {
                      const detailSource = walletData.all?.pnl_detail && Object.keys(walletData.all.pnl_detail).length > 0
                        ? walletData.all.pnl_detail
                        : walletData.all || {};
                      const detail = normalizeDistributionData(selectedChain, detailSource);
                      const totalTokens = detail.token_num || 0;

                      if (totalTokens === 0) {
                        return <div className="text-muted-foreground">No distribution data available</div>;
                      }

                      const ranges = [
                        { label: ">500%", count: detail.pnl_gt_5x_num || 0, color: "text-green-500" },
                        { label: "200% ~ 500%", count: detail.pnl_2x_5x_num || 0, color: "text-green-300" },
                        { label: "0% ~ 200%", count: detail.pnl_0x_2x_num || 0, color: "text-yellow-400" },
                        { label: "-50% ~ 0%", count: detail.pnl_nd5_0x_num || 0, color: "text-orange-400" },
                        { label: "<-50%", count: detail.pnl_lt_nd5_num || 0, color: "text-red-500" },
                      ];

                      return ranges.map((range) => (
                        <div key={range.label} className={`flex justify-between w-full ${range.color} font-bold`}>
                          <span>{range.label}</span>
                          <span>
                            {range.count} ({((range.count / totalTokens) * 100).toFixed(2)}%)
                          </span>
                        </div>
                      ));
                    })()}
                  </CardContent>
                </Card>

                {/* Twitter */}
                <Card className="cyber-card hover:neon-glow transition-all duration-300">
                  <CardHeader className="flex justify-between items-center pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Twitter</CardTitle>
                    <Twitter className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {walletData.all?.twitter ? (
                      <a href={`https://twitter.com/${walletData.all.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                        @{walletData.all.twitter}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No Twitter linked</span>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>
          );
        })}
    </div>
  );
}
