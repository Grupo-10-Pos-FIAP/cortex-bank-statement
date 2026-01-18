import React, { useState, useMemo, useCallback } from "react";
import { Card } from "@grupo10-pos-fiap/design-system";
import { useStatementQuery } from "@/hooks/useStatementQuery";
import { useStatementFilters } from "@/hooks/useStatementFilters";
import { useSearch } from "@/hooks/useSearch";
import StatementHeader from "@/components/StatementHeader";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import TransactionList from "@/components/TransactionList";
import styles from "./Statement.module.css";

interface StatementProps {
  accountId: string | null;
}

function Statement({ accountId }: StatementProps) {
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

  if (!accountId) {
    return (
      <Card title="Extrato" variant="elevated" color="white">
        <Card.Section>
          <p>Conta não encontrada</p>
        </Card.Section>
      </Card>
    );
  }

  return (
    <div className={styles.statement}>
      <StatementHeader
        balance={statement.balance}
        isVisible={isBalanceVisible}
        onToggleVisibility={handleToggleBalanceVisibility}
        loading={statement.loading && !statement.balance}
      />

      <Card title="Extrato" variant="elevated" color="white" className={styles.card}>
        <Card.Section className={styles.filtersSection}>
          <div className={styles.searchWrapper}>
            <Search
              value={search.searchQuery}
              onChange={search.setSearchQuery}
              placeholder="Buscar por nome, valor ou ID..."
            />
          </div>
          <Filters
            filters={filters.filters}
            onDateRangeChange={filters.updateDateRange}
            onTransactionTypeChange={filters.updateTransactionType}
            onValueRangeChange={filters.updateValueRange}
            onReset={filters.resetFilters}
            activeFiltersCount={filters.activeFiltersCount}
          />
        </Card.Section>

        <Card.Section className={styles.content}>
          <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
            {statement.loading &&
              statement.filteredTransactions.length === 0 &&
              "Carregando transações"}
            {statement.error && `Erro: ${statement.error.message}`}
            {!statement.loading &&
              !statement.error &&
              `${statement.filteredTransactions.length} transações exibidas`}
          </div>
          <TransactionList
            transactions={statement.filteredTransactions}
            loading={statement.loading}
            error={statement.error}
            onLoadMore={handleLoadMore}
            onRetry={handleRetry}
            isEmpty={
              statement.filteredTransactions.length === 0 &&
              !statement.loading &&
              !statement.pagination.hasMore
            }
            hasReachedEnd={hasReachedEnd}
          />
        </Card.Section>
      </Card>
    </div>
  );
}

export default React.memo(Statement);
