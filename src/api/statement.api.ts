import { Transaction, StatementResponse, AccountResponse, AccountInfo } from "@/types/statement";
import { fetchApi } from "@/utils/apiClient";

function buildStatementUrl(accountId: string): string {
  return `/account/${accountId}/statement`;
}

function processTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
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
