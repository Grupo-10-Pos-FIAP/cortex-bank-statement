import { Transaction, StatementResponse } from "@/types/statement";
import { fetchApi } from "@/utils/apiClient";

function buildStatementUrl(accountId: string): string {
  return `/account/${accountId}/statement`;
}

function processTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Busca todas as transações do extrato.
 * Nota: Backend não suporta paginação server-side nem filtros de data.
 * Retorna todas as transações de uma vez, paginação é feita client-side.
 */
export async function fetchTransactions(accountId: string): Promise<Transaction[]> {
  try {
    const url = buildStatementUrl(accountId);
    const response = await fetchApi(url);
    const data: StatementResponse = await response.json();

    const transactions = data.result.transactions || [];
    return processTransactions(transactions);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Erro ao buscar transações");
  }
}
