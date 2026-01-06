import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@grupo10-pos-fiap/design-system";
import { useStatement } from "@/hooks/useStatement";
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

function useStatementEffects(
  filters: ReturnType<typeof useStatementFilters>,
  search: ReturnType<typeof useSearch>
) {
  useEffect(() => {
    filters.updateSearchQuery(search.debouncedQuery);
  }, [search.debouncedQuery, filters]);
}

function Statement({ accountId }: StatementProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);

  const filters = useStatementFilters();
  const search = useSearch();

  const memoizedFilters = useMemo(
    () => ({
      ...filters.filters,
      searchQuery: search.debouncedQuery,
    }),
    [filters.filters, search.debouncedQuery]
  );

  const statement = useStatement({
    accountId,
    filters: memoizedFilters,
  });

  useStatementEffects(filters, search);

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

  const handleLoadMore = useCallback(() => {
    if (statement.pagination.hasMore && !statement.loading) {
      statement.loadMore();
    }
  }, [statement.pagination.hasMore, statement.loading, statement.loadMore]);

  const handleRetry = useCallback(() => {
    statement.refetch();
  }, [statement]);

  if (!accountId) {
    return (
      <Card title="Extrato" variant="elevated" color="base">
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

      <Card title="Extrato" variant="elevated" color="base" className={styles.card}>
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
