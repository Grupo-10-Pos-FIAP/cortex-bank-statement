import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@grupo10-pos-fiap/design-system";
import { useStatement } from "@/hooks/useStatement";
import { useStatementFilters } from "@/hooks/useStatementFilters";
import { useSearch } from "@/hooks/useSearch";
import { getLast30DaysStart, getLast30DaysEnd } from "@/utils/dateUtils";
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
  }, [search.debouncedQuery, filters.updateSearchQuery]);

  useEffect(() => {
    if (!filters.filters.dateRange.startDate && !filters.filters.dateRange.endDate) {
      filters.updateDateRange(getLast30DaysStart(), getLast30DaysEnd());
    }
  }, [
    filters.filters.dateRange.startDate,
    filters.filters.dateRange.endDate,
    filters.updateDateRange,
  ]);
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

  // Para scroll infinito visual, podemos manter um slice progressivo
  // Mas agora baseado em filteredTransactions já carregadas do servidor
  const loadedTransactions = useMemo(() => {
    // Mostrar todas as transações filtradas já carregadas
    // O scroll infinito agora é gerenciado pelo loadMore() do hook
    return statement.filteredTransactions;
  }, [statement.filteredTransactions]);

  // Verifica se todos os itens foram carregados/exibidos
  // Considera tanto o fim do servidor quanto se há filtros ativos sem resultados suficientes
  const hasReachedEnd = useMemo(() => {
    // Se não há mais páginas no servidor, chegamos ao fim
    if (!statement.pagination.hasMore) {
      return !statement.loading;
    }

    // Se há filtros client-side ativos e não há resultados visíveis,
    // mas ainda há mais páginas no servidor, continuamos carregando
    // O scroll infinito deve continuar funcionando para encontrar mais resultados
    return false;
  }, [statement.loading, statement.pagination.hasMore]);

  const handleToggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible((prev) => !prev);
  }, []);

  const handleLoadMore = useCallback(() => {
    // Sempre tentar carregar mais se houver mais páginas disponíveis
    // Mesmo com filtros client-side ativos, precisamos carregar mais transações
    // para que os filtros possam encontrar resultados correspondentes
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
              `${loadedTransactions.length} transações exibidas`}
          </div>
          <TransactionList
            transactions={loadedTransactions}
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
