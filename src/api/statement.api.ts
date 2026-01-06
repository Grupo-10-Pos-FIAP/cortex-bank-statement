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

/**
 * Busca informações da conta do usuário
 * Retorna apenas o necessário (AccountInfo)
 */
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

/**
 * Busca transações com paginação server-side
 * Filtros de data são aplicados no servidor
 * Retorna resposta paginada com metadata
 */
export async function fetchTransactions(
  accountId: string,
  filters?: TransactionFilters,
  useCache = true
): Promise<PaginatedResponse<Transaction>> {
  const page = filters?.pagination?.page ?? 1;
  const pageSize = filters?.pagination?.pageSize ?? DEFAULT_PAGE_SIZE;

  // Verificar cache
  if (useCache) {
    const startDate = filters?.dateRange?.startDate || null;
    const endDate = filters?.dateRange?.endDate || null;
    const cached = getCachedTransactions(accountId, startDate, endDate, page, pageSize);
    if (cached) {
      return cached;
    }
  }

  try {
    let url = `/account/${accountId}/statement`;

    const params = new URLSearchParams();

    // Filtros server-side (essenciais para paginação)
    if (filters?.dateRange?.startDate) {
      params.append("startDate", filters.dateRange.startDate.toISOString());
    }
    if (filters?.dateRange?.endDate) {
      params.append("endDate", filters.dateRange.endDate.toISOString());
    }

    // Paginação server-side
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetchApi(url);
    const data: StatementResponse = await response.json();

    const transactions = data.result.transactions || [];

    // Ordenação deve vir do servidor, mas garantimos aqui como fallback
    const sortedTransactions = transactions.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const pagination = data.result.pagination || {
      page,
      pageSize,
      total: sortedTransactions.length,
      totalPages: Math.ceil(sortedTransactions.length / pageSize),
    };

    const result: PaginatedResponse<Transaction> = {
      data: sortedTransactions,
      pagination: {
        ...pagination,
        hasMore: pagination.page < pagination.totalPages,
      },
    };

    // Cache por página
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

/**
 * Invalida cache quando necessário (ex: após nova transação)
 */
export function clearStatementCache(accountId: string): void {
  invalidateCache(accountId);
}
