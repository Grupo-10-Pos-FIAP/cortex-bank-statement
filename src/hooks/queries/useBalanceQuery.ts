import { useQuery } from "@tanstack/react-query";
import { fetchBalance } from "@/api/statement.api";
import { Balance } from "@/types/statement";
import { classifyError, AppError } from "@/utils/errorHandler";

export function useBalanceQuery(accountId: string | null) {
  return useQuery<Balance, AppError>({
    queryKey: ["balance", accountId],
    queryFn: async () => {
      if (!accountId) {
        throw new Error("Account ID is required");
      }
      try {
        return await fetchBalance(accountId);
      } catch (error) {
        throw classifyError(error);
      }
    },
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false,
  });
}
