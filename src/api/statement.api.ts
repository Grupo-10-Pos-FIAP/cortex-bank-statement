import {
  Transaction,
  Balance,
  TransactionFilters,
  StatementResponse,
  AccountResponse,
  AccountInfo,
  BalanceResponse,
  PaginatedResponse,
} from "@/types/statement";
import { fetchApi } from "@/utils/apiClient";
import { getCachedTransactions, setCachedTransactions, invalidateCache } from "./statementCache";

const DEFAULT_PAGE_SIZE = 25;

function buildStatementUrl(
  accountId: string,
  page: number,
  pageSize: number,
  filters?: TransactionFilters
): string {
  let url = `/account/${accountId}/statement`;
  const params = new URLSearchParams();

  if (filters?.dateRange?.startDate) {
    params.append("startDate", filters.dateRange.startDate.toISOString());
  }
  if (filters?.dateRange?.endDate) {
    params.append("endDate", filters.dateRange.endDate.toISOString());
  }

  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  return url;
}

function processTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

function createPagination(
  serverPagination: StatementResponse["result"]["pagination"] | undefined,
  page: number,
  pageSize: number,
  transactionsCount: number
) {
  return (
    serverPagination || {
      page,
      pageSize,
      total: transactionsCount,
      totalPages: Math.ceil(transactionsCount / pageSize),
    }
  );
}

function calculateHasMore(
  pagination: { page: number; totalPages: number },
  transactionsCount: number
): boolean {
  return pagination.page < pagination.totalPages && transactionsCount > 0;
}

export async function fetchAccount(): Promise<AccountInfo> {
  try {
    const response = await fetchApi(`/account`);
    const data: AccountResponse = await response.json();

    if (!data.result.account || data.result.account.length === 0) {
      throw new Error("Conta não encontrada");
    }

    return data.result.account[0];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Erro ao buscar conta");
  }
}

export async function fetchBalance(accountId: string): Promise<Balance> {
  try {
    const response = await fetchApi(`/account/${accountId}/balance`);
    const data: BalanceResponse = await response.json();
    return data.result.balance;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Erro ao buscar saldo");
  }
}

export async function fetchTransactions(
  accountId: string,
  filters?: TransactionFilters,
  useCache = true
): Promise<PaginatedResponse<Transaction>> {
  const page = filters?.pagination?.page ?? 1;
  const pageSize = filters?.pagination?.pageSize ?? DEFAULT_PAGE_SIZE;

  if (useCache) {
    const startDate = filters?.dateRange?.startDate || null;
    const endDate = filters?.dateRange?.endDate || null;
    const cached = getCachedTransactions(accountId, startDate, endDate, page, pageSize);
    if (cached) {
      return cached;
    }
  }

  try {
    const url = buildStatementUrl(accountId, page, pageSize, filters);
    const response = await fetchApi(url);
    const data: StatementResponse = await response.json();

    const transactions = data.result.transactions || [];
    const sortedTransactions = processTransactions(transactions);
    const pagination = createPagination(
      data.result.pagination,
      page,
      pageSize,
      sortedTransactions.length
    );
    const hasMore = calculateHasMore(pagination, sortedTransactions.length);

    const result: PaginatedResponse<Transaction> = {
      data: sortedTransactions,
      pagination: {
        ...pagination,
        hasMore,
      },
    };

    if (useCache) {
      const startDate = filters?.dateRange?.startDate || null;
      const endDate = filters?.dateRange?.endDate || null;
      setCachedTransactions(
        accountId,
        result.data,
        startDate,
        endDate,
        page,
        pageSize,
        pagination.total
      );
    }

    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Erro ao buscar transações");
  }
}

export function clearStatementCache(accountId: string): void {
  invalidateCache(accountId);
}
