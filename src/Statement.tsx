import React, { useState, useMemo, useCallback } from "react";
import { useStatementQuery } from "@/hooks/useStatementQuery";
import { useStatementFilters } from "@/hooks/useStatementFilters";
import { useSearch } from "@/hooks/useSearch";
import StatementHeader from "@/components/StatementHeader";
import styles from "./Statement.module.css";
import InvalidAccountCard from "./components/InvalidAccountCard";
import StatementContent from "./components/StatementContent";

interface StatementProps {
  accountId: string | null;
  onRefreshAccount?: () => void;
}

function Statement({ accountId, onRefreshAccount }: StatementProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);

  const filters = useStatementFilters();
  const search = useSearch();

  const memoizedFilters = useMemo(
    () => ({
      ...filters.debouncedFilters,
      searchQuery: search.debouncedQuery,
    }),
    [filters.debouncedFilters, search.debouncedQuery]
  );

  const statement = useStatementQuery({
    accountId,
    filters: memoizedFilters,
  });

  const hasReachedEnd = useMemo(() => {
    if (statement.loading || statement.loadingMore) {
      return false;
    }

    if (statement.filteredTransactions.length === 0) {
      return false;
    }

    if (!statement.pagination.hasMore) {
      return true;
    }

    const isLastPage = statement.pagination.page >= statement.pagination.totalPages;
    if (isLastPage) {
      return true;
    }

    if (
      statement.pagination.total > 0 &&
      statement.allTransactions.length >= statement.pagination.total
    ) {
      return true;
    }

    if (statement.pagination.totalPages === 0 && statement.filteredTransactions.length > 0) {
      return true;
    }

    return false;
  }, [
    statement.loading,
    statement.loadingMore,
    statement.pagination.hasMore,
    statement.pagination.page,
    statement.pagination.totalPages,
    statement.pagination.total,
    statement.filteredTransactions.length,
    statement.allTransactions.length,
  ]);

  const handleToggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible((prev) => !prev);
  }, []);

  const { loadMore: loadMoreTransactions, refetch: refetchStatement } = statement;

  const handleLoadMore = useCallback(() => {
    if (statement.pagination.hasMore && !statement.loading) {
      loadMoreTransactions();
    }
  }, [statement.pagination.hasMore, statement.loading, loadMoreTransactions]);

  const handleRetry = useCallback(() => {
    refetchStatement();
  }, [refetchStatement]);

  if (statement.error) {
    return <InvalidAccountCard handleClick={onRefreshAccount} />;
  }

  return (
    <div className={styles.statement}>
      <StatementHeader
        balance={statement.balance}
        isVisible={isBalanceVisible}
        onToggleVisibility={handleToggleBalanceVisibility}
        loading={statement.loading && !statement.balance}
      />
      <StatementContent
        statement={statement}
        filters={filters}
        search={search}
        handleLoadMore={handleLoadMore}
        handleRetry={handleRetry}
        hasReachedEnd={hasReachedEnd}
        styles={styles}
      />
    </div>
  );
}

export default React.memo(Statement);
