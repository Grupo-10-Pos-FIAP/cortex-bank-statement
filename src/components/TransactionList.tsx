import React, { useMemo, useRef } from "react";
import { Text, Loading } from "@grupo10-pos-fiap/design-system";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Transaction, VIRTUALIZATION_THRESHOLD } from "@/types/statement";
import { AppError } from "@/utils/errorHandler";
import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";
import TransactionItem from "./TransactionItem";
import ErrorMessage from "./ErrorMessage";
import styles from "./TransactionList.module.css";

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: AppError | null;
  onLoadMore?: () => void;
  onRetry?: () => void;
  isEmpty?: boolean;
  hasReachedEnd?: boolean;
}

interface InfiniteScrollTriggerProps {
  loading: boolean;
}

const InfiniteScrollTrigger = React.forwardRef<HTMLDivElement, InfiniteScrollTriggerProps>(
  ({ loading }, ref) => {
    return (
      <div
        ref={ref}
        className={styles.infiniteScrollTrigger}
        style={{ minHeight: "80px" }}
        aria-label="Trigger de scroll infinito"
      >
        {loading && <Loading text="Carregando mais transações..." size="small" />}
      </div>
    );
  }
);

InfiniteScrollTrigger.displayName = "InfiniteScrollTrigger";

interface VirtualizedTransactionListProps {
  transactions: Transaction[];
  onLoadMore?: () => void;
  loading?: boolean;
  hasReachedEnd?: boolean;
}

function VirtualizedTransactionList({
  transactions,
  onLoadMore,
  loading = false,
  hasReachedEnd = false,
}: VirtualizedTransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = React.useState<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 5,
  });

  React.useEffect(() => {
    if (parentRef.current) {
      setScrollRoot(parentRef.current);
    }
  }, []);

  const { ref: triggerRef } = useInfiniteScrollTrigger({
    onLoadMore,
    loading,
    enabled: !!onLoadMore && !!scrollRoot,
    root: scrollRoot,
  });

  const totalHeight = useMemo(() => {
    const baseHeight = virtualizer.getTotalSize();
    if (hasReachedEnd) {
      return baseHeight + 200;
    }
    return baseHeight;
  }, [virtualizer, hasReachedEnd]);

  return (
    <div
      ref={parentRef}
      style={{
        height: 600,
        overflow: "auto",
        position: "relative",
        padding: "var(--spacing-sm) 0",
      }}
    >
      <div
        style={{
          height: `${totalHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const transaction = transactions[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                padding: "0 var(--spacing-md)",
              }}
            >
              <TransactionItem transaction={transaction} />
            </div>
          );
        })}
        {hasReachedEnd && (
          <div
            style={{
              position: "absolute",
              top: `${virtualizer.getTotalSize()}px`,
              left: 0,
              right: 0,
              padding: "var(--spacing-md)",
            }}
            className={styles.feedbackMessage}
          >
            Você já visualizou todas as transações disponíveis para este período. Deseja aplicar
            novos filtros?
          </div>
        )}
      </div>
      {onLoadMore && !hasReachedEnd && (
        <div
          ref={triggerRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--spacing-md)",
          }}
        >
          {loading && <Loading text="Carregando mais transações..." size="small" />}
        </div>
      )}
    </div>
  );
}

interface StandardTransactionListProps {
  transactions: Transaction[];
}

function StandardTransactionList({ transactions }: StandardTransactionListProps) {
  return (
    <div className={styles.transactionList}>
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}

function TransactionList({
  transactions,
  loading = false,
  error = null,
  onLoadMore,
  onRetry,
  isEmpty = false,
  hasReachedEnd = false,
}: TransactionListProps) {
  const shouldUseVirtualization = useMemo(() => {
    return transactions.length > VIRTUALIZATION_THRESHOLD;
  }, [transactions.length]);

  const { ref: standardRef } = useInfiniteScrollTrigger({
    onLoadMore,
    loading,
    enabled: !shouldUseVirtualization && !!onLoadMore,
  });

  if (loading && transactions.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Carregando transações..." size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage error={error} onRetry={onRetry} title="Erro ao carregar transações" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={styles.feedbackMessage}>
        Não foram encontradas transações no período selecionado. Que tal aplicar novos filtros e
        tentar novamente?
      </div>
    );
  }

  if (transactions.length === 0 && !loading) {
    return (
      <div className={styles.emptyContainer}>
        <Text variant="body" color="gray600">
          Nenhuma transação encontrada
        </Text>
      </div>
    );
  }

  return (
    <>
      {shouldUseVirtualization ? (
        <VirtualizedTransactionList
          transactions={transactions}
          onLoadMore={onLoadMore}
          loading={loading}
          hasReachedEnd={hasReachedEnd}
        />
      ) : (
        <>
          <StandardTransactionList transactions={transactions} />
          {hasReachedEnd ? (
            <div className={styles.feedbackMessage}>
              Você já visualizou todas as transações disponíveis para este período. Deseja aplicar
              novos filtros?
            </div>
          ) : (
            onLoadMore && <InfiniteScrollTrigger ref={standardRef} loading={loading} />
          )}
        </>
      )}
    </>
  );
}

export default React.memo(TransactionList);
