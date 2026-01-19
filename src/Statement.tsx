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

  const { pagination, loading, filteredTransactions } = statement;
  const { hasMore, page, totalPages } = pagination;

  const hasReachedEnd = useMemo(() => {
    if (loading || filteredTransactions.length === 0) {
      return false;
    }

    return !hasMore || page >= totalPages;
  }, [loading, hasMore, page, totalPages, filteredTransactions.length]);

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
