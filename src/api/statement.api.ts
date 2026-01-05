import {
  Transaction,
  Balance,
  TransactionFilters,
  StatementResponse,
  AccountResponse,
  BalanceResponse,
} from "@/types/statement";
import { fetchApi } from "@/utils/apiClient";
import { getCachedTransactions, setCachedTransactions } from "./statementCache";

export async function fetchAccount(): Promise<AccountResponse> {
  try {
    const response = await fetchApi(`/account`);
    const data: AccountResponse = await response.json();
    return data;
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
): Promise<Transaction[]> {
  if (useCache) {
    const startDate = filters?.dateRange?.startDate || null;
    const endDate = filters?.dateRange?.endDate || null;
    const cached = getCachedTransactions(accountId, startDate, endDate);
    if (cached) {
      return cached;
    }
  }

  try {
    let url = `/account/${accountId}/statement`;

    const params = new URLSearchParams();
    if (filters?.dateRange?.startDate) {
      params.append("startDate", filters.dateRange.startDate.toISOString());
    }
    if (filters?.dateRange?.endDate) {
      params.append("endDate", filters.dateRange.endDate.toISOString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetchApi(url);
    const data: StatementResponse = await response.json();

    const transactions = data.result.transactions || [];

    const sortedTransactions = transactions.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    if (useCache) {
      const startDate = filters?.dateRange?.startDate || null;
      const endDate = filters?.dateRange?.endDate || null;
      setCachedTransactions(accountId, sortedTransactions, startDate, endDate);
    }

    return sortedTransactions;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Erro ao buscar transações");
  }
}
