import React from "react";
import { Card } from "@grupo10-pos-fiap/design-system";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import TransactionList from "@/components/TransactionList";
import { UseStatementQueryReturn } from "@/hooks/useStatementQuery";
import { UseStatementFiltersReturn } from "@/hooks/useStatementFilters";
import { UseSearchReturn } from "@/hooks/useSearch";
import styles from "./Statement.module.css";

type StatementContentProps = {
  statement: UseStatementQueryReturn;
  filters: UseStatementFiltersReturn;
  search: UseSearchReturn;
  handleLoadMore: () => void;
  handleRetry: () => void;
  hasReachedEnd: boolean;
  styles: typeof styles;
};

const StatementContent = (props: StatementContentProps) => {
  const { statement, filters, search, handleLoadMore, handleRetry, hasReachedEnd, styles } = props;
  return (
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
  );
};

export default StatementContent;
