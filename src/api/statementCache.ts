import { Transaction } from "@/types/statement";

interface CacheEntry {
  transactions: Transaction[];
  timestamp: number;
  accountId: string;
  startDate: string | null;
  endDate: string | null;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cache = new Map<string, CacheEntry>();

function generateCacheKey(accountId: string, startDate: Date | null, endDate: Date | null): string {
  const startStr = startDate ? startDate.toISOString() : "null";
  const endStr = endDate ? endDate.toISOString() : "null";
  return `${accountId}:${startStr}:${endStr}`;
}

function isCacheValid(entry: CacheEntry): boolean {
  const now = Date.now();
  return now - entry.timestamp < CACHE_TTL;
}

export function getCachedTransactions(
  accountId: string,
  startDate: Date | null = null,
  endDate: Date | null = null
): Transaction[] | null {
  const key = generateCacheKey(accountId, startDate, endDate);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (!isCacheValid(entry)) {
    cache.delete(key);
    return null;
  }

  return entry.transactions;
}

export function setCachedTransactions(
  accountId: string,
  transactions: Transaction[],
  startDate: Date | null = null,
  endDate: Date | null = null
): void {
  const key = generateCacheKey(accountId, startDate, endDate);

  cache.set(key, {
    transactions: [...transactions],
    timestamp: Date.now(),
    accountId,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
  });
}

export function invalidateCache(accountId: string): void {
  const keysToDelete: string[] = [];

  cache.forEach((entry, key) => {
    if (entry.accountId === accountId) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => cache.delete(key));
}

if (typeof window !== "undefined") {
  setInterval(() => {
    const keysToDelete: string[] = [];
    cache.forEach((entry, key) => {
      const now = Date.now();
      if (now - entry.timestamp >= CACHE_TTL) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => cache.delete(key));
  }, 10 * 60 * 1000);
}
