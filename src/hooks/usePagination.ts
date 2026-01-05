import { useState, useCallback, useMemo } from "react";
import {
  PaginationConfig,
  PaginationInfo,
  PaginationMode,
  defaultPaginationConfig,
} from "@/types/statement";

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  mode: PaginationMode;
  goToPage: (_page: number) => void;
  setPageSize: (_size: number) => void;
  setMode: (_mode: PaginationMode) => void;
  loadMore: () => void;
  paginationInfo: PaginationInfo;
}

export function usePagination(
  totalItems: number,
  initialConfig?: Partial<PaginationConfig>
): UsePaginationReturn {
  const [pagination, setPagination] = useState<PaginationConfig>(() => ({
    ...defaultPaginationConfig,
    ...initialConfig,
  }));

  const totalPages = useMemo(() => {
    if (pagination.pageSize <= 0) return 0;
    return Math.ceil(totalItems / pagination.pageSize);
  }, [totalItems, pagination.pageSize]);

  const hasMore = useMemo(() => {
    return pagination.currentPage < totalPages;
  }, [pagination.currentPage, totalPages]);

  const goToPage = useCallback(
    (_page: number) => {
      if (_page >= 1 && _page <= totalPages) {
        setPagination((prev) => ({
          ...prev,
          currentPage: _page,
        }));
      }
    },
    [totalPages]
  );

  const setPageSize = useCallback((_size: number) => {
    if (_size > 0) {
      setPagination((prev) => ({
        ...prev,
        pageSize: _size,
        currentPage: 1,
      }));
    }
  }, []);

  const setMode = useCallback((_mode: PaginationMode) => {
    setPagination((prev) => ({
      ...prev,
      mode: _mode,
      currentPage: 1,
    }));
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && pagination.mode === "infinite-scroll") {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  }, [hasMore, pagination.mode]);

  const paginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      totalPages,
      totalItems,
      hasMore,
      mode: pagination.mode,
    }),
    [pagination, totalPages, totalItems, hasMore]
  );

  return {
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    totalPages,
    hasMore,
    mode: pagination.mode,
    goToPage,
    setPageSize,
    setMode,
    loadMore,
    paginationInfo,
  };
}
