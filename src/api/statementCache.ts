import { Transaction, PaginatedResponse } from "@/types/statement";

interface CacheEntry {
  data: Transaction[];
  timestamp: number;
  accountId: string;
  startDate: string | null;
  endDate: string | null;
  page: number;
  pageSize: number;
  total?: number;
}

const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;
const cache = new Map<string, CacheEntry>();
let cleanupInterval: NodeJS.Timeout | null = null;

function generateCacheKey(
  accountId: string,
  startDate: Date | null,
  endDate: Date | null,
  page: number,
  pageSize: number
): string {
  const startStr = startDate ? startDate.toISOString() : "null";
  const endStr = endDate ? endDate.toISOString() : "null";
  return `${accountId}:${startStr}:${endStr}:${page}:${pageSize}`;
}

function isCacheValid(entry: CacheEntry): boolean {
  const now = Date.now();
  return now - entry.timestamp < CACHE_TTL;
}

export function getCachedTransactions(
  accountId: string,
  startDate: Date | null = null,
  endDate: Date | null = null,
  page = 1,
  pageSize = 25
): PaginatedResponse<Transaction> | null {
  const key = generateCacheKey(accountId, startDate, endDate, page, pageSize);
  const entry = cache.get(key);

  if (!entry || !isCacheValid(entry)) {
    if (entry && !isCacheValid(entry)) {
      cache.delete(key);
    }
    return null;
  }

  const totalPages = entry.total
    ? Math.ceil(entry.total / pageSize)
    : Math.ceil(entry.data.length / pageSize);

  return {
    data: entry.data,
    pagination: {
      page: entry.page,
      pageSize: entry.pageSize,
      total: entry.total || entry.data.length,
      totalPages,
      hasMore: entry.page < totalPages,
    },
  };
}

export function setCachedTransactions(
  accountId: string,
  transactions: Transaction[],
  startDate: Date | null = null,
  endDate: Date | null = null,
  page = 1,
  pageSize = 25,
  total?: number
): void {
  const key = generateCacheKey(accountId, startDate, endDate, page, pageSize);

  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = Array.from(cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    )[0][0];
    cache.delete(oldestKey);
  }

  cache.set(key, {
    data: [...transactions],
    timestamp: Date.now(),
    accountId,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
    page,
    pageSize,
    total,
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

if (typeof window !== "undefined" && !cleanupInterval) {
  cleanupInterval = setInterval(() => {
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

export function cleanupCache(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
