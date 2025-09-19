import { Chain, Period } from "./api";

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
