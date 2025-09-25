import { Chain, Period } from "./api";

// Períodos que vamos buscar
const PERIODS: Period[] = ["1d", "7d", "30d", "all"];

// Fetch wallet para todos os periods (sem HMAC)
export async function fetchWalletAllPeriods(walletAddress: string, chain: Chain) {
  const results: Record<Period, any> = {} as Record<Period, any>;

  for (const period of PERIODS) {
    try {
      // Monta URL do novo endpoint
      const url = `https://api-cripto-nova.fly.dev/api/${chain.toLowerCase()}/wallet/${walletAddress}/${period}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      results[period] = data.data || data; // adapta caso retorne diretamente
    } catch (error) {
      console.error(`[API ${period}] Error fetching wallet:`, error);
      results[period] = {}; // fallback vazio
    }
  }

  return results;
}
