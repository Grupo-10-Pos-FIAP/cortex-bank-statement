import { useState, useCallback, useMemo } from "react";
import {
  InfiniteScrollConfig,
  InfiniteScrollInfo,
  defaultInfiniteScrollConfig,
} from "@/types/statement";

interface UseInfiniteScrollReturn {
  currentBatch: number;
  batchSize: number;
  totalBatches: number;
  hasMore: boolean;
  isEmpty: boolean;
  hasReachedEnd: boolean;
  setBatchSize: (_size: number) => void;
  loadMore: () => void;
  reset: () => void;
  scrollInfo: InfiniteScrollInfo;
}

export function useInfiniteScroll(
  totalItems: number,
  initialConfig?: Partial<InfiniteScrollConfig>,
  isLoading?: boolean
): UseInfiniteScrollReturn {
  const [scrollConfig, setScrollConfig] = useState<InfiniteScrollConfig>(() => ({
    ...defaultInfiniteScrollConfig,
    ...initialConfig,
  }));

  const totalBatches = useMemo(() => {
    if (scrollConfig.batchSize <= 0) return 0;
    return Math.ceil(totalItems / scrollConfig.batchSize);
  }, [totalItems, scrollConfig.batchSize]);

  const hasMore = useMemo(() => {
    return scrollConfig.currentBatch < totalBatches;
  }, [scrollConfig.currentBatch, totalBatches]);

  const isEmpty = useMemo(() => {
    return totalItems === 0 && !isLoading;
  }, [totalItems, isLoading]);

  const hasReachedEnd = useMemo(() => {
    // Mostra mensagem quando não há mais itens para carregar, há itens disponíveis,
    // não está carregando, e o usuário já visualizou todos os itens carregados
    return !hasMore && totalItems > 0 && !isLoading;
  }, [hasMore, totalItems, isLoading]);

  const setBatchSize = useCallback((_size: number) => {
    if (_size > 0) {
      setScrollConfig((prev) => ({
        ...prev,
        batchSize: _size,
        currentBatch: 1,
      }));
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setScrollConfig((prev) => ({
        ...prev,
        currentBatch: prev.currentBatch + 1,
      }));
    }
  }, [hasMore]);

  const reset = useCallback(() => {
    setScrollConfig((prev) => ({
      ...prev,
      currentBatch: 1,
    }));
  }, []);

  const scrollInfo: InfiniteScrollInfo = useMemo(
    () => ({
      currentBatch: scrollConfig.currentBatch,
      batchSize: scrollConfig.batchSize,
      totalBatches,
      totalItems,
      hasMore,
      isEmpty,
      hasReachedEnd,
    }),
    [scrollConfig, totalBatches, totalItems, hasMore, isEmpty, hasReachedEnd]
  );

  return {
    currentBatch: scrollConfig.currentBatch,
    batchSize: scrollConfig.batchSize,
    totalBatches,
    hasMore,
    isEmpty,
    hasReachedEnd,
    setBatchSize,
    loadMore,
    reset,
    scrollInfo,
  };
}
