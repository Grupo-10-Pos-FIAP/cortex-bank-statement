import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@grupo10-pos-fiap/design-system";
import { useStatement } from "@/hooks/useStatement";
import { useStatementFilters } from "@/hooks/useStatementFilters";
import { usePagination } from "@/hooks/usePagination";
import { useSearch } from "@/hooks/useSearch";
import { getLast30DaysStart, getLast30DaysEnd } from "@/utils/dateUtils";
import StatementHeader from "@/components/StatementHeader";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import TransactionList from "@/components/TransactionList";
import PaginationControls from "@/components/PaginationControls";
import Skeleton from "@/components/Skeleton";
import styles from "./Statement.module.css";

interface StatementProps {
  accountId: string | null;
}

function Statement({ accountId }: StatementProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);

  const filters = useStatementFilters();
  const search = useSearch();

  useEffect(() => {
    filters.updateSearchQuery(search.debouncedQuery);
  }, [search.debouncedQuery, filters.updateSearchQuery]);

  useEffect(() => {
    if (!filters.filters.dateRange.startDate && !filters.filters.dateRange.endDate) {
      filters.updateDateRange(getLast30DaysStart(), getLast30DaysEnd());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const memoizedFilters = useMemo(
    () => ({
      ...filters.filters,
      searchQuery: search.debouncedQuery,
    }),
    [
      filters.filters.dateRange.startDate,
      filters.filters.dateRange.endDate,
      filters.filters.transactionType,
      filters.filters.valueRange.min,
      filters.filters.valueRange.max,
      search.debouncedQuery,
    ]
  );

  const statement = useStatement({
    accountId,
    filters: memoizedFilters,
  });

  const pagination = usePagination(statement.filteredTransactions.length);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;

    if (pagination.mode === "infinite-scroll") {
      return statement.filteredTransactions.slice(0, endIndex);
    }

    return statement.filteredTransactions.slice(startIndex, endIndex);
  }, [
    statement.filteredTransactions,
    pagination.currentPage,
    pagination.pageSize,
    pagination.mode,
  ]);

  const handleToggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible((prev) => !prev);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (pagination.mode === "infinite-scroll" && pagination.hasMore) {
      pagination.loadMore();
    }
  }, [pagination]);

  const handleRetry = useCallback(() => {
    statement.refetch();
  }, [statement]);

  useEffect(() => {
    if (pagination.currentPage !== 1) {
      pagination.goToPage(1);
    }
  }, [
    filters.filters.dateRange.startDate?.getTime(),
    filters.filters.dateRange.endDate?.getTime(),
    filters.filters.transactionType,
    filters.filters.valueRange.min,
    filters.filters.valueRange.max,
    search.debouncedQuery,
    pagination.currentPage,
  ]);

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
              `${paginatedTransactions.length} transações exibidas`}
          </div>
          {statement.loading && statement.filteredTransactions.length === 0 ? (
            <Skeleton type="transaction-list" itemsCount={5} />
          ) : (
            <>
              <TransactionList
                transactions={paginatedTransactions}
                loading={statement.loading}
                error={statement.error}
                mode={pagination.mode}
                onLoadMore={handleLoadMore}
                onRetry={handleRetry}
              />
              <PaginationControls
                paginationInfo={pagination.paginationInfo}
                onPageChange={pagination.goToPage}
                onPageSizeChange={pagination.setPageSize}
                onModeChange={pagination.setMode}
              />
            </>
          )}
        </Card.Section>
      </Card>
    </div>
  );
}

export default React.memo(Statement);
