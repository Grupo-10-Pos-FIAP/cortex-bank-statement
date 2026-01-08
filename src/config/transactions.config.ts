/**
 * Constrói a rota para visualizar os detalhes de uma transação
 * @param transactionId - ID da transação
 * @returns Rota relativa para a tela de detalhes da transação
 */
export function getTransactionDetailsUrl(transactionId: string): string {
  return `/transactions?view=details&id=${encodeURIComponent(transactionId)}`;
}

