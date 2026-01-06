import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface UseInfiniteScrollTriggerOptions {
  onLoadMore?: () => void;
  loading?: boolean;
  enabled?: boolean;
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number;
}

interface UseInfiniteScrollTriggerReturn {
  ref: (_node?: Element | null) => void;
  inView: boolean;
  isLoadingMore: boolean;
}

export function useInfiniteScrollTrigger({
  onLoadMore,
  loading = false,
  enabled = true,
  root = null,
  rootMargin = "100px",
  threshold = 0,
}: UseInfiniteScrollTriggerOptions): UseInfiniteScrollTriggerReturn {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    root,
    skip: !enabled || !onLoadMore || loading || isLoadingMore,
  });

  // Dispara o carregamento quando o trigger entra em view
  useEffect(() => {
    if (inView && !loading && onLoadMore && !isLoadingMore && enabled) {
      setIsLoadingMore(true);
      onLoadMore();
    }
  }, [inView, loading, onLoadMore, isLoadingMore, enabled]);

  // Reset isLoadingMore quando loading termina ou quando novos itens são carregados
  // Como o scroll infinito é síncrono, resetamos quando loading muda para false
  useEffect(() => {
    if (!loading) {
      setIsLoadingMore(false);
    }
  }, [loading]);

  return {
    ref,
    inView,
    isLoadingMore,
  };
}

